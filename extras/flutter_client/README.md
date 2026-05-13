# Flutter Pipeline Integration

Use this file in your Flutter app as an API client layer.

## File Path
- app/flutter_pipeline/api_service.dart

## Required Flutter Dependency
Add in pubspec.yaml:

```yaml
dependencies:
  http: ^1.2.1
```

## Base URL Example
- Android emulator: http://10.0.2.2:8000
- Physical device: http://<YOUR_PC_IP>:8000

## Payload examples

### Crop
```json
{
  "N": 90,
  "P": 40,
  "K": 40,
  "temperature": 25,
  "humidity": 80,
  "ph": 6.5,
  "rainfall": 200
}
```

### Fertilizer
```json
{
  "temperature": 30,
  "humidity": 60,
  "moisture": 40,
  "soil_type": "Sandy",
  "crop_type": "Maize",
  "nitrogen": 20,
  "phosphorous": 30,
  "potassium": 40
}
```

### Price
```json
{
  "crop_name": "rice",
  "acres": 2.5
}
```

### Disease
```json
{
  "crop_name": "rice",
  "symptoms": "yellow leaves with spots"
}
```
