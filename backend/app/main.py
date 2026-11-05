from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.schemas import ClassifyRequest, ClassificationResponse, FeedbackRequest
from app.nlp import classifier

DASHBOARD_SUMMARY = {
    "students_seen": 248,
    "pending_review": 17,
    "high_priority": 5,
    "response_rate": 91,
    "support_hours": "Mon-Sat, 9:00 AM - 6:00 PM",
    "last_updated": "2026-11-05T09:30:00Z",
}

RECENT_CASES = [
    {"student": "A. Meena", "category": "Academic Stress", "status": "In review", "language": "en"},
    {"student": "R. Kavya", "category": "Sleep Issues", "status": "Escalated", "language": "te"},
    {"student": "S. Arjun", "category": "Emotional Support", "status": "Resolved", "language": "ta"},
    {"student": "P. Nisha", "category": "Financial Concerns", "status": "In review", "language": "en"},
]

app = FastAPI(title="SCSVMV Student Wellness NLP API", version="1.0.0",
              description="Student concern text classification prototype. Not a diagnostic or emergency service.")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"name": "SCSVMV Student Wellness NLP", "status": "running", "docs": "/docs"}

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/dashboard/summary")
def dashboard_summary():
    return {
        "stats": DASHBOARD_SUMMARY,
        "alerts": [
            "3 cases require weekly counsellor review.",
            "1 urgent case flagged for immediate support.",
            "Follow-up reminder sent for 6 resolved cases.",
        ],
    }

@app.get("/dashboard/recent")
def dashboard_recent():
    return {"items": RECENT_CASES}

@app.post("/nlp/classify", response_model=ClassificationResponse)
def classify(payload: ClassifyRequest):
    return classifier.classify(payload.text, payload.language)

@app.post("/feedback")
def feedback(payload: FeedbackRequest):
    # Demo endpoint. Persist feedback only after integrating the authenticated database layer.
    return {"received": True, "submission_id": payload.submission_id}
