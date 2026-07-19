from app.api.auth import router as auth_router
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError

from app.config.settings import settings
from app.config.database import (
    init_database,
    close_database_connections,
)
from app.middleware.auth import EnterpriseAuthContextMiddleware
from app.api.user import router as user_router
from app.api.dashboard import router as dashboard_router
from app.api.organization import router as organization_router
from app.api.department import router as department_router
from app.api.role import router as role_router
from app.api.client import router as client_router
from app.api.project import router as project_router
from app.api.task import router as task_router
from app.api.calendar import router as calendar_router
from app.api.meeting import router as meeting_router
from app.api.analytics import router as analytics_router
from app.api.document import router as document_router
from app.api.ai import router as ai_router
from app.api.workflow import router as workflow_router

# Setup structured logging configuration
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)


# ==============================================================================
# LIFECYCLE (STARTUP / SHUTDOWN) MANAGEMENT
# ==============================================================================
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing BusinessOS AI Enterprise Engine Lifespan...")
    await init_database()

    yield

    logger.info("De-provisioning BusinessOS AI Enterprise Engine Lifespan...")
    await close_database_connections()


# ==============================================================================
# FASTAPI INSTANTIATION
# ==============================================================================
app = FastAPI(
    title=settings.APP_NAME,
    description="Production-grade AI-powered Enterprise Business Operating System.",
    version="1.0.0",
    openapi_url=f"{settings.API_V1_PREFIX}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

@app.get("/test-cors")
def get_cors():
    from app.config.settings import settings
    return {"cors": settings.CORS_ALLOWED_ORIGINS}



# ==============================================================================
# GLOBAL MIDDLEWARE CONFIGURATIONS
# ==============================================================================
# 1. Standard Cross-Origin Resource Sharing Rules
# NOTE: settings.py exposes CORS_ALLOWED_ORIGINS / CORS_ALLOW_CREDENTIALS —
# the previous `BACKEND_CORS_ORIGINS` attribute does not exist and raised
# AttributeError at import time.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ALLOWED_ORIGINS,
    allow_credentials=settings.CORS_ALLOW_CREDENTIALS,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Early HTTP Request Identity Telemetry Interceptor
app.add_middleware(EnterpriseAuthContextMiddleware)


# ==============================================================================
# GLOBAL EXCEPTION HANDLERS
# ==============================================================================
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    """Catches Pydantic parsing flaws and maps them cleanly into the global envelope."""
    logger.error(f"Input Validation Failure: {exc.errors()}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "success": False,
            "message": "The request payload failed structural parameter validation requirements.",
            "data": None,
            "errors": jsonable_encoder(exc.errors())
        }
    )


@app.exception_handler(SQLAlchemyError)
async def database_exception_handler(request: Request, exc: SQLAlchemyError) -> JSONResponse:
    """Interceptors to catch unexpected persistent layer transaction failures."""
    logger.critical(f"Database Critical Failure: {str(exc)}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "message": "A severe storage runtime constraint blocked execution parameters.",
            "data": None,
            "errors": {"database": "An internal transactional boundary fault occurred."}
        }
    )


@app.exception_handler(Exception)
async def universal_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Ultimate catch-all fallback preventing trace leaks to public web layers."""
    logger.error(f"Unhandled Application Runtime Exception: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "message": "An unexpected error occurred processing your request on our backend matrix.",
            "data": None,
            "errors": {"system": "Internal platform error."}
        }
    )

# ==============================================================================
# ROUTER BINDINGS
# ==============================================================================
app.include_router(
    auth_router,
    prefix=settings.API_V1_PREFIX
)

app.include_router(
    user_router,
    prefix=settings.API_V1_PREFIX
)

app.include_router(
    dashboard_router,
    prefix=settings.API_V1_PREFIX
)

app.include_router(
    organization_router,
    prefix=settings.API_V1_PREFIX
)

app.include_router(
    department_router,
    prefix=settings.API_V1_PREFIX
)

app.include_router(
    role_router,
    prefix=settings.API_V1_PREFIX
)

app.include_router(
    client_router,
    prefix=settings.API_V1_PREFIX
)

app.include_router(
    project_router,
    prefix=settings.API_V1_PREFIX
)

app.include_router(
    task_router,
    prefix=settings.API_V1_PREFIX
)

app.include_router(
    calendar_router,
    prefix=settings.API_V1_PREFIX
)

app.include_router(
    meeting_router,
    prefix=settings.API_V1_PREFIX
)

app.include_router(
    analytics_router,
    prefix=settings.API_V1_PREFIX
)

app.include_router(
    document_router,
    prefix=settings.API_V1_PREFIX
)

app.include_router(
    ai_router,
    prefix=settings.API_V1_PREFIX
)

app.include_router(
    workflow_router,
    prefix=settings.API_V1_PREFIX
)

@app.get("/health", tags=["System"], status_code=status.HTTP_200_OK)
async def health_check() -> dict:
    """Liveness check probe indicating top-level service operational capacity."""
    return {
        "success": True,
        "message": "BusinessOS AI Core Router is fully operational.",
        "data": {"status": "HEALTHY"},
        "errors": None
    }