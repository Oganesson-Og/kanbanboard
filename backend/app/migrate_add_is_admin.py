#!/usr/bin/env python3
"""
Migration script to add is_admin column to users table for existing databases.
Run this script once to update your database schema.

Usage:
    python -m app.migrate_add_is_admin
"""

from sqlalchemy import text
from .database import SessionLocal, engine
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def migrate_add_is_admin():
    """Add is_admin column to users table if it doesn't exist."""
    db = SessionLocal()
    try:
        # Check if column exists
        result = db.execute(text("PRAGMA table_info(users)"))
        columns = [row[1] for row in result.fetchall()]
        
        if 'is_admin' in columns:
            logger.info("✅ is_admin column already exists in users table")
            return
        
        logger.info("🔧 Adding is_admin column to users table...")
        
        # Add the column with default value False
        db.execute(text("ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT 0"))
        db.commit()
        
        logger.info("✅ Successfully added is_admin column to users table")
        logger.info("ℹ️  All existing users have is_admin=False by default")
        logger.info("💡 To create an admin user, use the seed_admin script or run:")
        logger.info("   python -m app.seed_admin")
        
    except Exception as e:
        logger.error(f"❌ Migration failed: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    migrate_add_is_admin()
