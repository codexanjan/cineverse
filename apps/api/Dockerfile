FROM python:3.12-slim
WORKDIR /app/apps/api
COPY apps/api/requirements.lock.txt ./requirements.lock.txt
RUN pip install --no-cache-dir -r requirements.lock.txt
COPY apps/api .
COPY data /app/data
ENV DATA_DIR=/app/data MODEL_PATH=/app/data/model.npz
EXPOSE 8000
CMD ["sh","-c","alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000"]
