from alembic import op

revision = "0002"
down_revision = "0001"
branch_labels = None
depends_on = None


def upgrade():
    op.create_index("ix_movies_tmdb_id", "movies", ["tmdb_id"])


def downgrade():
    op.drop_index("ix_movies_tmdb_id", table_name="movies")
