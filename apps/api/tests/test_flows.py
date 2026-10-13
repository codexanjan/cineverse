import os
import tempfile
from pathlib import Path

os.environ["DATABASE_URL"] = os.getenv(
    "TEST_DATABASE_URL", "sqlite:///" + str(Path(tempfile.mkdtemp()) / "test.db")
)
os.environ["DATA_DIR"] = str(Path(__file__).resolve().parents[3] / "data")
os.environ["DEMO_MODE"] = "true"
from app.db import Base, engine, Movie
from app.main import app
from app.recommender import rank, encode
from fastapi.testclient import TestClient
import pytest


@pytest.fixture(scope="module")
def client():
    Base.metadata.create_all(engine)
    with TestClient(app) as c:
        yield c


@pytest.fixture
def auth(client):
    return {"X-Demo-Token": client.post("/session/demo").json()["token"]}


def test_catalog_and_health(client):
    assert client.get("/health").json()["movies"] > 9000
    r = client.get("/movies?limit=7").json()
    assert len(r["items"]) == 7
    assert client.get("/movies/99999999").status_code == 404
    assert client.get("/movies?limit=1000").status_code == 422


def test_profiles_preferences_and_exports(client, auth):
    assert client.get("/me/profile").status_code == 401
    body = {
        "name": "Night owl",
        "bio": "Stories after midnight",
        "avatar": "moon",
        "genres": ["Sci-Fi", "Drama"],
        "hide_watched": True,
    }
    assert client.post("/me/profile", json=body, headers=auth).status_code == 200
    assert client.get("/me/profile", headers=auth).json()["bio"] == body["bio"]
    assert (
        client.post("/me/profile", json={**body, "genres": ["invalid"]}, headers=auth).status_code
        == 422
    )
    assert client.post("/me/profile", json={**body, "name": "   "}, headers=auth).status_code == 422
    other = {"X-Demo-Token": client.post("/session/demo").json()["token"]}
    assert client.get("/me/profile", headers=other).json()["name"] == "Movie lover"
    baseline = client.post("/discover", headers=auth, json={"query": "Toy Story"}).json()["items"]
    assert any("Matches your preferred genres" in m["reasons"] for m in baseline)
    mid = baseline[0]["id"]
    client.post(f"/me/movies/{mid}", headers=auth, json={"watched": True})
    assert mid not in [
        m["id"]
        for m in client.post("/discover", headers=auth, json={"query": "Toy Story"}).json()["items"]
    ]
    client.post("/me/profile", headers=auth, json={**body, "hide_watched": False})
    assert mid in [
        m["id"]
        for m in client.post("/discover", headers=auth, json={"query": "Toy Story"}).json()["items"]
    ]
    client.post(f"/me/movies/{mid}", headers=auth, json={"dismissed": True})
    assert mid not in [
        m["id"]
        for m in client.post("/discover", headers=auth, json={"query": "Toy Story"}).json()["items"]
    ]
    export = client.get("/me/export", headers=auth)
    assert export.headers["cache-control"] == "private, no-store"
    assert export.json()["profile"]["name"] == "Night owl"
    assert export.json()["collection"][0]["dismissed"]


def test_password_change_revokes_other_sessions(client, monkeypatch):
    import uuid

    monkeypatch.delenv("SUPABASE_URL", raising=False)
    body = {"email": f"password-{uuid.uuid4()}@example.com", "password": "original-test-password"}
    with TestClient(app) as one, TestClient(app) as two:
        assert one.post("/auth/signup", json=body).status_code == 200
        assert two.post("/auth/login", json=body).status_code == 200
        assert (
            one.post(
                "/auth/password",
                json={"current_password": "wrong", "new_password": "replacement-test-password"},
            ).status_code
            == 401
        )
        assert (
            one.post(
                "/auth/password",
                json={
                    "current_password": body["password"],
                    "new_password": "replacement-test-password",
                },
            ).status_code
            == 200
        )
        assert two.get("/me").status_code == 401
        assert one.get("/me").status_code == 200
        one.post("/auth/logout", json={})
        assert one.post("/auth/login", json=body).status_code == 401
        assert (
            one.post(
                "/auth/login", json={**body, "password": "replacement-test-password"}
            ).status_code
            == 200
        )


def test_categories_and_filters(client, auth):
    categories = client.get("/categories").json()["items"]
    assert len(categories) >= 18
    assert all(c["count"] > 0 for c in categories)
    result = client.get(
        "/movies?genre=Comedy&year_from=1990&year_to=1999&max_runtime=120&min_score=3&sort=rating"
    ).json()
    assert result["items"]
    assert all(
        "Comedy" in m["genres"]
        and 1990 <= m["year"] <= 1999
        and 0 < m["runtime"] <= 120
        and m["score"] >= 3
        for m in result["items"]
    )
    scores = [m["score"] for m in result["items"]]
    assert scores == sorted(scores, reverse=True)
    picks = client.post(
        "/discover",
        headers=auth,
        json={
            "mood": "Comfort",
            "genre": "Comedy",
            "year_from": 1990,
            "year_to": 1999,
            "max_runtime": 120,
            "min_score": 3,
        },
    ).json()["items"]
    assert picks and all(
        "Comedy" in m["genres"]
        and 1990 <= m["year"] <= 1999
        and m["runtime"] <= 120
        and m["score"] >= 3
        for m in picks
    )


def test_local_accounts_and_journal(client, monkeypatch):
    import uuid
    from app.db import Session, Account
    from sqlalchemy import select

    monkeypatch.delenv("SUPABASE_URL", raising=False)
    body = {
        "email": f"test-{uuid.uuid4()}@example.com",
        "password": "a-long-test-password",
        "name": "Film fan",
    }
    with TestClient(app) as signed:
        response = signed.post("/auth/signup", json=body)
        assert response.status_code == 200
        assert "httponly" in response.headers["set-cookie"].lower()
        with Session() as db:
            account = db.scalar(select(Account).where(Account.email == body["email"]))
            assert body["password"] not in account.password
        assert signed.post("/auth/signup", json=body).status_code == 409
        uid = signed.get("/me").json()["user_id"]
        assert (
            signed.post("/me/movies/1", json={"watched": True, "watchlist": True}).status_code
            == 200
        )
        assert (
            signed.post(
                "/me/movies/1", json={"favorite": True}, headers={"Origin": "https://evil.test"}
            ).status_code
            == 403
        )
        assert signed.post("/auth/logout", json={}).status_code == 200
        assert signed.get("/me").status_code == 401
        assert (
            signed.post("/auth/login", json={**body, "password": "wrong-password"}).status_code
            == 401
        )
        assert signed.post("/auth/login", json=body).status_code == 200
        profile = signed.get("/me").json()
        assert profile["user_id"] == uid
        assert profile["items"][0]["watched"] and profile["items"][0]["watchlist"]
        assert client.get("/me").status_code == 401
        signed.post("/auth/logout", json={})
    monkeypatch.setenv("DEMO_MODE", "false")
    assert client.post("/auth/login", json=body).status_code == 404


def test_identity_isolation(client, auth):
    assert client.post("/me/movies/1", json={"rating": 4}).status_code == 401
    assert (
        client.post(
            "/me/movies/1", headers=auth, json={"watchlist": True, "rating": 4.5}
        ).status_code
        == 200
    )
    assert client.get("/me", headers=auth).json()["items"][0]["rating"] == 4.5
    other = {"X-Demo-Token": client.post("/session/demo").json()["token"]}
    assert client.get("/me", headers=other).json()["items"] == []
    assert client.post("/me/movies/1", headers=auth, json={"favorite": True}).status_code == 200
    saved = client.get("/me", headers=auth).json()["items"][0]
    assert saved["watchlist"] and saved["rating"] == 4.5 and saved["favorite"]
    assert client.post("/me/movies/1", headers=auth, json={"rating": 6}).status_code == 422
    assert client.get("/admin/analytics", headers=auth).status_code == 403


def test_discovery_modes(client, auth):
    for mode in ("discover", "gems", "pick", "mystery"):
        r = client.post("/discover", headers=auth, json={"mode": mode, "mood": "Wonder"})
        assert r.status_code == 200 and len(r.json()["items"]) > 0
    assert len(client.post("/discover", headers=auth, json={"mode": "pick"}).json()["items"]) == 1
    r = client.post("/discover", headers=auth, json={"fusion": [1, 260]})
    assert all(m["id"] not in (1, 260) for m in r.json()["items"])


def test_group(client, auth):
    r = client.post("/group", headers=auth, json={"favorites": [[1, 260], [318, 296]]})
    assert r.status_code == 200 and len(r.json()["items"]) == 24
    assert not {1, 260, 318, 296} & {m["id"] for m in r.json()["items"]}
    assert client.post("/group", headers=auth, json={"favorites": [[], [1]]}).status_code == 422


def test_hard_constraints():
    ms = [
        Movie(
            id=1,
            title="Space",
            genres=["Sci-Fi"],
            runtime=110,
            score=4,
            votes=40,
            embedding=encode(["space"])[0],
        ),
        Movie(
            id=2,
            title="Scary",
            genres=["Horror"],
            runtime=90,
            score=5,
            votes=40,
            embedding=encode(["scary"])[0],
        ),
        Movie(
            id=3,
            title="Long",
            genres=["Drama"],
            runtime=180,
            score=4,
            votes=20,
            embedding=encode(["long"])[0],
        ),
        Movie(
            id=4,
            title="Unknown",
            genres=["Drama"],
            runtime=None,
            score=4,
            votes=20,
            embedding=encode(["unknown"])[0],
        ),
    ]
    assert [m.id for m, _, _ in rank(ms, [], query="under 2 hours no horror")] == [1]


def test_bad_auth(client):
    assert client.get("/me", headers={"Authorization": "Bearer forged"}).status_code == 401


def test_concurrent_feedback_preserves_fields(client, auth):
    from concurrent.futures import ThreadPoolExecutor

    with ThreadPoolExecutor(max_workers=2) as pool:
        futures = [
            pool.submit(client.post, "/me/movies/260", headers=auth, json=body)
            for body in ({"rating": 4.5}, {"watchlist": True})
        ]
        assert all(f.result().status_code == 200 for f in futures)
    saved = next(
        i for i in client.get("/me", headers=auth).json()["items"] if i["movie"]["id"] == 260
    )
    assert saved["watchlist"] and saved["rating"] == 4.5


def test_live_catalog_falls_back_without_credentials(client, auth, monkeypatch):
    monkeypatch.delenv("TMDB_TOKEN", raising=False)
    response = client.get("/catalog/live?q=Toy%20Story", headers=auth)
    assert response.status_code == 200
    assert response.json()["source"] == "local"
    assert any(m["id"] == 1 for m in response.json()["items"])


def test_production_auth_and_admin_allowlist(client, monkeypatch):
    import app.main as main
    import httpx

    monkeypatch.setattr(main, "DEMO", False)
    assert client.post("/session/demo").status_code == 404
    assert client.get("/me", headers={"X-Demo-Token": "a" * 64}).status_code == 401
    monkeypatch.setenv("SUPABASE_URL", "https://auth.example.test")
    monkeypatch.setenv("SUPABASE_PUBLISHABLE_KEY", "test-publishable-key")
    monkeypatch.setattr(
        main.httpx,
        "get",
        lambda *a, **k: httpx.Response(
            200, json={"id": "verified-user", "user_metadata": {"role": "admin"}}
        ),
    )
    headers = {"Authorization": "Bearer test-token"}
    assert client.get("/me", headers=headers).json()["user_id"] == "verified-user"
    assert client.get("/admin/analytics", headers=headers).status_code == 403
    monkeypatch.setenv("ADMIN_USER_IDS", "verified-user")
    assert client.get("/admin/analytics", headers=headers).status_code == 200
    monkeypatch.setattr(
        main.httpx, "get", lambda *a, **k: httpx.Response(401, json={"error": "invalid"})
    )
    assert client.get("/me", headers=headers).status_code == 401


def test_tmdb_live_import_is_idempotent(client, monkeypatch):
    import app.catalog as catalog
    from sqlalchemy import select
    from app.db import Session

    monkeypatch.setenv("TMDB_TOKEN", "test-server-only")

    class FakeClient:
        def __init__(self, **kwargs):
            pass

        def __enter__(self):
            return self

        def __exit__(self, *args):
            pass

        def get(self, *args, **kwargs):
            import httpx

            return httpx.Response(
                200,
                request=httpx.Request("GET", "https://api.themoviedb.org/3/search/movie"),
                json={
                    "results": [
                        {
                            "id": 999999999,
                            "title": "Test import",
                            "genre_ids": [878],
                            "overview": "A space adventure",
                            "release_date": "2026-01-01",
                            "vote_average": 8,
                            "vote_count": 10,
                            "adult": False,
                        }
                    ]
                },
            )

    monkeypatch.setattr(catalog.httpx, "Client", FakeClient)
    assert catalog.live_search("test") == [-999999999]
    assert catalog.live_search("test") == [-999999999]
    with Session() as db:
        rows = db.scalars(select(Movie).where(Movie.tmdb_id == 999999999)).all()
        assert len(rows) == 1 and rows[0].score == 4
        db.delete(rows[0])
        db.commit()


def test_postgres_vector_contract():
    import numpy as np
    from sqlalchemy import select
    from sqlalchemy.dialects import postgresql

    statement = select(Movie.id).order_by(Movie.embedding.cosine_distance([0.1] * 384))
    assert "<=>" in str(statement.compile(dialect=postgresql.dialect()))
    m = Movie(
        id=1,
        title="Space",
        genres=["Sci-Fi"],
        runtime=90,
        score=4,
        votes=20,
        embedding=np.array(encode(["space"])[0]),
    )
    assert rank([m], [], query="space")[0][0].id == 1
