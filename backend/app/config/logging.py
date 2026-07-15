"""
BusinessOS AI - Logging Configuration
--------------------------------------------------------------------------
Centralized, structured logging setup for the entire application.

Provides:
  - A request-scoped correlation ID (via contextvars) so every log line
    emitted while handling a request can be traced back to that request,
    even across repository/service/middleware boundaries.
  - A JSON formatter for production/staging (machine-parseable, ready for
    ingestion by log aggregators such as Datadog, ELK, CloudWatch).
  - A human-readable colored formatter for local development.
  - A single `setup_logging()` entry point, called once from the FastAPI
    lifespan startup hook in `app/main.py`.

No other module should call `logging.basicConfig()` or configure handlers
directly — doing so would conflict with this setup and cause duplicate or
inconsistent log output.
--------------------------------------------------------------------------
"""

import json
import logging
import logging.config
import sys
from contextvars import ContextVar
from datetime import datetime, timezone
from typing import Any, Dict, Optional

from app.config.settings import settings

# ----------------------------------------------------------------------
# Correlation ID context
# ----------------------------------------------------------------------
# Populated per-request by the correlation-ID middleware
# (`app/middleware/correlation.py`) and read here so every log record —
# regardless of which module emitted it — carries the same request
# identifier. ContextVar is safe under asyncio, unlike a plain global,
# because each concurrent request gets its own isolated value.
_correlation_id_ctx: ContextVar[Optional[str]] = ContextVar(
    "correlation_id", default=None
)


def set_correlation_id(correlation_id: str) -> None:
    """Binds a correlation ID to the current async execution context."""
    _correlation_id_ctx.set(correlation_id)


def get_correlation_id() -> Optional[str]:
    """Returns the correlation ID bound to the current context, if any."""
    return _correlation_id_ctx.get()


class CorrelationIdFilter(logging.Filter):
    """
    Injects the current request's correlation ID into every log record.

    Attached to every handler so `record.correlation_id` is always
    available to formatters, even for log lines emitted outside of an
    HTTP request (e.g. startup/shutdown), where it will simply be "-".
    """

    def filter(self, record: logging.LogRecord) -> bool:
        record.correlation_id = get_correlation_id() or "-"
        return True


# ----------------------------------------------------------------------
# Formatters
# ----------------------------------------------------------------------
class JSONFormatter(logging.Formatter):
    """
    Renders log records as single-line JSON objects.

    Used in staging/production so logs can be ingested directly by
    structured log pipelines without brittle regex parsing.
    """

    def format(self, record: logging.LogRecord) -> str:
        payload: Dict[str, Any] = {
            "timestamp": datetime.fromtimestamp(
                record.created, tz=timezone.utc
            ).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "correlation_id": getattr(record, "correlation_id", "-"),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
        }

        if record.exc_info:
            payload["exception"] = self.formatException(record.exc_info)

        # Allow callers to attach arbitrary structured context via
        # `logger.info("message", extra={"extra_fields": {...}})`.
        extra_fields = getattr(record, "extra_fields", None)
        if extra_fields:
            payload.update(extra_fields)

        return json.dumps(payload, default=str)


class HumanReadableFormatter(logging.Formatter):
    """
    Colorized, single-line formatter for local development, where a
    human is reading logs directly in a terminal rather than through a
    log aggregator.
    """

    _COLORS = {
        "DEBUG": "\033[36m",     # cyan
        "INFO": "\033[32m",      # green
        "WARNING": "\033[33m",   # yellow
        "ERROR": "\033[31m",     # red
        "CRITICAL": "\033[41m",  # red background
    }
    _RESET = "\033[0m"

    def format(self, record: logging.LogRecord) -> str:
        color = self._COLORS.get(record.levelname, "")
        correlation_id = getattr(record, "correlation_id", "-")
        base = (
            f"{color}{record.levelname:<8}{self._RESET} "
            f"[{datetime.fromtimestamp(record.created).strftime('%Y-%m-%d %H:%M:%S')}] "
            f"[{correlation_id}] "
            f"{record.name} - {record.getMessage()}"
        )
        if record.exc_info:
            base += "\n" + self.formatException(record.exc_info)
        return base


# ----------------------------------------------------------------------
# Setup entry point
# ----------------------------------------------------------------------
def setup_logging() -> None:
    """
    Configures application-wide logging.

    Must be called exactly once, at process startup (from the FastAPI
    `lifespan` handler in `app/main.py`), before any other module emits
    a log line. Uses `logging.config.dictConfig` rather than
    `basicConfig` so the configuration is explicit, declarative, and
    fully replaces any handlers a third-party library may have already
    attached to the root logger.
    """
    is_production_like = settings.ENVIRONMENT in ("staging", "production")
    formatter_key = "json" if is_production_like else "human"

    logging_config: Dict[str, Any] = {
        "version": 1,
        "disable_existing_loggers": False,
        "filters": {
            "correlation_id": {
                "()": CorrelationIdFilter,
            },
        },
        "formatters": {
            "json": {
                "()": JSONFormatter,
            },
            "human": {
                "()": HumanReadableFormatter,
            },
        },
        "handlers": {
            "console": {
                "class": "logging.StreamHandler",
                "stream": sys.stdout,
                "formatter": formatter_key,
                "filters": ["correlation_id"],
            },
        },
        "root": {
            "level": settings.LOG_LEVEL,
            "handlers": ["console"],
        },
        "loggers": {
            # SQLAlchemy's engine logger is intentionally kept at WARNING
            # by default to avoid flooding logs with every SQL statement;
            # DEBUG mode explicitly opts back into full query logging via
            # the `echo=True` engine setting configured in database.py.
            "sqlalchemy.engine": {
                "level": "WARNING",
                "handlers": ["console"],
                "propagate": False,
            },
            # Uvicorn's own loggers are re-routed through our handlers so
            # access/error logs share the same format and correlation ID
            # behavior as application logs, instead of using uvicorn's
            # default formatting.
            "uvicorn": {
                "level": settings.LOG_LEVEL,
                "handlers": ["console"],
                "propagate": False,
            },
            "uvicorn.access": {
                "level": settings.LOG_LEVEL,
                "handlers": ["console"],
                "propagate": False,
            },
            "uvicorn.error": {
                "level": settings.LOG_LEVEL,
                "handlers": ["console"],
                "propagate": False,
            },
        },
    }

    logging.config.dictConfig(logging_config)

    logging.getLogger(__name__).info(
        "Logging configured (environment=%s, level=%s, formatter=%s)",
        settings.ENVIRONMENT,
        settings.LOG_LEVEL,
        formatter_key,
    )


def get_logger(name: str) -> logging.Logger:
    """
    Returns a named logger for use in application modules.

    Usage:
        from app.core.logging import get_logger
        logger = get_logger(__name__)
        logger.info("User %s logged in", user_id)

    Preferred over calling `logging.getLogger(__name__)` directly so all
    logger creation is discoverable through a single import path, and so
    this module remains the sole place logging behavior is defined.
    """
    return logging.getLogger(name)