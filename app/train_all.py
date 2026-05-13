from app.crop_recommendation.train import train_crop_model
from app.diseases_detection.train import train_disease_model
from app.fertilizers.train import train_fertilizer_model
from app.price_estimation.train import train_cost_model


if __name__ == "__main__":
    crop_score = train_crop_model()
    fert_score = train_fertilizer_model()
    cost_score = train_cost_model()
    print(f"Crop accuracy: {crop_score:.4f}")
    print(f"Fertilizer accuracy: {fert_score:.4f}")
    print(f"Cost estimation R^2: {cost_score:.4f}")
    try:
        disease_metrics = train_disease_model()
        print(f"Disease validation accuracy: {disease_metrics['validation_accuracy']:.4f}")
    except (ImportError, FileNotFoundError, ValueError) as exc:
        print(f"Disease training skipped: {exc}")
