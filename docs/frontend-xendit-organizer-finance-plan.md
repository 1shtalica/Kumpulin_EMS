# Frontend Plan: Xendit Checkout and Organizer Finance

This plan is adjusted to the current frontend state after commit `b845094`.

## Current Frontend State

### Buyer Checkout

- `app/(transaction)/checkout/[event_id]/page.tsx` already uses a buyer data form and calls `OrderService.createOrder` only after form validation.
- The create order service already calls `POST /events/:event_id/orders` through `services/order-service.ts`.
- Checkout already redirects to `payment.payment_url` when the backend returns it.
- Checkout already handles missing `payment.payment_url`, but it currently routes to `/payment/:order_id`.
- `app/(transaction)/orders/[order_id]/page.tsx` exists as a re-export of the payment page, so `/orders/:order_id` is already available.
- `app/(transaction)/payment/[order_id]/page.tsx` currently behaves like a mock payment page and includes `mockPayOrder`.
- `OrderService.getOrderDetail(orderId)` already calls `GET /orders/:order_id`.
- `OrderService.mockPayOrder(orderId)` still exists for sandbox/testing and should not be part of the Xendit production return flow.

### Buyer Tickets

- `app/user/(main_pages)/my-ticket/page.tsx` and the `components/user/my-ticket/*` components already provide a ticket list UI.
- `app/user/(main_pages)/my-ticket/[ticket_id]/page.tsx` already exists for ticket detail.
- The Xendit status flow should link to these existing ticket pages only after the order is `paid`.

### Organizer Area

- Organizer layout already exists under `app/organizer/(main_pages)/layout.tsx`.
- Current organizer nav items are Dashboard, Event Saya, Check In, Komunitas Saya, and Profil Organizer.
- `services/organizer-service.ts` currently covers profile and community management only.
- `types/organizer.ts` and `types/organizer-ticketing.ts` do not yet include finance, ledger, or withdrawal contracts.
- No organizer balance, ledger, withdrawal request, withdrawal history, withdrawal detail, or cancel withdrawal frontend exists yet.

## Buyer Flow Plan

### 1. Keep Checkout Order Creation After Buyer Validation

Status: mostly done.

Keep this behavior in `app/(transaction)/checkout/[event_id]/page.tsx`:

```ts
const orderData = await OrderService.createOrder(event.event_id, payload, idempotencyKey)

if (orderData.payment?.payment_url) {
  window.location.href = orderData.payment.payment_url
  return
}

router.push(`/orders/${orderData.order.id}`)
```

Required adjustment:

- Change the fallback route from `/payment/${orderData.order.id}` to `/orders/${orderData.order.id}` so free tickets and post-checkout status use the canonical order status route.

### 2. Convert Payment Page Into Order Status Page

Status: route exists, behavior needs update.

Use the existing route:

```txt
/orders/:order_id
```

Keep `/payment/:order_id` only as a backwards-compatible alias while old links still exist.

Required behavior:

- Call `OrderService.getOrderDetail(orderId)` on load.
- Show `awaiting_payment` as "waiting for payment confirmation".
- Poll every few seconds while order status is `awaiting_payment`.
- Stop polling when status becomes `paid`, `expired`, `cancelled`, or a failed state returned by backend.
- Show tickets/QR links only when status is `paid`.
- For `expired`, `cancelled`, or failed states, show a clear failed/expired message.
- Remove production dependency on `mockPayOrder` and the "Simulasi Bayar Sekarang" UI from the normal Xendit return/status page.

Suggested split:

- `app/(transaction)/orders/[order_id]/page.tsx`: real order status page.
- `app/(transaction)/payment/[order_id]/page.tsx`: either re-export the order status page or keep a sandbox-only payment simulator behind an environment flag.

### 3. Xendit Return Handling

Status: needs wiring to real status page.

Xendit success/callback return must not mark the order as paid from the frontend. Payment confirmation comes from:

```http
POST /api/v1/payments/xendit/webhook
```

Frontend behavior after return:

- Route user to `/orders/:order_id`.
- Show `awaiting_payment` while waiting for backend webhook confirmation.
- Poll `GET /api/v1/orders/:order_id`.
- Once `paid`, show the success state and link to `/user/my-ticket`.

### 4. Free Ticket Flow

Status: partially done.

Backend skips Xendit for zero-total orders and should return no `payment.payment_url`.

Required frontend behavior:

- If `payment.payment_url` is missing, route to `/orders/:order_id`.
- The order status page should fetch the order detail immediately.
- If backend already issued tickets and status is `paid`, show ticket access immediately.

## Organizer Finance Plan

Add finance as a new organizer section without overloading existing profile/community services.

### 1. Add Types

Create `types/organizer-finance.ts` with:

- `OrganizerBalance`
- `OrganizerLedgerEntry`
- `OrganizerLedgerType`
- `OrganizerWithdrawal`
- `OrganizerWithdrawalStatus`
- `CreateWithdrawalRequest`
- paginated finance response types

### 2. Add Service

Create `services/organizer-finance-service.ts` or extend `OrganizerService` with a dedicated finance namespace.

Preferred dedicated service methods:

```ts
getBalance()
getLedger({ page, limit, type })
createWithdrawal(payload)
getWithdrawals({ page, limit, status })
getWithdrawalDetail(withdrawalId)
cancelWithdrawal(withdrawalId)
```

Endpoints:

```http
GET  /organizer/balance
GET  /organizer/ledger?page=1&limit=10&type=
POST /organizer/withdrawals
GET  /organizer/withdrawals?page=1&limit=10&status=
GET  /organizer/withdrawals/:withdrawal_id
POST /organizer/withdrawals/:withdrawal_id/cancel
```

### 3. Add Organizer Navigation

Add one top-level nav item:

```txt
Keuangan -> /organizer/finance
```

Use nested tabs or subnavigation inside the finance section for:

- Balance overview
- Ledger
- Withdrawals

This keeps the sidebar from becoming too crowded.

### 4. Add Finance Routes

Recommended routes:

```txt
app/organizer/(main_pages)/finance/page.tsx
app/organizer/(main_pages)/finance/ledger/page.tsx
app/organizer/(main_pages)/finance/withdrawals/page.tsx
app/organizer/(main_pages)/finance/withdrawals/[withdrawal_id]/page.tsx
```

`/organizer/finance/page.tsx` should show balance overview and the withdrawal request form entry point.

### 5. Balance Overview

API:

```http
GET /api/v1/organizer/balance
```

Show:

- Pending amount: paid order income not withdrawable yet.
- Available amount: amount that can be withdrawn.
- Requested withdrawal amount: amount reserved in requested withdrawals.
- Last updated timestamp.

### 6. Ledger Page

API:

```http
GET /api/v1/organizer/ledger?page=1&limit=10&type=
```

Support type filter:

```txt
earning_pending
earning_available
withdrawal_requested
withdrawal_cancelled
```

Use this as organizer transaction history.

### 7. Withdrawal Request

API:

```http
POST /api/v1/organizer/withdrawals
```

Validation before submit:

- Amount must be greater than `0`.
- Amount must be less than or equal to `available_amount`.
- Bank name is required.
- Bank account number is required.
- Bank account holder name is required.

After success:

- Show withdrawal status `requested`.
- Show generated WhatsApp report from `whatsapp_message`.
- Add Copy Report action.
- Add Send via WhatsApp action.

Backend does not send WhatsApp automatically.

### 8. Withdrawal History

API:

```http
GET /api/v1/organizer/withdrawals?page=1&limit=10&status=
```

Support status filter:

```txt
requested
cancelled
```

Show:

- Amount
- Bank name
- Account holder
- Status
- Requested date
- Cancelled date when present

### 9. Withdrawal Detail and Cancel

Detail API:

```http
GET /api/v1/organizer/withdrawals/:withdrawal_id
```

Cancel API:

```http
POST /api/v1/organizer/withdrawals/:withdrawal_id/cancel
```

Only show cancel when status is `requested`.

After cancel succeeds:

- Refresh withdrawal detail.
- Refresh balance if the page shows balance data.
- Show status `cancelled`.

## Updated Checklist

### Buyer Side

- [x] Move create order API call after buyer data validation.
- [x] Redirect to Xendit only when `payment.payment_url` exists.
- [ ] Change missing-payment-url fallback from `/payment/:order_id` to `/orders/:order_id`.
- [x] Add `/orders/:order_id` route alias.
- [ ] Replace mock payment behavior with real order status behavior.
- [ ] Poll `GET /api/v1/orders/:order_id` while status is `awaiting_payment`.
- [ ] Show ticket/QR access only when order status is `paid`.
- [ ] Keep mock payment UI only behind a sandbox/dev-only path or flag if still needed.

### Organizer Side

- [ ] Add organizer finance types.
- [ ] Add organizer finance service methods.
- [ ] Add Keuangan nav item.
- [ ] Add organizer balance page.
- [ ] Add organizer ledger/history page.
- [ ] Add withdrawal request form.
- [ ] Add withdrawal history page.
- [ ] Add withdrawal detail page.
- [ ] Add cancel withdrawal action.
- [ ] Add copy/send WhatsApp report actions.

## Backend Notes For Frontend

- Backend records organizer earning only after payment is confirmed.
- Backend uses Xendit webhook for paid confirmation.
- Backend skips Xendit for free tickets.
- Backend prevents duplicate ticket issuing on duplicate webhook.
- Backend prevents duplicate organizer earning on duplicate paid webhook.
- Backend does not call Xendit Payouts yet.
- Backend does not have admin approval flow yet.
