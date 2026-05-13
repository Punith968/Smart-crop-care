from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[2]
APP_DIR = ROOT_DIR / "app"
ARTIFACTS_DIR = APP_DIR / "artifacts"
WEB_DIR = APP_DIR / "web"
WEB_STATIC_DIR = WEB_DIR / "static"
STORAGE_DIR = APP_DIR / "storage"
REPORTS_DIR = STORAGE_DIR / "reports"
UPLOADS_DIR = STORAGE_DIR / "uploads"
USERS_DB_PATH = STORAGE_DIR / "users.json"
SESSIONS_DB_PATH = STORAGE_DIR / "sessions.json"
MODELS_DIR = ROOT_DIR / "models"

CROP_MODELS_DIR = MODELS_DIR / "crop_recommendation"
FERTILIZER_MODELS_DIR = MODELS_DIR / "fertilizers"
COST_MODELS_DIR = MODELS_DIR / "cost_estimation"
DISEASE_MODELS_DIR = MODELS_DIR / "diseases_detection"

CROP_DATASET_PATH = CROP_MODELS_DIR / "crop_recommendation.csv"
CROP_REFERENCE_DATASET_PATH = CROP_MODELS_DIR / "crop_recommendation_reference.csv"
FERTILIZER_DATASET_PATH = FERTILIZER_MODELS_DIR / "fertilizer_recommendation.csv"
FERTILIZER_REFERENCE_DATASET_PATH = FERTILIZER_MODELS_DIR / "fertilizer_reference_raw.csv"
COST_DATASET_PATH = COST_MODELS_DIR / "cost_estimation_seed.csv"
DISEASE_MANIFEST_PATH = DISEASE_MODELS_DIR / "disease_image_manifest.csv"
DISEASE_IMAGES_DIR = DISEASE_MODELS_DIR / "images"

CROP_MODEL_PATH = ARTIFACTS_DIR / "crop_pipeline.joblib"
FERTILIZER_MODEL_PATH = ARTIFACTS_DIR / "fertilizer_pipeline.joblib"
COST_MODEL_PATH = ARTIFACTS_DIR / "cost_pipeline.joblib"
DISEASE_MODEL_PATH = ARTIFACTS_DIR / "disease_resnet50.keras"
DISEASE_LABELS_PATH = ARTIFACTS_DIR / "disease_labels.json"


def ensure_artifacts_dir() -> None:
    ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)


def ensure_model_data_dirs() -> None:
    for d in [CROP_MODELS_DIR, FERTILIZER_MODELS_DIR, COST_MODELS_DIR, DISEASE_MODELS_DIR, DISEASE_IMAGES_DIR]:
        d.mkdir(parents=True, exist_ok=True)


def ensure_storage_dirs() -> None:
    for d in [STORAGE_DIR, REPORTS_DIR, UPLOADS_DIR]:
        d.mkdir(parents=True, exist_ok=True)
