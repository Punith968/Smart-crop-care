from __future__ import annotations

import json
from pathlib import Path

import pandas as pd

from app.shared.paths import (
    DISEASE_IMAGES_DIR,
    DISEASE_LABELS_PATH,
    DISEASE_MANIFEST_PATH,
    DISEASE_MODEL_PATH,
    ensure_artifacts_dir,
)

MANIFEST_COLUMNS = ["split", "image_path", "crop_name", "disease_label"]


def _load_tensorflow():
    try:
        import tensorflow as tf
        from tensorflow.keras import layers, models
        from tensorflow.keras.applications import ResNet50
        from tensorflow.keras.applications.resnet50 import preprocess_input
    except ImportError as exc:
        raise ImportError(
            "TensorFlow is required for the ResNet50 disease pipeline. "
            "Install the optional disease dependencies first."
        ) from exc

    return tf, layers, models, ResNet50, preprocess_input


def _resolve_image_path(raw_path: str) -> Path:
    path = Path(raw_path)
    if path.is_absolute():
        return path
    return DISEASE_IMAGES_DIR.parent / path


def _load_manifest() -> pd.DataFrame:
    if not DISEASE_MANIFEST_PATH.exists():
        raise FileNotFoundError(f"Disease manifest not found at {DISEASE_MANIFEST_PATH}")

    manifest = pd.read_csv(DISEASE_MANIFEST_PATH)
    missing_columns = [column for column in MANIFEST_COLUMNS if column not in manifest.columns]
    if missing_columns:
        raise ValueError(f"Disease manifest is missing columns: {missing_columns}")

    manifest["image_path"] = manifest["image_path"].astype(str).map(_resolve_image_path)
    manifest = manifest[manifest["image_path"].map(Path.exists)].copy()

    if manifest.empty:
        raise ValueError(
            "Disease manifest does not contain any existing images yet. "
            "Add leaf image paths to models/diseases_detection/disease_image_manifest.csv first."
        )

    return manifest


def _build_dataset(tf, manifest: pd.DataFrame, class_to_index: dict[str, int], training: bool):
    image_paths = manifest["image_path"].astype(str).tolist()
    labels = manifest["disease_label"].map(class_to_index).tolist()

    def preprocess(path, label):
        image_bytes = tf.io.read_file(path)
        image = tf.io.decode_image(image_bytes, channels=3, expand_animations=False)
        image.set_shape([None, None, 3])
        image = tf.image.resize(image, [224, 224])
        image = tf.cast(image, tf.float32)
        label = tf.one_hot(label, depth=len(class_to_index))
        return image, label

    dataset = tf.data.Dataset.from_tensor_slices((image_paths, labels))
    if training:
        dataset = dataset.shuffle(buffer_size=len(image_paths), seed=42)
    dataset = dataset.map(preprocess, num_parallel_calls=tf.data.AUTOTUNE)
    return dataset.batch(16).prefetch(tf.data.AUTOTUNE)


def train_disease_model(epochs: int = 5, fine_tune_epochs: int = 3) -> dict[str, float | int]:
    tf, layers, models, ResNet50, preprocess_input = _load_tensorflow()
    manifest = _load_manifest()

    train_manifest = manifest[manifest["split"].str.lower() == "train"].copy()
    val_manifest = manifest[manifest["split"].str.lower().isin(["val", "valid", "validation"])].copy()

    if train_manifest.empty or val_manifest.empty:
        raise ValueError("Disease manifest must include both train and validation rows.")

    class_names = sorted(manifest["disease_label"].astype(str).str.strip().unique().tolist())
    class_to_index = {label: index for index, label in enumerate(class_names)}

    train_ds = _build_dataset(tf, train_manifest, class_to_index, training=True)
    val_ds = _build_dataset(tf, val_manifest, class_to_index, training=False)

    augmentation = tf.keras.Sequential(
        [
            layers.RandomFlip("horizontal"),
            layers.RandomRotation(0.08),
            layers.RandomZoom(0.12),
            layers.RandomContrast(0.08),
        ],
        name="augmentation",
    )

    base_model = ResNet50(weights="imagenet", include_top=False, input_shape=(224, 224, 3))
    base_model.trainable = False

    inputs = layers.Input(shape=(224, 224, 3))
    x = augmentation(inputs)
    x = preprocess_input(x)
    x = base_model(x, training=False)
    x = layers.GlobalAveragePooling2D()(x)
    x = layers.BatchNormalization()(x)
    x = layers.Dropout(0.35)(x)
    outputs = layers.Dense(len(class_names), activation="softmax")(x)
    model = models.Model(inputs, outputs, name="crop_disease_resnet50")

    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=1e-3),
        loss="categorical_crossentropy",
        metrics=["accuracy"],
    )
    model.fit(train_ds, validation_data=val_ds, epochs=epochs, verbose=1)

    base_model.trainable = True
    for layer in base_model.layers[:-30]:
        layer.trainable = False

    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=1e-5),
        loss="categorical_crossentropy",
        metrics=["accuracy"],
    )
    model.fit(train_ds, validation_data=val_ds, epochs=fine_tune_epochs, verbose=1)

    _, validation_accuracy = model.evaluate(val_ds, verbose=0)

    ensure_artifacts_dir()
    model.save(DISEASE_MODEL_PATH)
    DISEASE_LABELS_PATH.write_text(
        json.dumps({index: label for label, index in class_to_index.items()}, indent=2),
        encoding="utf-8",
    )

    return {
        "num_classes": len(class_names),
        "num_train_images": len(train_manifest),
        "num_val_images": len(val_manifest),
        "validation_accuracy": float(validation_accuracy),
    }


if __name__ == "__main__":
    metrics = train_disease_model()
    print(
        "Disease model trained. "
        f"Classes: {metrics['num_classes']} | "
        f"Validation accuracy: {metrics['validation_accuracy']:.4f}"
    )
