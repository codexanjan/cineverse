from alembic import op
import sqlalchemy as sa
from pgvector.sqlalchemy import Vector

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    pg = op.get_bind().dialect.name == "postgresql"
    if pg:
        op.execute("CREATE EXTENSION IF NOT EXISTS vector")
    op.create_table(
        "movies",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("title", sa.String(400), nullable=False),
        sa.Column("year", sa.Integer, nullable=False),
        sa.Column("genres", sa.JSON, nullable=False),
        sa.Column("overview", sa.String, nullable=False),
        sa.Column("tmdb_id", sa.Integer),
        sa.Column("poster", sa.String),
        sa.Column("backdrop", sa.String),
        sa.Column("runtime", sa.Integer),
        sa.Column("score", sa.Float, nullable=False),
        sa.Column("votes", sa.Integer, nullable=False),
        sa.Column("embedding", Vector(384) if pg else sa.JSON),
    )
    op.create_index("ix_movies_title", "movies", ["title"])
    op.create_table(
        "interactions",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("user_id", sa.String(100), nullable=False),
        sa.Column("movie_id", sa.Integer, nullable=False),
        sa.Column("rating", sa.Float),
        sa.Column("watchlist", sa.Boolean, nullable=False),
        sa.Column("favorite", sa.Boolean, nullable=False),
        sa.UniqueConstraint("user_id", "movie_id"),
    )
    op.create_index("ix_interactions_user_id", "interactions", ["user_id"])
    op.create_index("ix_interactions_movie_id", "interactions", ["movie_id"])
    op.create_table(
        "events",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("user_id", sa.String(100), nullable=False),
        sa.Column("kind", sa.String(40), nullable=False),
        sa.Column("movie_id", sa.Integer),
    )
    op.create_index("ix_events_user_id", "events", ["user_id"])
    if pg:
        op.execute(
            "CREATE INDEX movies_embedding_hnsw ON movies USING hnsw (embedding vector_cosine_ops)"
        )
        for table in ("movies", "interactions", "events"):
            op.execute(f"ALTER TABLE {table} ENABLE ROW LEVEL SECURITY")


def downgrade():
    for table in ("events", "interactions", "movies"):
        op.drop_table(table)
