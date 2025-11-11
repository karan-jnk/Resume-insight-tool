# ===== Python base =====
FROM python:3.12-slim AS base

WORKDIR /app

# System deps (optional but useful for PDF libs)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential libc6-dev libffi-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

# Copy backend source
COPY backend /app/backend

# Expose API port
EXPOSE 8000

# Default command
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
