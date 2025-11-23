FROM python:3.12-slim

WORKDIR /app

# 1. Update and install build dependencies
RUN apt-get update && apt-get install -y build-essential && apt-get clean

COPY requirements.txt .

# 2. Install all dependencies in one step.
# Use --extra-index-url to make pip look at both PyPI (default) and the PyTorch index.
RUN pip install --upgrade pip && \
    pip install --no-cache-dir \
        -r requirements.txt \
        --extra-index-url https://download.pytorch.org/whl/cpu

COPY . .

COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh


EXPOSE 8000

CMD ["/docker-entrypoint.sh"]