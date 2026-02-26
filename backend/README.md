# Procurement System Backend

Laravel backend for Procurement + Purchase Request workflows with file attachments, notifications, reporting, and boolean soft-delete/restore logic.

## Features

- OTP authentication (`request-otp`, `verify-otp`, `resend-otp`)
- Active-device session guard
- Procurement module
  - Create, list, show, update, delete, restore
  - Search endpoint (keywords, exact values, numeric IDs, typo-tolerant repeated-letter normalization)
  - PDF attachment upload/view/download
- Purchase Request module (separate from Procurement page behavior)
  - Auto-created when procurement is created
  - Separate endpoints for list/show/update/delete/restore
  - Linked to procurement via foreign key
  - Contains office, date created, responsibility center code, purpose, purchase request number
- Items module (linked to purchase requests)
  - Create, update, delete, restore via purchase request endpoints
  - Contains item no, stock no, unit, item description, item inclusions, quantity, unit cost
- Boolean delete/restore for:
  - `procurements.deleted`
  - `purchase_requests.deleted`
  - `items.deleted`
- Notifications module
- Reports overview endpoint

## Tech Stack

- PHP / Laravel
- MySQL (or configured DB in `.env`)
- PHPUnit for tests

## Setup After Cloning

1. Clone repository and open backend folder.
2. Install dependencies:
   - `composer install`
3. Copy env file:
   - `copy .env.example .env` (Windows)
4. Configure `.env`:
   - database credentials
   - app URL / mail settings as needed
5. Generate app key:
   - `php artisan key:generate`
6. Run migrations:
   - `php artisan migrate`
7. Create storage symlink (required for public file access like PDF attachments):
   - `php artisan storage:link`
8. (Optional) Seed demo records:
   - `php artisan db:seed --class=ProcurementDemoSeeder`
9. Start server:
   - `php artisan serve`

## Running Tests

- Run all tests:
  - `php artisan test`

## Core API Routes

### Auth

- `POST /auth/request-otp`
- `POST /auth/verify-otp`
- `POST /auth/resend-otp`
- `GET /auth/me`
- `GET /auth/profile`
- `POST /auth/logout`

### Procurements

- `GET /procurements`
- `GET /procurements/search`
- `POST /procurements`
- `GET /procurements/{procurement}`
- `PUT /procurements/{procurement}`
- `DELETE /procurements/{procurement}`
- `PATCH /procurements/{procurement}/restore`

### Procurement Attachments (PDF)

- `POST /procurements/{procurement}/attachments`
- `GET /procurements/{procurement}/attachments/{attachment}`
- `GET /procurements/{procurement}/attachments/{attachment}/download`

### Purchase Requests

- `GET /purchase-requests`
- `GET /purchase-requests/{purchaseRequest}`
- `PUT /purchase-requests/{purchaseRequest}`
- `DELETE /purchase-requests/{purchaseRequest}`
- `PATCH /purchase-requests/{purchaseRequest}/restore`

### Items (under Purchase Request)

- `POST /purchase-requests/{purchaseRequest}/items`
- `PUT /purchase-requests/{purchaseRequest}/items/{item}`
- `DELETE /purchase-requests/{purchaseRequest}/items/{item}`
- `PATCH /purchase-requests/{purchaseRequest}/items/{item}/restore`

### Other

- `GET /notifications`
- `GET /notifications/unread-count`
- `PATCH /notifications/{notification}/read`
- `PATCH /notifications/read-all`
- `GET /reports/overview`

## Important Notes for Postman Testing

- Routes are defined in `routes/web.php`.
- CSRF exceptions are configured in `bootstrap/app.php` for current API testing flow.
- Most routes require authenticated session/device context; authenticate first via OTP endpoints.
