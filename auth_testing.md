# Auth Testing Playbook - Gotcha Los Patos

## Admin Credentials
- Email: gotchalospatos351@gmail.com
- Password: GotchaLosPatos376

## Endpoints
- POST /api/auth/login
- POST /api/auth/logout
- GET /api/auth/me
- POST /api/bookings (public)
- GET /api/admin/bookings (admin)
- PATCH /api/admin/bookings/{id} (admin)
- DELETE /api/admin/bookings/{id} (admin)

## Curl Tests
```
# Login
curl -c cookies.txt -X POST http://localhost:8001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"gotchalospatos351@gmail.com","password":"GotchaLosPatos376"}'

# Get current user
curl -b cookies.txt http://localhost:8001/api/auth/me

# Create a booking (public)
curl -X POST http://localhost:8001/api/bookings \
  -H "Content-Type: application/json" \
  -d '{"name":"Juan","phone":"5551234567","email":"juan@test.com","package_id":"individual_1","package_name":"PAQUETE 1","participants":1,"date":"2025-12-20","time":"12:00","notes":""}'

# List bookings (admin)
curl -b cookies.txt http://localhost:8001/api/admin/bookings
```

## Mongo Verification
- bcrypt hash starts with `$2b$`
- Index on `users.email` (unique)
