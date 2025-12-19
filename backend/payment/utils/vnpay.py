import hmac
import hashlib
import urllib.parse

def build_query(params: dict) -> str:
    """Sort params alphabetically and URL encode."""
    items = sorted((k, '' if v is None else str(v)) for k, v in params.items())
    return "&".join(f"{urllib.parse.quote(k, safe='')}={urllib.parse.quote(v, safe='')}" for k, v in items)

def create_secure_hash(secret_key: str, params: dict) -> str:
    """Tạo chữ ký HmacSHA512."""
    query = build_query(params)
    return hmac.new(secret_key.encode('utf-8'), query.encode('utf-8'), hashlib.sha512).hexdigest()

def verify_secure_hash(secret_key: str, params: dict, received_hash: str) -> bool:
    """Kiểm tra chữ ký trả về từ VNPay."""
    return create_secure_hash(secret_key, params).lower() == received_hash.lower()
