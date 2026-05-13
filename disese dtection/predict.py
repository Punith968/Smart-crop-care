import argparse
import csv
from pathlib import Path
from typing import Dict, List

import cv2
import numpy as np
import torch
from PIL import Image
from torch import nn
from torch.nn import functional as F
from torchvision import models, transforms


IMAGENET_MEAN = [0.485, 0.456, 0.406]
IMAGENET_STD = [0.229, 0.224, 0.225]
DEFAULT_INPUT_SIZE = 224
DEFAULT_NUM_CLASSES = 38
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".tif", ".tiff", ".webp"}
SAFETY_MESSAGE = (
    "This is an AI-based suggestion, not a confirmed diagnosis.\n"
    "Consult a local agricultural expert before applying treatment."
)

DISEASE_ADVICE = {
    "early_blight": "Remove infected leaves, avoid overhead watering, and keep foliage dry.",
    "leaf_spot": "Improve airflow around plants and apply an appropriate fungicide if needed.",
    "late_blight": "Remove infected tissue quickly and avoid wet leaves for long periods.",
    "powdery_mildew": "Increase airflow, reduce humidity around plants, and remove heavily affected leaves.",
    "rust": "Remove infected leaves and monitor nearby plants closely for spread.",
    "mold": "Reduce leaf wetness, improve spacing, and avoid watering late in the day.",
    "scab": "Remove fallen infected debris and improve orchard or field sanitation.",
    "healthy": "Leaf appears healthy. Continue monitoring and maintain good field hygiene.",
}


def build_model(num_classes: int, device: torch.device) -> nn.Module:
    model = models.resnet50(weights=None)
    model.fc = nn.Sequential(
        nn.Dropout(p=0.3),
        nn.Linear(model.fc.in_features, num_classes),
    )
    return model.to(device)


def build_eval_transform(input_size: int, mean, std) -> transforms.Compose:
    return transforms.Compose(
        [
            transforms.Resize((input_size, input_size)),
            transforms.ToTensor(),
            transforms.Normalize(mean=mean, std=std),
        ]
    )


def get_model_state_from_checkpoint(checkpoint):
    if "model_state_dict" in checkpoint:
        return checkpoint["model_state_dict"]
    if "model" in checkpoint:
        return checkpoint["model"]
    raise ValueError("Checkpoint does not contain model weights.")


def normalize_model_state_for_current_head(model_state):
    normalized = dict(model_state)

    if "fc.weight" in normalized and "fc.1.weight" not in normalized:
        normalized["fc.1.weight"] = normalized.pop("fc.weight")
    if "fc.bias" in normalized and "fc.1.bias" not in normalized:
        normalized["fc.1.bias"] = normalized.pop("fc.bias")
    if "fc.1.weight" in normalized and "fc.weight" not in normalized:
        normalized["fc.weight"] = normalized["fc.1.weight"]
    if "fc.1.bias" in normalized and "fc.bias" not in normalized:
        normalized["fc.bias"] = normalized["fc.1.bias"]

    return normalized


def load_checkpoint(checkpoint_path: str, device: torch.device):
    checkpoint = torch.load(checkpoint_path, map_location=device)
    class_to_idx: Dict[str, int] = checkpoint.get("class_to_idx")
    if class_to_idx is None:
        raise ValueError("Checkpoint does not contain class_to_idx mapping.")

    num_classes = checkpoint.get("num_classes", len(class_to_idx) or DEFAULT_NUM_CLASSES)
    input_size = checkpoint.get("input_size", DEFAULT_INPUT_SIZE)
    mean = checkpoint.get("mean", IMAGENET_MEAN)
    std = checkpoint.get("std", IMAGENET_STD)

    model = build_model(num_classes=num_classes, device=device)
    model_state = normalize_model_state_for_current_head(get_model_state_from_checkpoint(checkpoint))
    model.load_state_dict(model_state, strict=False)
    model.eval()

    idx_to_class = {idx: cls_name for cls_name, idx in class_to_idx.items()}
    transform = build_eval_transform(input_size=input_size, mean=mean, std=std)
    return model, transform, idx_to_class


def build_leaf_mask(image_bgr: np.ndarray) -> np.ndarray:
    hsv = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2HSV)
    lab = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2LAB)
    gray = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2GRAY)

    green_mask = cv2.inRange(hsv, (25, 25, 20), (95, 255, 255))
    yellow_mask = cv2.inRange(hsv, (10, 20, 20), (40, 255, 255))
    brown_mask = cv2.inRange(hsv, (5, 20, 20), (25, 255, 220))

    a_channel = lab[:, :, 1]
    b_channel = lab[:, :, 2]
    lab_mask = cv2.inRange(a_channel, 110, 170)
    lab_mask = cv2.bitwise_and(lab_mask, cv2.inRange(b_channel, 120, 210))

    _, gray_mask = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    edge_mask = cv2.Canny(gray, 40, 120)

    combined_mask = cv2.bitwise_or(green_mask, yellow_mask)
    combined_mask = cv2.bitwise_or(combined_mask, brown_mask)
    combined_mask = cv2.bitwise_or(combined_mask, lab_mask)
    combined_mask = cv2.bitwise_or(combined_mask, gray_mask)
    combined_mask = cv2.bitwise_or(combined_mask, edge_mask)

    kernel = np.ones((5, 5), np.uint8)
    combined_mask = cv2.morphologyEx(combined_mask, cv2.MORPH_OPEN, kernel)
    combined_mask = cv2.morphologyEx(combined_mask, cv2.MORPH_CLOSE, kernel)
    combined_mask = cv2.dilate(combined_mask, kernel, iterations=1)
    return combined_mask


def select_main_leaf_contour(contours, image_shape):
    image_h, image_w = image_shape[:2]
    image_area = float(image_h * image_w)
    best_contour = None
    best_area = 0.0

    for contour in contours:
        area = cv2.contourArea(contour)
        if area < image_area * 0.01:
            continue

        x, y, w, h = cv2.boundingRect(contour)
        if h == 0:
            continue

        aspect_ratio = w / float(h)
        if aspect_ratio < 0.2 or aspect_ratio > 5.0:
            continue

        if area > best_area:
            best_area = area
            best_contour = contour

    return best_contour


def crop_main_leaf_region(
    image_path: str,
    output_dir: str = "cropped_outputs",
    padding: int = 15,
) -> tuple[Image.Image, str, bool]:
    image_bgr = cv2.imread(image_path)
    if image_bgr is None:
        raise ValueError(f"Could not read image: {image_path}")

    original_rgb = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB)
    mask = build_leaf_mask(image_bgr)
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    cropped_rgb = original_rgb
    used_detected_crop = False
    main_contour = select_main_leaf_contour(contours, image_bgr.shape)

    if main_contour is not None:
        x, y, w, h = cv2.boundingRect(main_contour)
        x1 = max(x - padding, 0)
        y1 = max(y - padding, 0)
        x2 = min(x + w + padding, original_rgb.shape[1])
        y2 = min(y + h + padding, original_rgb.shape[0])
        if x2 > x1 and y2 > y1:
            cropped_rgb = original_rgb[y1:y2, x1:x2]
            used_detected_crop = True

    cropped_image = Image.fromarray(cropped_rgb)
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)
    cropped_image_path = output_path / f"{Path(image_path).stem}_cropped.jpg"
    cropped_image.save(cropped_image_path)

    return cropped_image, str(cropped_image_path), used_detected_crop


def check_image_quality(image: Image.Image) -> tuple[bool, str]:
    image_array = np.array(image)
    gray = cv2.cvtColor(image_array, cv2.COLOR_RGB2GRAY)

    blur_score = cv2.Laplacian(gray, cv2.CV_64F).var()
    brightness = float(gray.mean())

    if blur_score < 40:
        return False, "Image quality too low. Please retake the photo."
    if brightness < 40 or brightness > 220:
        return False, "Image quality too low. Please retake the photo."

    return True, ""


def get_basic_advice(label: str, health_status: str) -> str:
    normalized = label.lower()

    if health_status == "Uncertain":
        return "Retake the image in good lighting with one clear leaf, or consult a local expert."

    for key, advice in DISEASE_ADVICE.items():
        if key in normalized:
            return advice

    if health_status == "Healthy":
        return DISEASE_ADVICE["healthy"]

    return "Remove severely affected leaves, improve airflow, and consult a local expert if symptoms spread."


def simplify_prediction_label(label: str) -> str:
    if not label or label == "Uncertain":
        return "Uncertain result"

    if "healthy" in label.lower():
        return "Healthy leaf"

    return "Leaf disease detected"


def determine_risk(top_label: str, top_confidence: float) -> tuple[str, str, str]:
    if "healthy" in top_label.lower():
        return "Healthy", "Low", "None detected"

    if top_confidence < 0.60:
        return "Uncertain", "Unknown", "Uncertain"

    if top_confidence >= 0.80:
        return "Diseased", "High", top_label

    return "Diseased", "Moderate", top_label


def log_prediction(
    image_path: str,
    cropped_image_path: str,
    predicted_label: str,
    confidence: float,
    risk_level: str,
    log_file: str = "prediction_logs/predictions.csv",
) -> None:
    log_path = Path(log_file)
    log_path.parent.mkdir(parents=True, exist_ok=True)
    file_exists = log_path.exists()

    with log_path.open("a", newline="", encoding="utf-8") as csv_file:
        writer = csv.writer(csv_file)
        if not file_exists:
            writer.writerow(["image_path", "cropped_image", "prediction", "confidence", "risk_level"])
        writer.writerow([image_path, cropped_image_path, predicted_label, f"{confidence:.4f}", risk_level])


@torch.no_grad()
def predict_single_image(
    image_path: str,
    model: nn.Module,
    transform: transforms.Compose,
    idx_to_class: Dict[int, str],
    device: torch.device,
) -> Dict[str, object]:
    cropped_image, cropped_image_path, used_detected_crop = crop_main_leaf_region(image_path)
    quality_ok, message = check_image_quality(cropped_image)

    result: Dict[str, object] = {
        "image_path": image_path,
        "cropped_image_path": cropped_image_path,
        "used_detected_crop": used_detected_crop,
        "quality_ok": quality_ok,
        "health_status": "Uncertain",
        "risk_level": "Unknown",
        "most_likely": "Uncertain",
        "top3_predictions": [],
        "advice": "Retake the image in good lighting with one clear leaf, or consult a local expert.",
    }

    if not quality_ok:
        result["message"] = message
        return result

    model.eval()
    tensor = transform(cropped_image).unsqueeze(0).to(device, non_blocking=True)
    outputs = model(tensor)
    probabilities = F.softmax(outputs, dim=1)
    top_probs, top_indices = torch.topk(probabilities, k=3, dim=1)

    top3_predictions = [
        (idx_to_class[idx], prob)
        for prob, idx in zip(top_probs[0].tolist(), top_indices[0].tolist())
    ]

    top_label = top3_predictions[0][0]
    top_confidence = top3_predictions[0][1]
    health_status, risk_level, most_likely = determine_risk(top_label, top_confidence)
    advice = get_basic_advice(most_likely if most_likely != "None detected" else top_label, health_status)

    result["health_status"] = health_status
    result["risk_level"] = risk_level
    result["most_likely"] = most_likely
    result["top3_predictions"] = top3_predictions
    result["advice"] = advice

    log_prediction(
        image_path=image_path,
        cropped_image_path=cropped_image_path,
        predicted_label=top_label,
        confidence=top_confidence,
        risk_level=risk_level,
    )

    return result


def collect_images(folder_path: str) -> List[Path]:
    folder = Path(folder_path)
    return sorted(
        path for path in folder.iterdir() if path.is_file() and path.suffix.lower() in IMAGE_EXTENSIONS
    )


def print_prediction_result(result: Dict[str, object]) -> None:
    print(f"Health Status: {result['health_status']}")
    print(f"Risk Level: {result['risk_level']}")
    most_likely_confidence = result["top3_predictions"][0][1] if result["top3_predictions"] else 0.0
    print(f"Confidence: {most_likely_confidence:.2f}")
    print()

    seen = set()
    possible_conditions = []

    for label, probability in result["top3_predictions"]:
        if probability < 0.05:
            continue

        simplified_label = simplify_prediction_label(label)
        if simplified_label not in seen:
            seen.add(simplified_label)
            possible_conditions.append((simplified_label, probability))

    possible_conditions = possible_conditions[:2]

    print("Possible conditions:")
    for simplified_label, probability in possible_conditions:
        print(f"- {simplified_label} ({probability:.2f})")
    print()

    print(f"Advice: {result['advice']}")
    print()
    print(SAFETY_MESSAGE)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Safe farmer-assistance prediction for one image or a folder of images."
    )
    input_group = parser.add_mutually_exclusive_group(required=True)
    input_group.add_argument("--image-path", type=str, help="Path to one input image.")
    input_group.add_argument("--folder-path", type=str, help="Path to a folder containing multiple images.")
    parser.add_argument(
        "--checkpoint",
        type=str,
        default=str(Path("best_model.pth")),
        help="Path to model checkpoint file.",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    model, transform, idx_to_class = load_checkpoint(args.checkpoint, device)

    if args.folder_path:
        image_paths = collect_images(args.folder_path)
        if not image_paths:
            raise ValueError(f"No supported image files found in folder: {args.folder_path}")

        for image_path in image_paths:
            result = predict_single_image(
                image_path=str(image_path),
                model=model,
                transform=transform,
                idx_to_class=idx_to_class,
                device=device,
            )
            print_prediction_result(result)
    else:
        result = predict_single_image(
            image_path=args.image_path,
            model=model,
            transform=transform,
            idx_to_class=idx_to_class,
            device=device,
        )
        print_prediction_result(result)


if __name__ == "__main__":
    main()
