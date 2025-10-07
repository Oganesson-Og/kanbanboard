"""Add is_admin column to users

Revision ID: 002_add_is_admin
Revises: 001
Create Date: 2025-10-06 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "002_add_is_admin"
down_revision = "001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add is_admin with a default of 0/False for existing rows
    op.add_column(
        "users",
        sa.Column("is_admin", sa.Boolean(), nullable=True, server_default=sa.text("0")),
    )
    # Ensure all existing rows have an explicit value
    op.execute("UPDATE users SET is_admin = 0 WHERE is_admin IS NULL")


def downgrade() -> None:
    op.drop_column("users", "is_admin")


