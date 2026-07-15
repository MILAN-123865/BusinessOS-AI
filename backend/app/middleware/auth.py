import time
from typing import Callable
from fastapi import status
from fastapi.responses import JSONResponse
from jose import jwt, JWTError
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

from app.core.config import settings


class EnterpriseAuthContextMiddleware(BaseHTTPMiddleware):
    """
    High-performance ASGI middleware executing early HTTP request interception.
    Extracts authorization details early to populate telemetry parameters,
    benchmarks processing duration metrics, and drops malformed traffic at the threshold.
    """
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        start_time = time.perf_counter()
        
        # Bypass structural evaluation rules for public framework endpoints (docs, health check, login)
        public_paths = [
            f"{settings.API_V1_STR}/auth/login",
            f"{settings.API_V1_STR}/auth/register",
            f"{settings.API_V1_STR}/auth/forgot-password",
            "/docs",
            "/redoc",
            "/openapi.json"
        ]
        
        if request.url.path in public_paths or not request.url.path.startswith(settings.API_V1_STR):
            response = await call_next(request)
            self._apply_telemetry_headers(response, start_time)
            return response

        auth_header = request.headers.get("Authorization")
        
        # Early-intercept missing tokens for protected routes to minimize downstream database execution loads
        if not auth_header or not auth_header.startswith("Bearer "):
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={
                    "success": False,
                    "message": "Authorization credentials missing or malformed.",
                    "data": None,
                    "errors": {"auth": "Bearer token protocol required inside request header context."}
                }
            )

        token = auth_header.split(" ")[1]
        
        try:
            # Quick cryptographic signature check at the perimeter. 
            # Deep user status and permission resolutions remain delegated to route injection parameters.
            payload = jwt.decode(
                token, 
                settings.JWT_SECRET_KEY, 
                algorithms=[settings.JWT_ALGORITHM]
            )
            # Inject parsed identity information directly into the request state scope for down-funnel usage
            request.state.user_email = payload.get("sub")
            request.state.token_claims = payload
            
        except JWTError:
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={
                    "success": False,
                    "message": "Access denied. Authentication token has expired or is invalid.",
                    "data": None,
                    "errors": {"auth": "Signature validation check failed."}
                }
            )

        response = await call_next(request)
        self._apply_telemetry_headers(response, start_time)
        return response

    def _apply_telemetry_headers(self, response: Response, start_time: float) -> None:
        """Appends technical tracing metrics to the outbound response structure."""
        process_time = time.perf_counter() - start_time
        response.headers["X-Process-Runtime-Ms"] = f"{process_time * 1000:.2f}"
        response.headers["X-Enterprise-Architecture"] = "BusinessOS-AI"