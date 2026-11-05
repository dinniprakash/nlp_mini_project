"""Optional IndicBERT fine-tuning starter. Requires a reviewed, sufficiently large dataset.
Run after installing backend requirements; GPU strongly recommended.
"""
from pathlib import Path
import pandas as pd
from datasets import Dataset
from transformers import AutoTokenizer, AutoModelForSequenceClassification, TrainingArguments, Trainer
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
import numpy as np
from sklearn.metrics import accuracy_score, precision_recall_fscore_support

ROOT = Path(__file__).resolve().parents[1]
df = pd.read_csv(ROOT / "data" / "wellness_dataset.csv").dropna(subset=["text", "label"])
enc = LabelEncoder(); df["labels"] = enc.fit_transform(df.label)
train_df, val_df = train_test_split(df[["text", "labels"]], test_size=.2, random_state=42, stratify=df.labels)
model_id = "ai4bharat/IndicBERTv2-MLM-only"
tokenizer = AutoTokenizer.from_pretrained(model_id)
def tokenize(batch): return tokenizer(batch["text"], truncation=True, padding="max_length", max_length=160)
train_ds = Dataset.from_pandas(train_df.reset_index(drop=True)).map(tokenize, batched=True)
val_ds = Dataset.from_pandas(val_df.reset_index(drop=True)).map(tokenize, batched=True)
model = AutoModelForSequenceClassification.from_pretrained(model_id, num_labels=len(enc.classes_))
def metrics(p):
    y = p.label_ids; yhat = np.argmax(p.predictions, axis=1)
    pr, rc, f1, _ = precision_recall_fscore_support(y, yhat, average="weighted", zero_division=0)
    return {"accuracy": accuracy_score(y, yhat), "precision": pr, "recall": rc, "f1": f1}
args = TrainingArguments(output_dir=str(ROOT / "ml" / "indicbert-output"), eval_strategy="epoch", save_strategy="epoch",
                         learning_rate=2e-5, per_device_train_batch_size=8, per_device_eval_batch_size=8,
                         num_train_epochs=3, weight_decay=.01, load_best_model_at_end=True,
                         metric_for_best_model="f1", report_to="none")
trainer = Trainer(model=model, args=args, train_dataset=train_ds, eval_dataset=val_ds, tokenizer=tokenizer, compute_metrics=metrics)
trainer.train()
out = ROOT / "ml" / "artifacts" / "indicbert"; out.mkdir(parents=True, exist_ok=True)
trainer.save_model(out); tokenizer.save_pretrained(out)
(ROOT / "ml" / "artifacts" / "indicbert" / "labels.txt").write_text("\n".join(enc.classes_), encoding="utf-8")
print("Saved IndicBERT model and label mapping to", out)
