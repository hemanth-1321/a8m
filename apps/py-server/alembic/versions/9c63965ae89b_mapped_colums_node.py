"""mapped_colums_node

Revision ID: 9c63965ae89b
Revises: 2cb2be8afc98
Create Date: 2025-09-20 12:18:33.030360

"""
from typing import Sequence, Union
from sqlalchemy.dialects import postgresql
from alembic import op
import sqlalchemy as sa



# revision identifiers, used by Alembic.
revision: str = '9c63965ae89b'
down_revision: Union[str, Sequence[str], None] = '2cb2be8afc98'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    """Upgrade schema."""
    # Convert source_node_id and target_node_id to UUID using USING
    op.alter_column(
        'edges',
        'source_node_id',
        existing_type=sa.VARCHAR(),
        type_=postgresql.UUID(),
        postgresql_using='source_node_id::uuid',
        existing_nullable=False
    )
    op.alter_column(
        'edges',
        'target_node_id',
        existing_type=sa.VARCHAR(),
        type_=postgresql.UUID(),
        postgresql_using='target_node_id::uuid',
        existing_nullable=False
    )

    # nodes.enabled stays the same
    op.alter_column(
        'nodes', 'enabled',
        existing_type=sa.BOOLEAN(),
        nullable=False
    )


def downgrade() -> None:
    """Downgrade schema."""
    # Revert nodes.enabled
    op.alter_column(
        'nodes', 'enabled',
        existing_type=sa.BOOLEAN(),
        nullable=True
    )

    # Revert UUID columns to VARCHAR
    op.alter_column(
        'edges',
        'target_node_id',
        existing_type=postgresql.UUID(),
        type_=sa.VARCHAR(),
        postgresql_using='target_node_id::text',
        existing_nullable=False
    )
    op.alter_column(
        'edges',
        'source_node_id',
        existing_type=postgresql.UUID(),
        type_=sa.VARCHAR(),
        postgresql_using='source_node_id::text',
        existing_nullable=False
    )