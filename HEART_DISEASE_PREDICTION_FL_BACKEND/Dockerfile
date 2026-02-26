FROM python:3.10-slim

WORKDIR /app

# Enable efficient python container logging
ENV PYTHONUNBUFFERED=1 
ENV PYTHONDONTWRITEBYTECODE=1

# System updates and dependencies (required for some ML libraries)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first to leverage Docker cache
COPY requirements.txt .

# Install dependencies (incorporates CPU URL mapped in the requirements file)
RUN pip install --no-cache-dir --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

# Copy all the application files into the active working directory
COPY . .

# HuggingFace Spaces traditionally expose port 7860
EXPOSE 7860

# Run the backend interface on host 0.0.0.0 allowing external ingress
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "7860"]
