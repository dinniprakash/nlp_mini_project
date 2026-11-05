from pydantic import BaseModel, Field
from typing import Literal

Language = Literal["en", "te", "ta", "auto"]

class ClassifyRequest(BaseModel):
    text: str = Field(min_length=3, max_length=5000)
    language: Language = "auto"

class ClassificationResponse(BaseModel):
    category: str
    confidence: float
    language: str
    model: str
    needs_human_review: bool
    message: str

class FeedbackRequest(BaseModel):
    submission_id: int
    helpful: bool
    comment: str | None = Field(default=None, max_length=1000)
