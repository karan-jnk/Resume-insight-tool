from sqlalchemy import Column, String, DateTime, Text
from sqlalchemy.types import TypeDecorator
from datetime import datetime
import json
from .database import Base


class JSONType(TypeDecorator):
    """Custom JSON column for SQLite (stores as TEXT but behaves like dict)."""
    impl = Text

    def process_bind_param(self, value, dialect):
        if value is None:
            return None
        return json.dumps(value)  # serialize dict → string

    def process_result_value(self, value, dialect):
        if value is None:
            return None
        try:
            return json.loads(value)  # deserialize string → dict
        except Exception:
            return value


class Document(Base):
    __tablename__ = "documents"

    id = Column(String, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    upload_time = Column(DateTime, default=datetime.utcnow)
    insights = Column(JSONType, nullable=False)  # ✅ Behaves like JSON
