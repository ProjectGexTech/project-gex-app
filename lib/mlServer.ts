// Where the Python ML server (python_model/app.py) runs; set ML_SERVER_URL when it isn't local
export const ML_SERVER = process.env.ML_SERVER_URL ?? 'http://localhost:8000';
