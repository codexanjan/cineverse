import json
import logging
from redis import Redis
import os
from .catalog import hydrate

logging.basicConfig(level=logging.INFO)
r = Redis.from_url(os.getenv("REDIS_URL", "redis://localhost:6379"))
while True:
    job = r.brpoplpush("cineverse:jobs", "cineverse:processing", timeout=10)
    if not job:
        continue
    try:
        body = json.loads(job)
        if body["kind"] == "hydrate":
            logging.info(hydrate(body.get("limit", 500)))
        r.lrem("cineverse:processing", 1, job)
        for key in r.scan_iter("catalog:*"):
            r.delete(key)
    except Exception:
        logging.exception("Job failed; moved to dead-letter queue")
        r.lpush("cineverse:failed", job)
        r.lrem("cineverse:processing", 1, job)
