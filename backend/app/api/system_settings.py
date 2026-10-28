from fastapi import APIRouter, Depends
from typing import Dict, Any
from app.models.user import User
from app.dependencies.auth import get_current_active_user

router = APIRouter(tags=["Settings"])

_settings_state: Dict[str, Any] = {
    "general": {
        "companyName": "Northwind Traders Enterprise",
        "supportEmail": "support@northwind.com",
        "timezone": "America/New_York",
        "dateFormat": "YYYY-MM-DD",
        "currency": "USD"
    },
    "security": {
        "mfaRequired": False,
        "passwordExpiryDays": 90,
        "sessionTimeoutMinutes": 60,
        "allowedIpRanges": []
    },
    "notifications": {
        "emailEnabled": True,
        "slackIntegration": False,
        "webhookUrl": ""
    },
    "features": {
        "aiEnabled": True,
        "workflowsEnabled": True,
        "clientPortalEnabled": True
    }
}


@router.get("/settings")
async def get_system_settings(
    current_user: User = Depends(get_current_active_user)
):
    return {"success": True, "data": _settings_state}


@router.patch("/settings")
async def update_system_settings(
    payload: Dict[str, Any],
    current_user: User = Depends(get_current_active_user)
):
    global _settings_state
    for k, v in payload.items():
        if k in _settings_state and isinstance(v, dict):
            _settings_state[k].update(v)
        else:
            _settings_state[k] = v
    return {"success": True, "data": _settings_state}
