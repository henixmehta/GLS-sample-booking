# GLS Sample Booking

React + Vite version of the Gomzi Life Science LLP sample booking page, served at `/nutrition/sample-booking`.

```bash
npm install
npm run dev      # http://localhost:3002/nutrition/sample-booking
npm run build    # output in dist/
```

The API origin is `http://localhost` in dev and `https://api.fggroup.in` in production. Set `VITE_API_BASE_URL` to override it (see `.env.example`).

## How a booking flows

1. Cart → delivery details → mobile OTP (`/public/v1/inquiry-otp/send` and `/verify`, sent on WhatsApp).
2. Payment: `/public/v1/gls-sample-booking/create-order` re-prices the cart on the server, saves a pending booking and opens Razorpay (Gomzi Nutrition account).
3. After payment, `/public/v1/gls-sample-booking/verify-payment` marks it paid and emails the customer. The Razorpay `payment.captured` webhook does the same if the browser closes first.
4. Paid bookings appear in the admin panel under **Nutrition > Sample Booking** with a "Website" badge. Unpaid checkouts are under the "Payment pending (website)" filter.

"Price your own formula" and "R&D consultation" are sent to `/public/v1/contact-inquiry` and reach the GLS team like other GLS website inquiries.

## Changing products or prices

Edit `src/data/catalog.ts` **and** `fg-api/src/controllers/public/gls-sample-booking/catalog.js`. The server only charges its own prices, so a product or price that exists only on the website will be rejected at payment.

## Hosting

This is a single-page app. The host must serve `index.html` for `/nutrition/sample-booking` (SPA fallback).
