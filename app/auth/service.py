from __future__ import annotations

import hashlib
import hmac
import json
import secrets
from datetime import datetime, timezone
from typing import Any

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.auth.schema import LoginRequest, RegisterRequest
from app.shared.paths import SESSIONS_DB_PATH, USERS_DB_PATH, ensure_storage_dirs

DEFAULT_USERS = [
    {"username": "farmer", "password": "farmer123", "full_name": "Farmer Demo"},
    {"username": "admin", "password": "admin123", "full_name": "Farm Admin"},
]

auth_scheme = HTTPBearer(auto_error=False)


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _read_json(path, default: Any):
    ensure_storage_dirs()
    if not path.exists():
        _write_json(path, default)
        return default

    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        _write_json(path, default)
        return default


def _write_json(path, data: Any) -> None:
    path.write_text(json.dumps(data, indent=2), encoding="utf-8")


def _password_hash(password: str, salt_hex: str) -> str:
    return hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        bytes.fromhex(salt_hex),
        120_000,
    ).hex()


def _make_user_record(username: str, password: str, full_name: str) -> dict[str, str]:
    salt = secrets.token_hex(16)
    return {
        "username": username,
        "full_name": full_name,
        "salt": salt,
        "password_hash": _password_hash(password, salt),
        "created_at": _now_iso(),
    }


def _ensure_default_users() -> list[dict[str, str]]:
    users = _read_json(USERS_DB_PATH, [])
    if users:
        return users

    default_records = [
        _make_user_record(
            username=item["username"],
            password=item["password"],
            full_name=item["full_name"],
        )
        for item in DEFAULT_USERS
    ]
    _write_json(USERS_DB_PATH, default_records)
    return default_records


def _load_users() -> list[dict[str, str]]:
    return _ensure_default_users()


def _save_users(users: list[dict[str, str]]) -> None:
    _write_json(USERS_DB_PATH, users)


def _load_sessions() -> dict[str, dict[str, str]]:
    return _read_json(SESSIONS_DB_PATH, {})


def _save_sessions(sessions: dict[str, dict[str, str]]) -> None:
    _write_json(SESSIONS_DB_PATH, sessions)


def _public_user(user: dict[str, str]) -> dict[str, str]:
    return {
        "username": user["username"],
        "full_name": user["full_name"],
        "created_at": user["created_at"],
    }


def register_user(payload: RegisterRequest) -> dict[str, Any]:
    username = payload.username.strip().lower()
    full_name = (payload.full_name or username.title()).strip()
    users = _load_users()

    if any(item["username"] == username for item in users):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username already exists.",
        )

    new_user = _make_user_record(username=username, password=payload.password, full_name=full_name)
    users.append(new_user)
    _save_users(users)
    return login_user(LoginRequest(username=username, password=payload.password))


def login_user(payload: LoginRequest) -> dict[str, Any]:
    username = payload.username.strip().lower()
    users = _load_users()
    user = next((item for item in users if item["username"] == username), None)

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password.",
        )

    expected_hash = _password_hash(payload.password, user["salt"])
    if not hmac.compare_digest(expected_hash, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password.",
        )

    sessions = _load_sessions()
    token = secrets.token_urlsafe(32)
    sessions[token] = {
        "username": user["username"],
        "issued_at": _now_iso(),
    }
    _save_sessions(sessions)

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": _public_user(user),
    }


def logout_user(token: str) -> None:
    sessions = _load_sessions()
    if token in sessions:
        sessions.pop(token, None)
        _save_sessions(sessions)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(auth_scheme),
) -> dict[str, str]:
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required.",
        )

    sessions = _load_sessions()
    session = sessions.get(credentials.credentials)
    if session is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired or invalid.",
        )

    users = _load_users()
    user = next((item for item in users if item["username"] == session["username"]), None)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found.",
        )

    return _public_user(user)


def get_token(credentials: HTTPAuthorizationCredentials | None = Depends(auth_scheme)) -> str:
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required.",
        )
    return credentials.credentials
