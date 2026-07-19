from pydantic import BaseModel, Field
from typing import Optional, List

class AIMessageResponse(BaseModel):
    id: str
    role: str
    content: str
    timestamp: str

class AIChatSessionResponse(BaseModel):
    id: str
    title: str
    createdAt: str
    updatedAt: str

class AIChatRequest(BaseModel):
    message: str
    sessionId: Optional[str] = None

class AIChatResponse(BaseModel):
    message: AIMessageResponse
    sessionId: str

class AIChatResponseEnvelope(BaseModel):
    success: bool
    message: str
    data: AIChatResponse
    errors: Optional[dict] = None

class AIMessageListEnvelope(BaseModel):
    success: bool
    message: str
    data: List[AIMessageResponse]
    errors: Optional[dict] = None

class AIChatSessionListEnvelope(BaseModel):
    success: bool
    message: str
    data: List[AIChatSessionResponse]
    errors: Optional[dict] = None
