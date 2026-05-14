# Stage 1: Build the React frontend
FROM node:20-slim AS frontend-builder
WORKDIR /web
COPY web_dashboard/package*.json ./
RUN npm install
COPY web_dashboard/ ./
RUN npm run build

# Stage 2: Python environment with CUDA support
FROM pytorch/pytorch:2.1.0-cuda11.8-cudnn8-runtime
WORKDIR /app

# Install system dependencies for OpenCV and other libs
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY . .

# Copy built frontend from Stage 1 to the location expected by FastAPI
RUN mkdir -p app/web/static
COPY --from=frontend-builder /web/dist/* app/web/static/
# Ensure subdirectories (like assets) are copied correctly
COPY --from=frontend-builder /web/dist/assets app/web/static/assets

# Expose FastAPI port
EXPOSE 8000

# Environment variable to ensure the app knows it's in a container
ENV IN_DOCKER=true

# Run the backend
CMD ["uvicorn", "app.application.main:app", "--host", "0.0.0.0", "--port", "8000"]
