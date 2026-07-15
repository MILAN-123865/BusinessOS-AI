import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError

from app.core.config import settings
from app.config.database import init_database, close_database_connections
from app.middleware.auth import EnterpriseAuthContextMiddleware
from app.api.user import router as user_router

# Setup structured logging configuration
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)


# ==============================================================================
# LIFECYCLE (STARTUP / SHUTDOWN) MANAGEMENT
# ==============================================================================
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Handles application state transitions. Initializes backing storage pools
    cleanly before the socket binds, and frees them during zero-downtime recycling.
    """
    logger.info("Initializing BusinessOS AI Enterprise Engine Lifespan...")
    await init_database()
    
    yield  # Application processes requests here
    
    logger.info("De-provisioning BusinessOS AI Enterprise Engine Lifespan...")
    await close_database_connections()


# ==============================================================================
# FASTAPI INSTANTIATION
# ==============================================================================
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Production-grade AI-powered Enterprise Business Operating System.",
    version="1.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)


# ==============================================================================
# GLOBAL MIDDLEWARE CONFIGURATIONS
# ==============================================================================
# 1. Standard Cross-Origin Resource Sharing Rules
app.add_middleware(
    CORSMiddleware,
    allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
    allow_credentials=True,
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
app.include_router(user_router, prefix=settings.API_V1_STR)


@app.get("/health", tags=["System"], status_code=status.HTTP_200_OK)
async def health_check() -> dict:
    """Liveness check probe indicating top-level service operational capacity."""
    return {
        "success": True,
        "message": "BusinessOS AI Core Router is fully operational.",
        "data": {"status": "HEALTHY"},
        "errors": None
    }