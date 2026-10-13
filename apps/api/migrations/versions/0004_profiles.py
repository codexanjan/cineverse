from alembic import op
import sqlalchemy as sa

revision = "0004"
down_revision = "0003"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "interactions",
        sa.Column("dismissed", sa.Boolean(), nullable=False, server_default=sa.false()),
    )
    op.create_table(
        "user_profiles",
        sa.Column("user_id", sa.String(100), primary_key=True),
        sa.Column("name", sa.String(80), nullable=False),
        sa.Column("bio", sa.String(300), nullable=False),
        sa.Column("avatar", sa.String(20), nullable=False),
        sa.Column("genres", sa.JSON(), nullable=False),
        sa.Column("hide_watched", sa.Boolean(), nullable=False),
    )
    if op.get_bind().dialect.name == "postgresql":
        op.execute("ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY")


def downgrade():
    op.drop_table("user_profiles")
    op.drop_column("interactions", "dismissed")
