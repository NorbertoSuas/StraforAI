import os
from pathlib import Path

# Model Configuration
MODEL_CONFIG = {
    'model_name': 'candidate_matcher',
    'version': '1.0.0',
    'embedding_dim': 768,  # BERT base embedding dimension
    'max_sequence_length': 512,
    'batch_size': 32,
    'learning_rate': 2e-5,
}

# Document Processing Configuration
DOC_CONFIG = {
    'supported_formats': ['.pdf', '.doc', '.docx'],
    'max_file_size': 10 * 1024 * 1024,  # 10MB
    'extraction_timeout': 300,  # seconds
    'resume_dir': 'frontend/resumes'  # Directory where resumes are stored
}

# Data Source Configuration
DATA_SOURCES = {
    'mongodb': {
        'enabled': True,
        'collection': 'candidates',
        'refresh_interval': 3600,  # 1 hour
    }
}

# Model Storage Configuration
STORAGE_CONFIG = {
    'model_path': Path(__file__).parent / 'trained_models',
    'cache_path': Path(__file__).parent / 'cache',
    'log_path': Path(__file__).parent / 'logs',
    'api_cache_path': Path(__file__).parent / 'api_cache'  # For caching API responses
}

# Create necessary directories
for path in STORAGE_CONFIG.values():
    os.makedirs(path, exist_ok=True) 