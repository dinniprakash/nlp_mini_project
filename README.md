<<<<<<< HEAD
# nlp_mini_project
=======
# SCSVMV Student Wellness NLP — Advanced Project Starter

A multilingual (English, Telugu, Tamil) student-concern classification prototype with a FastAPI backend, React frontend, TF-IDF + Logistic Regression training pipeline, optional IndicBERT fine-tuning starter, and PostgreSQL schema.

> **Important:** This is an academic prototype, not a medical device, diagnostic system, crisis line, or emergency service. The included CSV is a tiny synthetic demonstration dataset. Do not use its metrics or predictions for real student triage. Before any campus pilot, obtain university approval, informed consent, clinician review, privacy/security review, a staffed escalation process, and a representative professionally reviewed dataset. Do not upload identifiable or real student health text to public model services.

## Folder structure

- `backend/app`: FastAPI API and inference logic
- `backend/data/wellness_dataset.csv`: small synthetic seed dataset (9 categories, English/Telugu/Tamil)
- `backend/ml/train_baseline.py`: TF-IDF + Logistic Regression training
- `backend/ml/train_indicbert.py`: optional IndicBERT fine-tuning starter (GPU recommended)
- `frontend`: React + Vite student check-in UI
- `database/schema.sql`: PostgreSQL schema proposal (not wired to API yet)

## Requirements

- Windows 10/11, VS Code
- Python 3.11 recommended (some ML dependencies may not yet support the newest Python releases)
- Node.js 20 LTS or newer
- Git (optional)
- For IndicBERT training: CUDA-capable GPU recommended; CPU training can be very slow.

## 1. Start backend in PowerShell

```powershell
cd scsvmv-wellness-nlp
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r backend\requirements.txt
Copy-Item backend\.env.example backend\.env -ErrorAction SilentlyContinue
```

If PowerShell blocks activation, run this in the current terminal only:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\.venv\Scripts\Activate.ps1
```

Train the baseline model from the synthetic starter CSV:

```powershell
cd backend
python ml\train_baseline.py
uvicorn app.main:app --reload
```

Open API docs at `http://127.0.0.1:8000/docs` and health check at `http://127.0.0.1:8000/health`.

## 2. Start frontend in a second PowerShell terminal

```powershell
cd scsvmv-wellness-nlp\frontend
npm install
npm run dev
```

Open `http://localhost:5173`. The frontend calls `http://localhost:8000` by default. To point to a deployed API, create `frontend/.env` with `VITE_API_URL=https://your-api-domain` and rebuild.

## 3. Try the classification API

```powershell
$body = @{ text = 'I feel stressed about my semester exams'; language = 'en' } | ConvertTo-Json
Invoke-RestMethod -Uri 'http://127.0.0.1:8000/nlp/classify' -Method Post -ContentType 'application/json' -Body $body
```

## 4. Train IndicBERT (optional)

The starter uses `ai4bharat/IndicBERTv2-MLM-only` as a base checkpoint. Verify its model card, license, intended use, and current Transformers compatibility before use. Fine-tune only on a larger, consented, de-identified, human-reviewed dataset. From `backend`:

```powershell
python ml\train_indicbert.py
```

This script currently saves a fine-tuned checkpoint but does not yet connect it to the API. Implement and test an IndicBERT inference adapter before selecting it in production. Do not assume it is automatically better than the baseline; compare macro-F1, per-language recall, calibration, and error rates.

## 5. PostgreSQL schema

Create a database, then run `database/schema.sql` with `psql` or pgAdmin. The current API uses a lightweight in-memory inference flow and does **not** yet persist user accounts or submissions. The SQL file is a design starter only. Implement authentication, role-based authorization, encrypted storage, audit trails, row-level access policies, backups, retention/deletion workflows, and security testing before storing real data.

## 6. Deployment outline

1. Push the project to a private Git repository.
2. Deploy FastAPI as a Python web service; set `SECRET_KEY`, `DATABASE_URL`, `MODEL_PATH`, and CORS allowed origins as environment variables.
3. Deploy React as a static site; set `VITE_API_URL` to the backend URL at build time.
4. Use managed PostgreSQL with TLS, encrypted backups, restricted network access, and least-privilege credentials.
5. Configure HTTPS, domain allowlists, monitoring, rate limiting, dependency scanning, and incident response.
6. Keep model artifacts and secrets out of Git. Do not deploy the demo dataset as if it were validated.

## API endpoints

- `GET /` — service metadata
- `GET /health` — health check
- `POST /nlp/classify` — classify a text submission
- `POST /feedback` — feedback stub (not persisted)

## Recommended research/evaluation plan

- Build a balanced dataset with consent and clinician/student-support staff review.
- Split train/validation/test by student or collection period to reduce leakage.
- Keep a separate test set for each language; report macro-F1, per-class precision/recall, confusion matrix, calibration, and abstention rate.
- Test code-mixed text, spelling variants, transliteration, dialects, and out-of-domain messages.
- Use a human-review/abstain route for low confidence, urgent safety content, and unsupported language.
- Conduct bias, privacy, security, and usability reviews before any real-world use.

## Known limitations in this starter

- No real authentication or role-based dashboard yet.
- No database persistence wired into FastAPI.
- IndicBERT fine-tuning script is a starter, not production inference integration.
- Synthetic dataset is far too small for meaningful model quality claims.
- Keyword safety detection is incomplete and cannot reliably identify or rule out risk.
- The prototype does not send alerts to doctors or administrators.
>>>>>>> 845673d (Initial project upload)
