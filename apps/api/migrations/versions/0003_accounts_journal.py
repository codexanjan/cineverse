from alembic import op
import sqlalchemy as sa

revision = "0003"
down_revision = "0002"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "interactions",
        sa.Column("watched", sa.Boolean(), nullable=False, server_default=sa.false()),
    )
    op.create_table(
        "accounts",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("email", sa.String(254), nullable=False, unique=True),
        sa.Column("name", sa.String(80), nullable=False),
        sa.Column("password", sa.String(200), nullable=False),
    )
    op.create_table(
        "account_sessions",
        sa.Column("token_hash", sa.String(64), primary_key=True),
        sa.Column("account_id", sa.String(36), sa.ForeignKey("accounts.id"), nullable=False),
        sa.Column("expires", sa.Integer(), nullable=False),
    )
    if op.get_bind().dialect.name == "postgresql":
        for table in ("accounts", "account_sessions"):
            op.execute(f"ALTER TABLE {table} ENABLE ROW LEVEL SECURITY")


def downgrade():
    op.drop_table("account_sessions")
    op.drop_table("accounts")
    op.drop_column("interactions", "watched")
