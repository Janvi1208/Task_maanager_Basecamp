import hashlib
import hmac
import secrets


SALT_BYTES = 16
KEY_BYTES = 64
N = 2**14
R = 8
P = 1


def hash_password(password: str) -> str:
    salt = secrets.token_bytes(SALT_BYTES)
    derived = hashlib.scrypt(password.encode(), salt=salt, n=N, r=R, p=P, dklen=KEY_BYTES)
    return f"scrypt${N}${R}${P}${salt.hex()}${derived.hex()}"


def verify_password(password: str, password_hash: str) -> bool:
    try:
        scheme, n, r, p, salt_hex, derived_hex = password_hash.split("$")
        if scheme != "scrypt":
            return False
        candidate = hashlib.scrypt(
            password.encode(),
            salt=bytes.fromhex(salt_hex),
            n=int(n),
            r=int(r),
            p=int(p),
            dklen=KEY_BYTES,
        )
        return hmac.compare_digest(candidate.hex(), derived_hex)
    except (ValueError, TypeError):
        return False