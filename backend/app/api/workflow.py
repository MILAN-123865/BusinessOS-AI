from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from uuid import UUID, uuid4
from typing import List, Optional
from datetime import datetime, timezone
from app.dependencies.auth import get_current_active_user
from app.models.user import User

router = APIRouter(prefix="/workflows", tags=["Workflows"])

class WorkflowTrigger(BaseModel):
    type: str
    config: dict

class WorkflowAction(BaseModel):
    id: str
    type: str
    config: dict
    nextActionId: Optional[str] = None

class WorkflowResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    status: str
    trigger: WorkflowTrigger
    actions: List[WorkflowAction]
    createdBy: str
    createdAt: str
    updatedAt: str
    lastRunAt: Optional[str] = None
    executionCount: int = 0
    successRate: float = 0.0

class WorkflowListEnvelope(BaseModel):
    success: bool
    message: str
    data: List[WorkflowResponse]
    errors: Optional[dict] = None

class WorkflowEnvelope(BaseModel):
    success: bool
    message: str
    data: WorkflowResponse
    errors: Optional[dict] = None

class UpdateStatusRequest(BaseModel):
    status: str

# In-memory mock workflows for simplicity since there is no Workflow DB model
MOCK_WORKFLOWS = [
    {
        "id": "wf-1",
        "name": "Auto-Assign Engineering Tasks",
        "description": "Automatically assign new tasks with the 'Engineering' tag to the Engineering lead.",
        "status": "ACTIVE",
        "trigger": {"type": "ON_TASK_CREATED", "config": {"tags": ["Engineering"]}},
        "actions": [
            {
                "id": "act-1",
                "type": "ASSIGN_USER",
                "config": {"role": "Engineering Lead"},
                "nextActionId": "act-2"
            },
            {
                "id": "act-2",
                "type": "SEND_NOTIFICATION",
                "config": {"channel": "slack", "message": "New engineering task assigned."},
                "nextActionId": None
            }
        ],
        "createdBy": "admin@example.com",
        "createdAt": datetime.now(timezone.utc).isoformat(),
        "updatedAt": datetime.now(timezone.utc).isoformat(),
        "lastRunAt": datetime.now(timezone.utc).isoformat(),
        "executionCount": 42,
        "successRate": 98.5
    },
    {
        "id": "wf-2",
        "name": "Notify Client on Invoice Paid",
        "description": "Send a thank you email automatically when an invoice status changes to 'Paid'.",
        "status": "ACTIVE",
        "trigger": {"type": "ON_STATUS_CHANGE", "config": {"model": "Invoice", "field": "status", "to": "Paid"}},
        "actions": [
            {
                "id": "act-3",
                "type": "SEND_EMAIL",
                "config": {"template": "invoice_paid_thanks"},
                "nextActionId": None
            }
        ],
        "createdBy": "admin@example.com",
        "createdAt": datetime.now(timezone.utc).isoformat(),
        "updatedAt": datetime.now(timezone.utc).isoformat(),
        "lastRunAt": datetime.now(timezone.utc).isoformat(),
        "executionCount": 115,
        "successRate": 100.0
    }
]

@router.get("", response_model=WorkflowListEnvelope)
async def list_workflows(
    current_user: User = Depends(get_current_active_user)
) -> dict:
    return {
        "success": True,
        "message": "Workflows retrieved successfully.",
        "data": MOCK_WORKFLOWS,
        "errors": None
    }

@router.patch("/{workflow_id}/status", response_model=WorkflowEnvelope)
async def update_workflow_status(
    workflow_id: str,
    payload: UpdateStatusRequest,
    current_user: User = Depends(get_current_active_user)
) -> dict:
    for wf in MOCK_WORKFLOWS:
        if wf["id"] == workflow_id:
            wf["status"] = payload.status
            wf["updatedAt"] = datetime.now(timezone.utc).isoformat()
            return {
                "success": True,
                "message": f"Workflow status updated to {payload.status}.",
                "data": wf,
                "errors": None
            }
    raise HTTPException(status_code=404, detail="Workflow not found.")
