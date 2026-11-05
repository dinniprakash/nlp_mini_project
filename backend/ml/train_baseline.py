"""Train TF-IDF + Logistic Regression from data/wellness_dataset.csv."""
from pathlib import Path
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, confusion_matrix

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data" / "wellness_dataset.csv"
OUT = ROOT / "ml" / "artifacts" / "tfidf_logreg.joblib"
df = pd.read_csv(DATA).dropna(subset=["text", "label"])
X_train, X_test, y_train, y_test = train_test_split(df.text, df.label, test_size=0.2, random_state=42, stratify=df.label)
model = Pipeline([("tfidf", TfidfVectorizer(ngram_range=(1, 2), max_features=30000, strip_accents=None)),
                  ("clf", LogisticRegression(max_iter=1500, class_weight="balanced"))])
model.fit(X_train, y_train)
pred = model.predict(X_test)
print(classification_report(y_test, pred, zero_division=0))
print("Confusion matrix:\n", confusion_matrix(y_test, pred, labels=model.classes_))
OUT.parent.mkdir(parents=True, exist_ok=True)
joblib.dump(model, OUT)
print(f"Saved model: {OUT}")
