# GEX ML server: serves the trained models in models/ (train them first with python train.py)
#   docker build -t gex-ml python_model
#   docker run -p 8000:8000 -e ALLOWED_ORIGINS=https://your-app.example gex-ml

# Same Python as training, so the pickled models load
FROM python:3.14-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# XGBoost needs the OpenMP runtime
RUN apt-get update \
    && apt-get install -y --no-install-recommends libgomp1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN useradd --create-home --uid 1000 app
USER app

EXPOSE 8000

# Healthy only once the models are loaded, not just when the process is up
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD python -c "import json, urllib.request; json.load(urllib.request.urlopen('http://127.0.0.1:8000/health', timeout=4))['models_ready'] or exit(1)"

CMD ["python", "-m", "uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
