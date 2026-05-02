from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import os
import logging
import uuid
import bcrypt
import jwt
from datetime import datetime, timezone, timedelta
from typing import List, Optional

from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr, ConfigDict


# ============================================================
# Setup
# ============================================================
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_ALGORITHM = "HS256"

def get_jwt_secret() -> str:
    return os.environ["JWT_SECRET"]


# ============================================================
# Password helpers
# ============================================================
def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")

def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


# ============================================================
# JWT helpers
# ============================================================
def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(hours=8),
        "type": "access",
    }
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)


# ============================================================
# Models
# ============================================================
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    email: EmailStr
    role: str
    name: Optional[str] = None

class BookingCreate(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    phone: str = Field(min_length=7, max_length=25)
    email: Optional[EmailStr] = None
    package_id: str
    package_name: str
    package_price: float
    package_type: str  # 'individual' or 'family'
    participants: int = Field(ge=1, le=20)
    date: str  # YYYY-MM-DD
    time: str  # HH:MM
    notes: Optional[str] = ""
    deposit: float = 300.0

class BookingOut(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    phone: str
    email: Optional[str] = None
    package_id: str
    package_name: str
    package_price: float
    package_type: str
    participants: int
    date: str
    time: str
    notes: Optional[str] = ""
    deposit: float
    status: str
    created_at: str

class BookingStatusUpdate(BaseModel):
    status: str  # pending | confirmed | cancelled | completed


# Conflict window in minutes (±1 hour around each booking)
CONFLICT_MINUTES = 60


def _to_minutes(time_str: str) -> int:
    """Convert 'HH:MM' to minutes since midnight."""
    try:
        h, m = time_str.split(":")
        return int(h) * 60 + int(m)
    except Exception:
        return -1


async def _has_conflict(date: str, time_str: str) -> bool:
    """Returns True if a non-cancelled booking exists within ±60 min on that date."""
    new_t = _to_minutes(time_str)
    if new_t < 0:
        return False
    cursor = db.bookings.find(
        {"date": date, "status": {"$ne": "cancelled"}},
        {"_id": 0, "time": 1},
    )
    async for doc in cursor:
        existing = _to_minutes(doc.get("time", ""))
        if existing < 0:
            continue
        if abs(existing - new_t) <= CONFLICT_MINUTES:
            return True
    return False


# ============================================================
# Auth dependency
# ============================================================
async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="No autenticado")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Token inválido")
        user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0, "password_hash": 0})
        if not user:
            raise HTTPException(status_code=401, detail="Usuario no existe")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expirado")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token inválido")

async def require_admin(user: dict = Depends(get_current_user)) -> dict:
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Acceso restringido")
    return user


# ============================================================
# App + router
# ============================================================
app = FastAPI(title="Gotcha Los Patos API")
api_router = APIRouter(prefix="/api")


@api_router.get("/")
async def root():
    return {"message": "Gotcha Los Patos La Marquesa API"}


# -------- Auth --------
@api_router.post("/auth/login")
async def login(data: LoginRequest, response: Response):
    email = data.email.lower().strip()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(data.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Credenciales inválidas")

    token = create_access_token(user["id"], user["email"])
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=8 * 3600,
        path="/",
    )
    return {
        "user": {
            "id": user["id"],
            "email": user["email"],
            "role": user["role"],
            "name": user.get("name"),
        },
        "access_token": token,
    }


@api_router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    return {"ok": True}


@api_router.get("/auth/me", response_model=UserOut)
async def me(user: dict = Depends(get_current_user)):
    return UserOut(**user)


# -------- Bookings (Public) --------
@api_router.get("/availability")
async def availability(date: str):
    """Returns blocked slots for a given date.
    A slot at time T is blocked if any active booking falls within [T-60, T+60] minutes.
    Returned 'blocked_times' = exact times of existing bookings.
    Frontend expands ±1h in the UI when selecting.
    """
    docs = await db.bookings.find(
        {"date": date, "status": {"$ne": "cancelled"}},
        {"_id": 0, "time": 1, "participants": 1},
    ).to_list(500)
    blocked_times = sorted({d["time"] for d in docs if d.get("time")})
    return {
        "date": date,
        "blocked_times": blocked_times,
        "conflict_window_minutes": CONFLICT_MINUTES,
    }


@api_router.post("/bookings", response_model=BookingOut)
async def create_booking(data: BookingCreate):
    # Conflict check: ±60 minutes window
    if await _has_conflict(data.date, data.time):
        raise HTTPException(
            status_code=409,
            detail="Ese horario está ocupado. Elige otro slot.",
        )

    now = datetime.now(timezone.utc).isoformat()
    booking_id = str(uuid.uuid4())
    doc = {
        "id": booking_id,
        "name": data.name.strip(),
        "phone": data.phone.strip(),
        "email": data.email.lower().strip() if data.email else None,
        "package_id": data.package_id,
        "package_name": data.package_name,
        "package_price": float(data.package_price),
        "package_type": data.package_type,
        "participants": int(data.participants),
        "date": data.date,
        "time": data.time,
        "notes": (data.notes or "").strip(),
        "deposit": float(data.deposit),
        "status": "pending",
        "created_at": now,
    }
    await db.bookings.insert_one(doc.copy())
    return BookingOut(**doc)


# -------- Bookings (Admin) --------
@api_router.get("/admin/bookings", response_model=List[BookingOut])
async def list_bookings(_: dict = Depends(require_admin)):
    docs = await db.bookings.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return [BookingOut(**d) for d in docs]


@api_router.patch("/admin/bookings/{booking_id}", response_model=BookingOut)
async def update_booking(booking_id: str, data: BookingStatusUpdate, _: dict = Depends(require_admin)):
    if data.status not in {"pending", "confirmed", "cancelled", "completed"}:
        raise HTTPException(status_code=400, detail="Estado inválido")
    res = await db.bookings.find_one_and_update(
        {"id": booking_id},
        {"$set": {"status": data.status}},
        return_document=True,
        projection={"_id": 0},
    )
    if not res:
        raise HTTPException(status_code=404, detail="Reserva no encontrada")
    return BookingOut(**res)


@api_router.delete("/admin/bookings/{booking_id}")
async def delete_booking(booking_id: str, _: dict = Depends(require_admin)):
    res = await db.bookings.delete_one({"id": booking_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Reserva no encontrada")
    return {"ok": True}


@api_router.get("/admin/stats")
async def admin_stats(_: dict = Depends(require_admin)):
    total = await db.bookings.count_documents({})
    pending = await db.bookings.count_documents({"status": "pending"})
    confirmed = await db.bookings.count_documents({"status": "confirmed"})
    cancelled = await db.bookings.count_documents({"status": "cancelled"})
    completed = await db.bookings.count_documents({"status": "completed"})

    # Revenue from confirmed/completed
    pipeline = [
        {"$match": {"status": {"$in": ["confirmed", "completed"]}}},
        {"$group": {"_id": None, "revenue": {"$sum": "$package_price"}, "deposits": {"$sum": "$deposit"}}},
    ]
    rev_doc = await db.bookings.aggregate(pipeline).to_list(1)
    revenue = rev_doc[0]["revenue"] if rev_doc else 0
    deposits = rev_doc[0]["deposits"] if rev_doc else 0
    return {
        "total": total,
        "pending": pending,
        "confirmed": confirmed,
        "cancelled": cancelled,
        "completed": completed,
        "estimated_revenue": revenue,
        "collected_deposits": deposits,
    }


# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origin_regex=".*",
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
)
logger = logging.getLogger(__name__)


# ============================================================
# Startup: indexes + admin seed
# ============================================================
@app.on_event("startup")
async def on_startup():
    try:
        await db.users.create_index("email", unique=True)
        await db.bookings.create_index("created_at")
    except Exception as e:
        logger.warning(f"Index creation warning: {e}")

    admin_email = os.environ.get("ADMIN_EMAIL", "").lower().strip()
    admin_password = os.environ.get("ADMIN_PASSWORD", "")
    if not admin_email or not admin_password:
        logger.warning("ADMIN_EMAIL/ADMIN_PASSWORD not set; skipping admin seed.")
        return

    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "email": admin_email,
            "password_hash": hash_password(admin_password),
            "name": "Admin",
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        logger.info(f"Admin user seeded: {admin_email}")
    elif not verify_password(admin_password, existing.get("password_hash", "")):
        await db.users.update_one(
            {"email": admin_email},
            {"$set": {"password_hash": hash_password(admin_password)}},
        )
        logger.info(f"Admin password updated for: {admin_email}")


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
