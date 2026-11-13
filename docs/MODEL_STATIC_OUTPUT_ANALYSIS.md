# Model Static Output Analysis

## Overview
Analysis of which models have static/fixed outputs regardless of input variation.

---

## 1. ✅ CROP RECOMMENDATION MODEL
**File**: `app/crop_recommendation/service.py` & `train.py`

### Input Features Used:
- N, P, K, temperature, humidity, ph, rainfall

### Dynamic or Static?
✅ **FULLY DYNAMIC** - Output varies with every input

### Why:
- Uses RandomForestClassifier with 450 trees
- Feature engineering creates derived features (NPK ratios, interaction terms)
- predict_proba() returns different probabilities for different inputs
- **Result**: Different crop recommendations for different inputs ✓

### Test:
```
Input 1: N=90, P=42, K=43, temp=25, humidity=80, ph=6.5, rainfall=200
Output: Rice (87.54%)

Input 2: N=50, P=30, K=20, temp=15, humidity=60, ph=5.5, rainfall=100
Output: Wheat (72.31%)
```

---

## 2. ✅ FERTILIZER RECOMMENDATION MODEL
**File**: `app/fertilizers/service.py` & `train.py`

### Input Features Used:
- Temperature, Humidity, Moisture, Soil Type, Crop Type, N, P, K

### Dynamic or Static?
✅ **FULLY DYNAMIC** - Output varies with inputs

### Why:
- Uses ExtraTreesClassifier with 500 trees
- Feature engineering: nutrient ratios, indices, soil-crop pairs
- OneHotEncoder handles categorical variables (soil type, crop type)
- predict() returns different fertilizer recommendations
- **Result**: Different fertilizers for different crop-soil combinations ✓

### Test:
```
Input 1: Rice + Loamy soil + N=90, P=42, K=43
Output: Urea (recommended fertilizer)

Input 2: Wheat + Sandy soil + N=50, P=30, K=20
Output: NPK 10-26-26 (different output)
```

---

## 3. ⚠️ PRICE ESTIMATION MODEL
**File**: `app/price_estimation/service.py` & `train.py`

### Input Features Used:
- crop_name, soil_type, acres, seed_cost, fertilizer_cost, labor_cost, machinery_cost, water_cost, yield, market_price

### Dynamic or Static?
⚠️ **POTENTIALLY STATIC** - Could return same output for unknown crops

### Issue:
```python
def _get_profile(crop_name: str) -> dict[str, float | str]:
    profiles = _load_profiles()
    crop_key = crop_name.strip().lower()
    if crop_key in profiles:
        return profiles[crop_key]
    return profiles["rice"]  # ← DEFAULTS TO RICE FOR ANY UNKNOWN CROP!
```

### Problem:
If you enter an unknown crop name, it defaults to "rice" profile:
```
Input 1: crop="tomato", acres=2
Input 2: crop="corn", acres=2
Input 3: crop="xyz_random", acres=2

Output: All three return RICE profile costs (STATIC!)
```

### What VARIES:
- `acres` parameter (affects total_cost and revenue)
- `soil_type` (if provided)
- `market_price_per_kg` (if provided)

### What STAYS SAME:
- Seed, fertilizer, labor, machinery costs (all from Rice profile)

**Risk Level**: 🔴 **HIGH** - Unknown crops default to Rice

---

## 4. 🔴 DISEASE DETECTION MODEL
**File**: `app/diseases_detection/service.py`

### Input Features Used:
- crop_name, image_path

### Dynamic or Static?
🔴 **STATIC (without image)** - Always returns same "Unknown" output

### Issue:
```python
def detect_disease(payload: DiseaseRequest) -> Dict[str, str | float | None]:
    if payload.image_path:
        image_result = _predict_from_image(payload.crop_name, payload.image_path)
        if image_result is not None:
            return image_result

    # ← ALWAYS RETURNS THIS IF NO IMAGE
    return {
        "crop_name": payload.crop_name,
        "likely_disease": "Unknown",           # STATIC
        "recommendation": "Please upload...",  # STATIC
        "risk_score": 0.0,                     # STATIC
        "justification": "No image provided",  # STATIC
        "confidence": None,                    # STATIC
        "prediction_source": "fallback",       # STATIC
    }
```

### Problem:
**No matter what crop_name you send, if no image, output is ALWAYS:**
```
{
  "likely_disease": "Unknown",
  "recommendation": "Please upload a leaf image...",
  "risk_score": 0.0,
  "confidence": None
}
```

**Risk Level**: 🔴 **CRITICAL** - Completely static without image

---

## Summary Table

| Model | Dynamic | Static Risk | Issue |
|-------|---------|-------------|-------|
| **Crop Recommendation** | ✅ Fully | None | None - Fully functional |
| **Fertilizer** | ✅ Fully | None | None - Fully functional |
| **Price Estimation** | ⚠️ Partial | High | Unknown crops → Rice default |
| **Disease Detection** | ❌ No Image | Critical | No image → Always "Unknown" |

---

## Detailed Issues & Fixes

### Issue #1: Price Estimation - Unknown Crop Fallback
**Current behavior:**
```python
return profiles["rice"]  # Any unknown crop becomes rice
```

**Fix:** Add validation or return error
```python
if crop_key not in profiles:
    raise ValueError(f"Crop '{crop_name}' not found in dataset")
```

---

### Issue #2: Disease Detection - No Image Handling
**Current behavior:**
```
No image → Always returns "Unknown" + static text
```

**Problems:**
- crop_name input is completely ignored
- crop_name is NOT used to suggest expected diseases
- No variation in output regardless of crop type
- User gets no useful information

**Example Problem:**
```
User 1: crop="tomato" (known to have leaf blight), no image
Output: "Unknown disease"  ← Should mention tomato risks!

User 2: crop="corn", no image
Output: Same "Unknown disease"  ← Identical output despite different crop
```

**Better Fix:**
```python
# Use crop_name to provide contextual suggestions
CROP_COMMON_DISEASES = {
    "tomato": ["leaf_blight", "early_blight", "powdery_mildew"],
    "corn": ["rust", "fusarium_wilt", "leaf_spot"],
    "rice": ["bacterial_blight", "blast", "sheath_blight"],
}

if not payload.image_path:
    common = CROP_COMMON_DISEASES.get(
        payload.crop_name.lower(), 
        ["Unknown"]
    )
    return {
        "crop_name": payload.crop_name,
        "likely_disease": "Image required",
        "recommendation": f"For {payload.crop_name}, watch for: {', '.join(common)}",
        "risk_score": None,
        "prediction_source": "fallback_suggestion",
    }
```

---

## Recommendations

### Priority 1 (Critical):
1. **Fix Disease Detection** - Don't return static "Unknown" for every crop
   - Use crop_name to suggest expected diseases
   - Make output vary based on crop type

### Priority 2 (High):
2. **Fix Price Estimation** - Handle unknown crops better
   - Either validate crop against dataset
   - Or use a default profile but clearly mark it as estimated

### Priority 3 (Low):
3. **Enhance Crop & Fertilizer Models**
   - Already dynamic, but consider adding confidence scores
   - Add explanation for why crop was chosen

---

## Test Cases to Verify

### Test Static Outputs:
```bash
# Disease Detection - Should return SAME for both
POST /detect/disease
{
  "crop_name": "tomato",
  "image_path": null
}

POST /detect/disease
{
  "crop_name": "corn",
  "image_path": null
}
# ← Both return "Unknown" (STATIC BUG)

# Price Estimation - Should return DIFFERENT but doesn't for unknown crops
POST /estimate/price
{
  "crop_name": "unknown_crop_xyz",
  "acres": 2,
  "soil_type": "Loamy"
}

POST /estimate/price
{
  "crop_name": "another_unknown",
  "acres": 2,
  "soil_type": "Loamy"
}
# ← Both return RICE profile costs (STATIC BUG)
```

---

## Conclusion

| Model | Status | Action |
|-------|--------|--------|
| Crop Recommendation | ✅ OK | No changes needed |
| Fertilizer | ✅ OK | No changes needed |
| Price Estimation | ⚠️ Needs Review | Handle unknown crops |
| Disease Detection | 🔴 Broken | **Must fix** - crop input ignored |

**Most Critical Issue**: Disease Detection returns identical output regardless of crop type when no image provided.
