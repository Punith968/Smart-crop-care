# Smart Crop Care

[![Quality](https://github.com/Punith968/Smart-crop-care/actions/workflows/quality.yml/badge.svg)](https://github.com/Punith968/Smart-crop-care/actions/workflows/quality.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
![Python 3.11](https://img.shields.io/badge/python-3.11-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688)

An agricultural decision-support platform for farmers. It recommends crops from soil and climate readings, suggests fertilizers, estimates cultivation cost and profit, and screens leaf images for disease. It does this through a FastAPI backend with classical-ML and deep-learning models, a bilingual (English/Kannada) web dashboard, and a Flutter mobile client.

> **Scope:** This is a software and ML project for decision support. Validate predictions against local agronomic guidance and field conditions before acting on them.

## Features

| Module | Approach |
|---|---|
| **Crop recommendation** | scikit-learn pipeline: NPK-ratio feature engineering, one-hot soil type, Random Forest (450 trees, class-balanced). Returns the best crop or a top-4 ranking with confidence. |
| **Fertilizer recommendation** | Extra Trees classifier on soil nutrients, moisture and crop type |
| **Cost and profit estimation** | Multi-output Random Forest regressor (total cost, expected revenue, profit), with a rule-based fallback when no model is trained |
| **Leaf disease detection** | PyTorch ResNet-50 fine-tuned on 38 plant-disease classes, with image-quality and leaf-likeness guards. Falls back to an image heuristic when PyTorch or the checkpoint is not installed. |
| **Advisory workspace** | Combines crop, fertilizer and cost models into one recommendation for a farm (soil, climate, acreage) |
| **Reports** | Per-user HTML/PDF advisory reports, a performance-analysis PDF and a ZIP export |
| **Accounts** | Register/login with salted PBKDF2-SHA256 password hashes (120k iterations) and bearer-token sessions |

### Disease model training results

From `disease_detection_src/checkpoints/metrics.csv` (10 epochs, 38 classes):

| | Train accuracy | Validation accuracy |
|---|---|---|
| Epoch 1 | 86.5% | 94.2% |
| Best (epoch 9) | 99.6% | **99.6%** |

These numbers come from the dataset's validation split of curated leaf images. Expect lower accuracy on real field photos with cluttered backgrounds and variable lighting.

## Architecture

```text
 React PWA dashboard (EN/ಕನ್ನಡ)   Flutter app   Built-in web UI
              \                      |               /
               +---------------- FastAPI ------------+
               |   /auth   /predict   /estimate   /detect
               |   /workspace   /reports   /health
               +----------------------------------------+
                 |          |          |          |
             Crop RF   Fertilizer  Cost RF   Disease ResNet-50
                       Extra Trees           (PyTorch, optional)
                 |          |          |          |
            app/artifacts/*.joblib       disease_detection_src/best_model.pth
                                |
                 app/storage/ (users, sessions, reports)
```

## Repository layout

```text
app/
  application/main.py     FastAPI app and routes
  auth/                   Accounts and sessions
  crop_recommendation/    Crop model: training and inference
  fertilizers/            Fertilizer model
  price_estimation/       Cost/profit model
  diseases_detection/     Disease inference service
  workspace/              Combined advisory
  reports/                Report generation
  web/static/             Built-in web UI served at /
disease_detection_src/    PyTorch ResNet-50 training/inference code and metrics
web_dashboard/            React 19 + Vite + Tailwind PWA (English/Kannada)
flutter_app/              Flutter client
tests/                    pytest suite
scripts/                  Manual diagnostic scripts (need a running server)
docs/                     Design notes, implementation guides, debugging guide
```

## Getting started

### Backend

```bash
python -m venv .venv
source .venv/bin/activate          # Windows: .\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
# optional, for the PyTorch disease model:
pip install -r disease_detection_src/requirements.txt

python -m uvicorn app.application.main:app --reload --port 8000
```

- Web UI: http://127.0.0.1:8000
- Interactive API docs: http://127.0.0.1:8000/docs
- Health check: http://127.0.0.1:8000/health

Two demo accounts are created on first start: `farmer` / `farmer123` and `admin` / `admin123`. They are for local development only, so change or remove them in `app/auth/service.py` before any deployment.

### Docker

```bash
docker compose up --build
```

Runtime data is kept in `app/storage/`, which is mounted as a volume and excluded from Git. Set `SMART_CROP_STORAGE_DIR` to store it elsewhere.

### Training the models

Training datasets are expected under `models/` (see `app/shared/paths.py` for exact filenames). They are not committed because of their size. With the datasets in place:

```bash
python -m app.train_all
```

Trained pipelines are written to `app/artifacts/`. Until a model is trained, its endpoint returns `400 "... model not trained yet"`.

### Web dashboard

```bash
cd web_dashboard
npm install
npm run dev        # proxies API calls to http://localhost:8000
```

### Flutter app

```bash
cd flutter_app
cp .env.example .env    # set the backend URL for your device
flutter pub get
flutter run
```

## API overview

| Method | Path | Purpose |
|---|---|---|
| POST | `/auth/register`, `/auth/login`, `/auth/logout` | Accounts |
| GET | `/auth/me` | Current user |
| POST | `/predict/crop`, `/predict/crop/top` | Crop recommendation |
| POST | `/predict/fertilizer` | Fertilizer recommendation |
| POST | `/estimate/price` | Cost and profit estimate |
| POST | `/detect/disease` | Leaf disease detection |
| POST | `/workspace/advisory`, `/workspace/disease` | Combined advisory |
| GET/POST | `/reports`, `/reports/save`, `/reports/{id}/download`, `/reports/download-all` | Reports |
| GET | `/health` | Health check |

The full contract is in the generated OpenAPI schema at `/openapi.json`.

## Testing

```bash
pip install pytest httpx
python -m pytest -q tests
```

The suite runs without datasets, trained artifacts or PyTorch. It trains small pipelines on synthetic data and isolates storage in a temp directory. It covers:

- the crop pipeline: feature engineering, learning separable profiles, unseen soil types, and the `/predict/crop` and `/predict/crop/top` endpoints
- the full auth flow, duplicate and wrong-password handling, and hashed password storage
- routing regressions (API routes must not be shadowed by the SPA catch-all; no static-file traversal)
- report-ID validation and the disease-detection fallback

GitHub Actions runs the suite and a production build of the web dashboard on every push and pull request.

## Roadmap

- [ ] Publish the training datasets (or download scripts) so models are reproducible from a clean clone
- [ ] Evaluate the disease model on field images, not just the curated validation split
- [ ] Compute the performance-analysis report from real evaluation runs (it currently uses fixed figures)
- [ ] Replace JSON-file storage with SQLite and make demo accounts opt-in
- [ ] Fix the remaining ESLint errors in `web_dashboard`

## License

[MIT](LICENSE) © Punith C
