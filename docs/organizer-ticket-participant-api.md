# Organizer API Spec: Ticket & Participant Management

Dokumen ini adalah kontrak API untuk flow organizer pada halaman `Check-In`, `Kelola Ticket`, `Partisipan`, dan `Riwayat`.

## Auth

- Header: `Authorization: Bearer <token>`
- Role wajib: `organizer`
- Untuk endpoint validasi tiket, akses juga bisa via membership event (`owner/support`).

## 1) Daftar Event Organizer

- `GET /api/v1/organizer/events`
- Query:
  - `offset` default `0`
  - `limit` default `10`, max `100`
  - `q` search judul event
  - `status` filter status event
- Response:

```json
{
  "success": true,
  "message": "Daftar event organizer berhasil diambil",
  "total": 12,
  "data": [
    {
      "id": "uuid",
      "slug": "music-fest-2026",
      "title": "Music Fest 2026",
      "type": "external",
      "max_capacity": 500,
      "total_sold": 120,
      "is_online": false,
      "organizer_name": "Eventin",
      "address_title": "Jakarta Convention Hall",
      "image_url": "https://...",
      "start_date": "2026-06-01T09:00:00Z",
      "status": "published"
    }
  ]
}
```

## 2) Detail Event Organizer (preload ticket setup)

- `GET /api/v1/organizer/events/{eventID}`
- Tujuan FE: ambil snapshot event lengkap termasuk `ticket_categories` untuk form edit tiket.

## 3) Update Kategori Tiket Event

- `PATCH /api/v1/organizer/events/{id}/tickets`
- Catatan: path param menggunakan `{id}` (nilai tetap UUID event).
- Body:

```json
{
  "actions": {
    "added": [
      {
        "name": "VIP",
        "price": 250000,
        "quota": 100,
        "description": "VIP access",
        "start_date_time": "2026-05-01T00:00:00Z",
        "end_date_time": "2026-05-31T23:59:59Z",
        "type": "paid"
      }
    ],
    "updated": [
      {
        "id": "ticket-category-uuid",
        "name": "Regular",
        "price": 100000,
        "quota": 300,
        "description": "Regular seat",
        "start_date_time": "2026-05-01T00:00:00Z",
        "end_date_time": "2026-05-31T23:59:59Z",
        "type": "paid"
      }
    ],
    "deleted_ids": [
      "ticket-category-uuid-to-delete"
    ]
  }
}
```

- Response:

```json
{
  "success": true,
  "message": "Kategori tiket berhasil diperbarui"
}
```

### Rule penting

- `updated[].quota` tidak boleh lebih kecil dari `booked` existing.
- `deleted_ids` gagal jika tiket sudah pernah dibook (`booked > 0`).
- Window tiket harus berada dalam rentang registrasi event.
- Setelah PATCH sukses, FE disarankan refresh detail event (hindari stale optimistic state).

## 4) Validasi Check-In Tiket

- `POST /api/v1/organizer/events/{eventID}/tickets/validate`

### Payload QR

```json
{
  "validation_method": "qr",
  "qr_token": "QRCODE-VALUE-001",
  "checkpoint_name": "Gate A",
  "device_label": "Scanner 1"
}
```

### Payload manual

```json
{
  "validation_method": "manual",
  "manual_code": "MC-ABCD1234",
  "checkpoint_name": "Gate B",
  "device_label": "Scanner 2"
}
```

### Response sukses

```json
{
  "success": true,
  "message": "ticket validated successfully",
  "data": {
    "ticket_id": "uuid",
    "ticket_number": "TKT-20260508-00001",
    "manual_code": "MC-ABCD1234",
    "event_id": "uuid",
    "participant_name": "John Doe",
    "ticket_status": "checked_in",
    "checked_in_at": "2026-05-08T10:10:00Z",
    "validation_method": "qr"
  }
}
```

### Idempotency

- Rescan tiket yang sudah check-in akan error `ALREADY_CHECKED_IN`.
- State tiket tidak berubah (idempotent terhadap state).

## 5) Riwayat Check-In Event

- `GET /api/v1/organizer/events/{eventID}/check-ins?page=1&limit=20`

Response:

```json
{
  "success": true,
  "message": "check-in history fetched successfully",
  "data": {
    "items": [
      {
        "id": "uuid",
        "ticket_id": "uuid",
        "ticket_number": "TKT-...",
        "participant_name": "John Doe",
        "validation_method": "qr",
        "result": "success",
        "error_code": null,
        "scanner_user_id": 77,
        "checkpoint_name": "Gate A",
        "device_label": "Scanner 1",
        "created_at": "2026-05-08T10:10:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total_items": 1,
      "total_pages": 1
    }
  }
}
```

## 6) Daftar Partisipan Event

- `GET /api/v1/organizer/events/{eventID}/participants?page=1&limit=20`

Response:

```json
{
  "success": true,
  "message": "participants fetched successfully",
  "data": {
    "items": [
      {
        "ticket_id": "uuid",
        "ticket_number": "TKT-...",
        "manual_code": "MC-ABCD1234",
        "ticket_status": "checked_in",
        "attendance_state": "checked_in",
        "checked_in_at": "2026-05-08T10:10:00Z",
        "participant_name": "John Doe",
        "participant_email": "john@example.com",
        "participant_phone": "08123",
        "ticket_category_id": "uuid",
        "ticket_category_name": "Regular",
        "order_id": "uuid",
        "ticket_owner_user_id": 101
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total_items": 1,
      "total_pages": 1
    }
  }
}
```

## Error Code Minimum yang harus di-handle FE

- `UNAUTHORIZED`
- `FORBIDDEN_EVENT_ACCESS`
- `VALIDATION_METHOD_INVALID`
- `VALIDATION_PAYLOAD_INVALID`
- `INVALID_QR_TOKEN`
- `TICKET_NOT_FOUND`
- `TICKET_EVENT_MISMATCH`
- `TICKET_NOT_CHECKIN_ELIGIBLE`
- `ALREADY_CHECKED_IN`
- `INVALID_INPUT`

## Rekomendasi Flow FE

1. Event list: `GET /organizer/events`
2. Klik event:
3. Tab `Kelola Ticket`: `GET /organizer/events/{eventID}` lalu `PATCH /events/{id}/tickets`
4. Tab `Check-In`: `POST /tickets/validate`
5. Tab `Partisipan`: `GET /participants`
6. Tab `Riwayat`: `GET /check-ins`
7. Setelah validasi sukses/gagal: refresh `participants` dan `check-ins`.

