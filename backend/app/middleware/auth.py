import time
from typing import Callable

from fastapi import status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

from app.config.settings import settings
from app.core.security import decode_token, InvalidTokenError


class EnterpriseAuthContextMiddleware(BaseHTTPMiddleware):
    """
    Enterprise authentication middleware.
    """

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        start_time = time.perf_counter()

        # Always allow CORS preflight requests
        if request.method == "OPTIONS":
            return await call_next(request)

        # Public endpoints that do not require authentication
        public_paths = {
            f"{settings.API_V1_PREFIX}/auth/login",
            f"{settings.API_V1_PREFIX}/auth/register",
            f"{settings.API_V1_PREFIX}/auth/refresh",
            f"{settings.API_V1_PREFIX}/auth/forgot-password",
            f"{settings.API_V1_PREFIX}/openapi.json",
            "/openapi.json",
            "/docs",
            "/docs/",
            "/redoc",
            "/redoc/",
            "/health",
            "/test-cors",
        }

        path = request.url.path

        # Allow Swagger, OpenAPI and health endpoints
        if (
            path in public_paths
            or path.startswith("/docs")
            or path.startswith("/redoc")
            or path.startswith(f"{settings.API_V1_PREFIX}/openapi.json")
        ):
            response = await call_next(request)
            self._apply_telemetry_headers(response, start_time)
            return response

        auth_header = request.headers.get("Authorization")

        if not auth_header or not auth_header.startswith("Bearer "):
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={
                    "success": False,
                    "message": "Authorization credentials missing or malformed.",
                    "data": None,
                    "errors": {
                        "auth": "Bearer token protocol required inside request header context."
                    },
                },
            )

        token = auth_header.split(" ", 1)[1]

        try:
            payload = decode_token(token)

            request.state.user_email = payload.get("sub")
            request.state.token_claims = payload

        except InvalidTokenError:
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={
                    "success": False,
                    "message": "Access denied. Authentication token has expired or is invalid.",
                    "data": None,
                    "errors": {
                        "auth": "Signature validation check failed."
                    },
                },
            )

        response = await call_next(request)
        self._apply_telemetry_headers(response, start_time)
        return response

    def _apply_telemetry_headers(
        self,
        response: Response,
        start_time: float,
    ) -> None:
        process_time = time.perf_counter() - start_time
        response.headers["X-Process-Runtime-Ms"] = f"{process_time * 1000:.2f}"
        response.headers["X-Enterprise-Architecture"] = "BusinessOS-AI"