"""
app/utils/logger.py
Centralised logging configuration for BidSense AI.
All modules should obtain their logger via get_logger(__name__).
"""

import logging
import sys
import time
from functools import wraps
from typing import Callable, Any

from app.utils.config import settings


def _build_handler() -> logging.StreamHandler:
    handler = logging.StreamHandler(sys.stdout)
    fmt = logging.Formatter(
        fmt="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )
    handler.setFormatter(fmt)
    return handler


def get_logger(name: str) -> logging.Logger:
    """Return a named logger configured at the application log level."""
    logger = logging.getLogger(name)
    if not logger.handlers:
        logger.addHandler(_build_handler())
        logger.setLevel(getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO))
        logger.propagate = False
    return logger


# ── Convenience decorators ────────────────────────────────────────────────

def log_timing(logger: logging.Logger | None = None):
    """Decorator: logs the execution time of the wrapped function."""
    def decorator(fn: Callable) -> Callable:
        _log = logger or get_logger(fn.__module__)

        @wraps(fn)
        async def async_wrapper(*args: Any, **kwargs: Any) -> Any:
            start = time.perf_counter()
            result = await fn(*args, **kwargs)
            elapsed = round((time.perf_counter() - start) * 1000, 1)
            _log.info("⏱  %s completed in %s ms", fn.__name__, elapsed)
            return result

        @wraps(fn)
        def sync_wrapper(*args: Any, **kwargs: Any) -> Any:
            start = time.perf_counter()
            result = fn(*args, **kwargs)
            elapsed = round((time.perf_counter() - start) * 1000, 1)
            _log.info("⏱  %s completed in %s ms", fn.__name__, elapsed)
            return result

        import asyncio
        return async_wrapper if asyncio.iscoroutinefunction(fn) else sync_wrapper

    return decorator
