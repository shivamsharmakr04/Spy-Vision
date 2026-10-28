"""Persist zone sensitivity settings.

Revision ID: 20261028_zone_sensitivity
Revises: 6a81579fda10
"""

from alembic import op
import sqlalchemy as sa


revision = "20261028_zone_sensitivity"
down_revision = "6a81579fda10"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "zones",
        sa.Column("sensitivity", sa.Float(), nullable=False, server_default="0.85"),
    )


def downgrade() -> None:
    op.drop_column("zones", "sensitivity")
