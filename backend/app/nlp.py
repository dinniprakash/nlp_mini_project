"""Inference adapters. Baseline model is loaded when trained; IndicBERT is optional."""
from pathlib import Path
import joblib
from langdetect import detect, LangDetectException
from app.config import settings

FALLBACK_LABELS = {
    "academic_stress": "Academic Stress", "anxiety": "Anxiety / Worry",
    "emotional_support": "Emotional Support", "physical_health": "Physical Health",
    "sleep_issues": "Sleep Issues", "financial_concerns": "Financial Concerns",
    "relationship_issues": "Relationship Issues", "general_wellness": "General Wellness",
    "urgent_safety": "Urgent Safety Concern"
}

class WellnessClassifier:
    def __init__(self):
        self.pipeline = None
        self.model_name = "keyword-baseline (training required)"
        path = Path(settings.model_path)
        if path.exists():
            self.pipeline = joblib.load(path)
            self.model_name = "TF-IDF + Logistic Regression"

    def classify(self, text: str, language: str = "auto"):
        detected = language
        if detected == "auto":
            try:
                detected = detect(text)
            except LangDetectException:
                detected = "unknown"
        if self.pipeline is None:
            category, confidence = self._safe_demo_fallback(text)
        else:
            probs = self.pipeline.predict_proba([text])[0]
            idx = probs.argmax()
            category, confidence = str(self.pipeline.classes_[idx]), float(probs[idx])
        # Safety routing is deliberately conservative and always requires a human check.
        urgent_terms = ["suicide", "kill myself", "hurt myself", "self harm", "చచ్చిపోవాలి", "నన్ను నేను", "தற்கொலை", "என்னை காயப்படுத்த"]
        urgent = any(term in text.lower() for term in urgent_terms)
        if urgent:
            category = "urgent_safety"
            confidence = max(confidence, 0.99)
        needs_review = urgent or confidence < settings.confidence_threshold
        return {
            "category": FALLBACK_LABELS.get(category, category.replace("_", " ").title()),
            "confidence": round(confidence, 4), "language": detected,
            "model": self.model_name, "needs_human_review": needs_review,
            "message": ("Please contact a trusted person or campus support immediately. If there is immediate danger, contact local emergency services. This tool is not an emergency service." if urgent else
                        "This is an initial text category, not a diagnosis. Please contact campus health staff if you need help." if needs_review else
                        "This is an automated category suggestion, not a medical assessment.")
        }

    @staticmethod
    def _safe_demo_fallback(text: str):
        t = text.lower()
        rules = {
            "urgent_safety": ["suicide", "kill myself", "hurt myself", "self harm", "தற்கொலை", "చచ్చిపోవాలి"],
            "academic_stress": ["exam", "semester", "assignment", "marks", "వైపరీత్యం", "పరీక్ష", "தேர்வு"],
            "sleep_issues": ["sleep", "insomnia", "cannot sleep", "నిద్ర", "தூக்கம்"],
            "physical_health": ["headache", "fever", "pain", "sick", "జ్వరం", "నొప్పి", "காய்ச்சல்"],
            "financial_concerns": ["fees", "money", "financial", "loan", "ఫీజు", "பணம்"],
            "relationship_issues": ["family", "relationship", "friend", "breakup", "కుటుంబ", "உறவு"],
            "anxiety": ["anxious", "worry", "nervous", "panic", "ఆందోళన", "கவலை"],
            "emotional_support": ["lonely", "sad", "alone", "hopeless", "ఒంటరిగా", "தனிமை"],
        }
        for label, terms in rules.items():
            if any(term in t for term in terms):
                return label, 0.45
        return "general_wellness", 0.30

classifier = WellnessClassifier()
