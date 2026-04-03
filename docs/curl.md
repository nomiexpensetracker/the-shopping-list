# API cURL Commands

Use Postman variables `{{BASE_URL}}`, `{{TOKEN}}`, `{{ITEM_ID}}`, `{{PARTICIPANT_ID}}`.

| Variable | Example value |
|---|---|
| `BASE_URL` | `http://localhost:3000` |
| `TOKEN` | *(session ID returned from POST /api/sessions)* |
| `ITEM_ID` | *(item `id` returned from POST /api/sessions/[token]/items)* |
| `PARTICIPANT_ID` | *(participant `id` returned from POST /api/sessions or /participants)* |

---

## Sessions

**POST /api/sessions** — Create a new session
```bash
curl -X POST '{{BASE_URL}}/api/sessions' \
  -H 'Content-Type: application/json' \
  -d '{
    "title": "Weekly Groceries",
    "name": "Alice"
  }'
```

**GET /api/sessions/[token]** — Get session details
```bash
curl -X GET '{{BASE_URL}}/api/sessions/{{TOKEN}}' \
  -H 'Content-Type: application/json'
```

**DELETE /api/sessions/[token]** — Delete a session
```bash
curl -X DELETE '{{BASE_URL}}/api/sessions/{{TOKEN}}'
```

---

## Session Summary & Receipt

**GET /api/sessions/[token]/summary** — Get session summary (item counts, collected total)
```bash
curl -X GET '{{BASE_URL}}/api/sessions/{{TOKEN}}/summary'
```

**GET /api/sessions/[token]/receipt** — Get full receipt (participants, items, total price)
```bash
curl -X GET '{{BASE_URL}}/api/sessions/{{TOKEN}}/receipt'
```

---

## Items

**GET /api/sessions/[token]/items** — List all items in session
```bash
curl -X GET '{{BASE_URL}}/api/sessions/{{TOKEN}}/items'
```

**POST /api/sessions/[token]/items** — Add a new item
```bash
curl -X POST '{{BASE_URL}}/api/sessions/{{TOKEN}}/items' \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Milk",
    "quantity": 2,
    "description": "Full fat"
  }'
```

**PATCH /api/sessions/[token]/items/[itemId]** — Edit an item (last-write-wins; send `client_edit_at` to enable conflict detection)
```bash
curl -X PATCH '{{BASE_URL}}/api/sessions/{{TOKEN}}/items/{{ITEM_ID}}' \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Whole Milk",
    "quantity": 3,
    "description": "Full fat",
    "price": 1.99,
    "state": "collected",
    "client_edit_at": "2026-04-03T10:00:00.000Z"
  }'
```
> Valid `state` transitions: `added` → `collected`, `collected` → `added`, any → `deleted`.  
> A `409` response with `{ "conflict": true, "item": {...} }` means a later write already exists.

**DELETE /api/sessions/[token]/items/[itemId]** — Soft-delete an item
```bash
curl -X DELETE '{{BASE_URL}}/api/sessions/{{TOKEN}}/items/{{ITEM_ID}}'
```

---

## Activities

**GET /api/sessions/[token]/activities** — List all activities (newest first)
```bash
curl -X GET '{{BASE_URL}}/api/sessions/{{TOKEN}}/activities'
```

**POST /api/sessions/[token]/activities** — Log an activity
```bash
curl -X POST '{{BASE_URL}}/api/sessions/{{TOKEN}}/activities' \
  -H 'Content-Type: application/json' \
  -d '{
    "item_id": "{{ITEM_ID}}",
    "participant_id": "{{PARTICIPANT_ID}}",
    "action": "collected"
  }'
```

---

## Participants

**POST /api/sessions/[token]/participants** — Join a session (add participant)
```bash
curl -X POST '{{BASE_URL}}/api/sessions/{{TOKEN}}/participants' \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Bob"
  }'
```

**PATCH /api/sessions/[token]/participants** — Update a participant's name or color
```bash
curl -X PATCH '{{BASE_URL}}/api/sessions/{{TOKEN}}/participants' \
  -H 'Content-Type: application/json' \
  -d '{
    "participant_id": "{{PARTICIPANT_ID}}",
    "name": "Bobby",
    "color": "#FF5733"
  }'
```

**DELETE /api/sessions/[token]/participants** — Remove a participant
```bash
curl -X DELETE '{{BASE_URL}}/api/sessions/{{TOKEN}}/participants' \
  -H 'Content-Type: application/json' \
  -d '{
    "participant_id": "{{PARTICIPANT_ID}}"
  }'
```
