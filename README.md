# Smart Crop Care

An agricultural decision-support application combining a FastAPI backend, classical ML pipelines, disease-detection components, a browser dashboard, and a Flutter client.

> **Scope:** This is a software/ML project for experimentation and decision support. Predictions should be validated against local agronomic guidance and field conditions before use.

## Features

- Crop recommendation from soil and climate inputs
- Fertilizer recommendation
- Cost/price estimation
- Image-based crop disease detection pipeline
- FastAPI REST API with interactive OpenAPI docs
- Browser dashboard served by the backend
- Flutter client for mobile/web/desktop experimentation
- Report generation and local application storage

## Architecture

```text
Web / Flutter clients
        |
        v
     FastAPI
        |
  +-----+-------------------+
  |         |        |      |
 Crop   Fertilizer  Cost  Disease
  ML        ML       ML     ML
  |         |        |      |
  +---------+--------+------+
            |
       Local artifacts
       and application
          storage
```

## Repository layout

```text
app/                    Backend application and ML services
models/                 Training/reference datasets and model inputs
flutter_app/            Flutter client
web_dashboard/          Web assets/components
disease_detection_src/  Disease-detection source
extras/                 Supporting/legacy utilities
requirements.txt        Python dependencies
Dockerfile              Container build
docker-compose.yml      Local container orchestration
```

## Requirements

- Python 3.10+ recommended
- Git
- Flutter SDK (only for the Flutter client)
- Docker (optional)

## Run the backend

From the repository root:

```bash
python -m venv .venv
# Windows PowerShell
.\.venv\Scripts\Activate.ps1

# macOS/Linux
# source .venv/bin/activate

pip install -r requirements.txt
python -m uvicorn app.application.main:app --reload --host 127.0.0.1 --port 8000
```

Open:

- Web UI: `http://127.0.0.1:8000`
- API docs: `http://127.0.0.1:8000/docs`
- Health endpoint: `http://127.0.0.1:8000/health`

No machine-specific absolute paths are required; commands should be run from the repository root.

## Train / update models

The repository contains training utilities and model artifacts. Before training, inspect the relevant module and dataset documentation:

```bash
python -m app.train_all
```

Generated artifacts should remain local unless they are intentionally versioned and are small enough for Git.

## Flutter client

```bash
cd flutter_app
flutter pub get
flutter run
```

For an Android release build:

```bash
flutter build apk --release
```

Configure the backend base URL for the target device/environment rather than hard-coding a developer machine address.

## API surface

The backend currently exposes routes for:

- authentication
- crop prediction
- fertilizer recommendation
- price/cost estimation
- disease detection
- advisory workspace
- reports
- health/status

The authoritative contract is the generated OpenAPI schema at `/openapi.json`.

## Testing and validation

The repository contains focused Python test scripts such as `test_accuracy.py` and `test_disease.py`. Run the tests relevant to the component you are changing and document any dataset/model prerequisites.

For changes that affect model quality, report the dataset, split, metric, and evaluation conditions instead of relying on a single headline accuracy number.

## Security and configuration

- Do not commit passwords, API keys, tokens, or personal machine paths.
- Treat local JSON/session storage as development storage, not a production identity system.
- Use environment variables for deployment secrets and service configuration.
- Do not expose a shared demo password in production.

## Roadmap

- Add reproducible automated tests for API services
- Separate model training from application runtime
- Add model/data versioning
- Add reproducible evaluation reports
- Improve deployment configuration and secret management
- Expand contributor documentation

## License

See the repository license file.
