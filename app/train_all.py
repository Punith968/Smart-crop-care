from app.crop_recommendation.train import train_crop_model
from app.fertilizers.train import train_fertilizer_model
from app.price_estimation.train import train_cost_model

if __name__ == "__main__":
    print("Starting full model retraining...")
    
    crop_score = train_crop_model()
    print(f"Crop model trained. Accuracy: {crop_score:.4f}")
    
    fert_score = train_fertilizer_model()
    print(f"Fertilizer model trained. Accuracy: {fert_score:.4f}")
    
    cost_score = train_cost_model()
    print(f"Cost model trained. Accuracy: {cost_score:.4f}")
    
    print("All models retrained successfully.")
