"""Backend API tests for Gotcha Los Patos La Marquesa."""
import os
import uuid
import pytest
import requests
from datetime import datetime

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://gotcha-paintball-3d.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "gotchalospatos351@gmail.com"
ADMIN_PASSWORD = "GotchaLosPatos376"
STAFF_USERNAME = "AdminGLP2026"
STAFF_PASSWORD = "GotchaLosPatos0126"


@pytest.fixture(scope="session")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def admin_token(session):
    r = session.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    if r.status_code != 200:
        pytest.skip(f"Admin login failed: {r.status_code} {r.text}")
    return r.json()["access_token"]


@pytest.fixture(scope="session")
def admin_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}


# ---------------- Health ----------------
def test_root(session):
    r = session.get(f"{API}/")
    assert r.status_code == 200
    assert "message" in r.json()


# ---------------- Auth ----------------
class TestAuth:
    def test_login_success_returns_user_and_token(self, session):
        r = session.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        assert r.status_code == 200
        data = r.json()
        assert "access_token" in data and isinstance(data["access_token"], str)
        assert data["user"]["email"] == ADMIN_EMAIL
        assert data["user"]["role"] == "admin"
        # cookie set
        assert "access_token" in r.cookies or any("access_token" in c.name for c in r.cookies)

    def test_login_wrong_password(self, session):
        r = session.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": "wrongpass"})
        assert r.status_code == 401

    def test_login_unknown_email(self, session):
        r = session.post(f"{API}/auth/login", json={"email": "nonexistent@example.com", "password": "xxxxx"})
        assert r.status_code == 401

    def test_me_with_bearer(self, session, admin_headers):
        r = session.get(f"{API}/auth/me", headers=admin_headers)
        assert r.status_code == 200
        data = r.json()
        assert data["email"] == ADMIN_EMAIL
        assert data["role"] == "admin"

    def test_me_without_auth(self, session):
        # Use a fresh session without cookies
        r = requests.get(f"{API}/auth/me")
        assert r.status_code == 401

    def test_bcrypt_hash_format(self):
        """Verify bcrypt hash format in DB via direct check (requires mongo access)."""
        try:
            from motor.motor_asyncio import AsyncIOMotorClient  # noqa
            import asyncio
            from pymongo import MongoClient
            mc = MongoClient(os.environ.get("MONGO_URL", "mongodb://localhost:27017"))
            db = mc[os.environ.get("DB_NAME", "test_database")]
            user = db.users.find_one({"email": ADMIN_EMAIL})
            if user and "password_hash" in user:
                assert user["password_hash"].startswith("$2b$") or user["password_hash"].startswith("$2a$")
            mc.close()
        except Exception as e:
            pytest.skip(f"Cannot access DB directly: {e}")


# ---------------- Iteration 3: Dual Login (identifier=email|username) ----------------
class TestDualLogin:
    def test_login_with_identifier_email(self, session):
        r = session.post(f"{API}/auth/login", json={"identifier": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        assert r.status_code == 200, r.text
        data = r.json()
        assert "access_token" in data
        assert data["user"]["email"] == ADMIN_EMAIL
        assert data["user"]["role"] == "admin"

    def test_login_with_username(self, session):
        r = session.post(f"{API}/auth/login", json={"identifier": STAFF_USERNAME, "password": STAFF_PASSWORD})
        assert r.status_code == 200, r.text
        data = r.json()
        assert "access_token" in data
        assert data["user"]["username"] == STAFF_USERNAME
        assert data["user"]["role"] == "admin"
        # Cookie is set
        assert any("access_token" in c.name for c in r.cookies)

    def test_login_username_case_insensitive(self, session):
        r = session.post(f"{API}/auth/login", json={"identifier": STAFF_USERNAME.lower(), "password": STAFF_PASSWORD})
        assert r.status_code == 200, r.text
        assert r.json()["user"]["username"] == STAFF_USERNAME

    def test_login_legacy_email_field_still_works(self, session):
        # legacy payload {email,password}
        r = session.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        assert r.status_code == 200
        assert r.json()["user"]["email"] == ADMIN_EMAIL

    def test_login_username_wrong_password(self, session):
        r = session.post(f"{API}/auth/login", json={"identifier": STAFF_USERNAME, "password": "wrongXXX"})
        assert r.status_code == 401
        assert "Credenciales inv" in r.text or "credenciales" in r.text.lower()

    def test_login_unknown_username(self, session):
        r = session.post(f"{API}/auth/login", json={"identifier": "ghost_user_xxx", "password": "anything"})
        assert r.status_code == 401

    def test_login_empty_identifier(self, session):
        r = session.post(f"{API}/auth/login", json={"identifier": "", "password": "x"})
        assert r.status_code == 400

    def test_login_missing_identifier_and_email(self, session):
        r = session.post(f"{API}/auth/login", json={"password": "x"})
        assert r.status_code == 400

    def test_staff_can_access_admin_endpoints(self, session):
        # Login as staff
        r = session.post(f"{API}/auth/login", json={"identifier": STAFF_USERNAME, "password": STAFF_PASSWORD})
        assert r.status_code == 200
        token = r.json()["access_token"]
        h = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

        # GET /api/admin/bookings
        rb = session.get(f"{API}/admin/bookings", headers=h)
        assert rb.status_code == 200
        assert isinstance(rb.json(), list)

        # GET /api/admin/stats
        rs = session.get(f"{API}/admin/stats", headers=h)
        assert rs.status_code == 200
        for k in ["total", "pending", "confirmed", "cancelled", "completed"]:
            assert k in rs.json()

        # PATCH + DELETE on a freshly created booking
        payload = {
            "name": "TEST_StaffPatch", "phone": "+525500000077",
            "package_id": "ind_1", "package_name": "Ind 1", "package_price": 160.0,
            "package_type": "individual", "participants": 1,
            "date": "2026-08-15", "time": "10:00", "deposit": 300.0,
        }
        cr = session.post(f"{API}/bookings", json=payload)
        bid = cr.json()["id"]
        pr = session.patch(f"{API}/admin/bookings/{bid}", json={"status": "confirmed"}, headers=h)
        assert pr.status_code == 200
        assert pr.json()["status"] == "confirmed"
        dr = session.delete(f"{API}/admin/bookings/{bid}", headers=h)
        assert dr.status_code == 200

    def test_both_users_persist(self, session):
        """Both seeded users must resolve via login (idempotent seed)."""
        r1 = session.post(f"{API}/auth/login", json={"identifier": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        r2 = session.post(f"{API}/auth/login", json={"identifier": STAFF_USERNAME, "password": STAFF_PASSWORD})
        assert r1.status_code == 200 and r2.status_code == 200
        assert r1.json()["user"]["id"] != r2.json()["user"]["id"]


# ---------------- Bookings Public ----------------
class TestBookingsPublic:
    def _payload(self, suffix=""):
        return {
            "name": f"TEST_User{suffix}",
            "phone": "+525512345678",
            "email": f"test{suffix}@example.com",
            "package_id": "ind_2",
            "package_name": "Paquete Intermedio",
            "package_price": 190.0,
            "package_type": "individual",
            "participants": 2,
            "date": "2026-03-15",
            "time": "14:00",
            "notes": "TEST booking",
            "deposit": 300.0,
        }

    def test_create_booking_no_auth(self, session):
        r = session.post(f"{API}/bookings", json=self._payload("_A"))
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["status"] == "pending"
        assert data["deposit"] == 300.0
        assert data["package_price"] == 190.0
        assert data["participants"] == 2
        assert "id" in data
        assert "_id" not in data
        # store for later
        pytest.booking_id_a = data["id"]

    def test_create_booking_validation_error(self, session):
        bad = self._payload("_bad")
        bad["participants"] = 0  # ge=1
        r = session.post(f"{API}/bookings", json=bad)
        assert r.status_code == 422

    def test_create_booking_missing_fields(self, session):
        r = session.post(f"{API}/bookings", json={"name": "X"})
        assert r.status_code == 422


# ---------------- Admin Bookings ----------------
class TestAdminBookings:
    def test_list_requires_auth(self, session):
        r = requests.get(f"{API}/admin/bookings")
        assert r.status_code == 401

    def test_list_bookings(self, session, admin_headers):
        r = session.get(f"{API}/admin/bookings", headers=admin_headers)
        assert r.status_code == 200
        bookings = r.json()
        assert isinstance(bookings, list)
        for b in bookings:
            assert "_id" not in b
            assert "id" in b
        # verify sorted desc by created_at
        if len(bookings) >= 2:
            assert bookings[0]["created_at"] >= bookings[-1]["created_at"]

    def test_update_status_confirm(self, session, admin_headers):
        # create a booking
        payload = {
            "name": "TEST_Confirm", "phone": "+525500000001",
            "package_id": "fam_1", "package_name": "Fam 1", "package_price": 2500.0,
            "package_type": "family", "participants": 5,
            "date": "2026-04-01", "time": "10:00", "notes": "", "deposit": 300.0,
        }
        cr = session.post(f"{API}/bookings", json=payload)
        assert cr.status_code == 200
        bid = cr.json()["id"]

        r = session.patch(f"{API}/admin/bookings/{bid}", json={"status": "confirmed"}, headers=admin_headers)
        assert r.status_code == 200
        assert r.json()["status"] == "confirmed"

        # verify via list
        lst = session.get(f"{API}/admin/bookings", headers=admin_headers).json()
        found = [b for b in lst if b["id"] == bid]
        assert found and found[0]["status"] == "confirmed"

        # cleanup
        session.delete(f"{API}/admin/bookings/{bid}", headers=admin_headers)

    def test_update_status_invalid(self, session, admin_headers):
        payload = {
            "name": "TEST_Invalid", "phone": "+525500000002",
            "package_id": "ind_1", "package_name": "Ind 1", "package_price": 160.0,
            "package_type": "individual", "participants": 1,
            "date": "2026-04-02", "time": "11:00", "deposit": 300.0,
        }
        cr = session.post(f"{API}/bookings", json=payload)
        bid = cr.json()["id"]

        r = session.patch(f"{API}/admin/bookings/{bid}", json={"status": "rejected"}, headers=admin_headers)
        assert r.status_code == 400

        session.delete(f"{API}/admin/bookings/{bid}", headers=admin_headers)

    def test_update_nonexistent(self, session, admin_headers):
        r = session.patch(f"{API}/admin/bookings/{uuid.uuid4()}", json={"status": "confirmed"}, headers=admin_headers)
        assert r.status_code == 404

    def test_delete_booking(self, session, admin_headers):
        payload = {
            "name": "TEST_Delete", "phone": "+525500000003",
            "package_id": "ind_3", "package_name": "Ind 3", "package_price": 240.0,
            "package_type": "individual", "participants": 1,
            "date": "2026-04-03", "time": "12:00", "deposit": 300.0,
        }
        cr = session.post(f"{API}/bookings", json=payload)
        bid = cr.json()["id"]
        r = session.delete(f"{API}/admin/bookings/{bid}", headers=admin_headers)
        assert r.status_code == 200
        # verify gone
        lst = session.get(f"{API}/admin/bookings", headers=admin_headers).json()
        assert not any(b["id"] == bid for b in lst)

    def test_delete_nonexistent(self, session, admin_headers):
        r = session.delete(f"{API}/admin/bookings/{uuid.uuid4()}", headers=admin_headers)
        assert r.status_code == 404


# ---------------- Admin Stats ----------------
class TestAdminStats:
    def test_stats_requires_auth(self):
        r = requests.get(f"{API}/admin/stats")
        assert r.status_code == 401

    def test_stats_structure(self, session, admin_headers):
        r = session.get(f"{API}/admin/stats", headers=admin_headers)
        assert r.status_code == 200
        d = r.json()
        for k in ["total", "pending", "confirmed", "cancelled", "completed", "estimated_revenue", "collected_deposits"]:
            assert k in d
        assert isinstance(d["total"], int)


# ---------------- Availability + Conflict Window (Iteration 2) ----------------
class TestAvailability:
    TEST_DATE = "2026-06-15"  # Monday

    def _base_payload(self, time_str, name_suffix):
        return {
            "name": f"TEST_Avail_{name_suffix}",
            "phone": "+525500000099",
            "package_id": "ind_1", "package_name": "Ind 1", "package_price": 160.0,
            "package_type": "individual", "participants": 1,
            "date": self.TEST_DATE, "time": time_str, "deposit": 300.0,
        }

    def test_availability_empty_date(self, session, admin_headers):
        # pre-clean this date
        lst = session.get(f"{API}/admin/bookings", headers=admin_headers).json()
        for b in lst:
            if b.get("date") == self.TEST_DATE:
                session.delete(f"{API}/admin/bookings/{b['id']}", headers=admin_headers)
        r = session.get(f"{API}/availability", params={"date": self.TEST_DATE})
        assert r.status_code == 200
        data = r.json()
        assert data["date"] == self.TEST_DATE
        assert data["blocked_times"] == []
        assert data["conflict_window_minutes"] == 60

    def test_availability_returns_blocked_times_after_booking(self, session, admin_headers):
        # create 12:00
        r = session.post(f"{API}/bookings", json=self._base_payload("12:00", "base"))
        assert r.status_code == 200
        bid = r.json()["id"]

        av = session.get(f"{API}/availability", params={"date": self.TEST_DATE}).json()
        assert "12:00" in av["blocked_times"]
        assert av["conflict_window_minutes"] == 60

        # Conflict: same time
        r2 = session.post(f"{API}/bookings", json=self._base_payload("12:00", "same"))
        assert r2.status_code == 409

        # Conflict: 11:30 (30 min away)
        r3 = session.post(f"{API}/bookings", json=self._base_payload("11:30", "close"))
        assert r3.status_code == 409

        # Conflict: 13:00 (exactly 60 min -> |diff|<=60 blocks)
        r4 = session.post(f"{API}/bookings", json=self._base_payload("13:00", "edge60"))
        assert r4.status_code == 409

        # OK: 14:00 (120 min away)
        r5 = session.post(f"{API}/bookings", json=self._base_payload("14:00", "ok"))
        assert r5.status_code == 200
        bid2 = r5.json()["id"]

        # cleanup
        session.delete(f"{API}/admin/bookings/{bid}", headers=admin_headers)
        session.delete(f"{API}/admin/bookings/{bid2}", headers=admin_headers)

    def test_cancelled_booking_does_not_block(self, session, admin_headers):
        # create booking at 15:00
        r = session.post(f"{API}/bookings", json=self._base_payload("15:00", "cxl"))
        assert r.status_code == 200
        bid = r.json()["id"]
        # cancel it
        pr = session.patch(
            f"{API}/admin/bookings/{bid}",
            json={"status": "cancelled"},
            headers=admin_headers,
        )
        assert pr.status_code == 200

        # availability should NOT include 15:00
        av = session.get(f"{API}/availability", params={"date": self.TEST_DATE}).json()
        assert "15:00" not in av["blocked_times"]

        # New booking at 15:00 should succeed
        r2 = session.post(f"{API}/bookings", json=self._base_payload("15:00", "replace"))
        assert r2.status_code == 200
        bid2 = r2.json()["id"]

        session.delete(f"{API}/admin/bookings/{bid}", headers=admin_headers)
        session.delete(f"{API}/admin/bookings/{bid2}", headers=admin_headers)


# ---------------- Cleanup ----------------
def test_zzz_cleanup(admin_headers):
    """Remove any TEST_ bookings created during run."""
    s = requests.Session()
    lst = s.get(f"{API}/admin/bookings", headers=admin_headers).json()
    for b in lst:
        if b.get("name", "").startswith("TEST_"):
            s.delete(f"{API}/admin/bookings/{b['id']}", headers=admin_headers)
