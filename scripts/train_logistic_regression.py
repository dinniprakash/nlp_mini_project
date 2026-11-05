
from pathlib import Path
import csv
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score, classification_report

# Load actual multilingual wellness dataset

PROJECT_ROOT = Path(__file__).resolve().parents[1]

DATASET_PATH = (
    PROJECT_ROOT / "backend" / "data" / "wellness_dataset.csv"
)

data = []

with open(DATASET_PATH, "r", encoding="utf-8-sig", newline="") as file:
    reader = csv.DictReader(file)

    for row in reader:
        text = row["text"].strip()
        label = row["label"].strip()

        if text and label:
            data.append((text, label))

print("Dataset loaded successfully!")
print("Total records:", len(data))
print("Categories:", len(set(item[1] for item in data)))

texts = [item[0] for item in data]
labels = [item[1] for item in data]

X_train, X_test, y_train, y_test = train_test_split(
    texts,
    labels,
    test_size=0.25,
    random_state=42,
    stratify=labels
)

model = Pipeline([
    ("tfidf", TfidfVectorizer(
        analyzer="char",
        ngram_range=(2, 5),
        max_features=10000
    )),
    ("classifier", LogisticRegression(
        max_iter=1000,
        class_weight="balanced"
    ))
])

print("Training Logistic Regression...")
model.fit(X_train, y_train)

predictions = model.predict(X_test)

accuracy = accuracy_score(y_test, predictions)

print("\nTraining completed!")
print(f"Test accuracy: {accuracy:.2%}")

print("\nClassification Report:")
print(classification_report(y_test, predictions, zero_division=0))

# Save trained model
project_root = Path(__file__).resolve().parent.parent
artifact_dir = project_root / "ml" / "artifacts"
artifact_dir.mkdir(parents=True, exist_ok=True)

model_path = artifact_dir / "tfidf_logreg.joblib"
joblib.dump(model, model_path)

print(f"\nModel saved successfully: {model_path}")
