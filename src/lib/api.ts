/* fg-api calls. Sample orders are priced and saved by the server; they show up in the
   GLS admin panel under Nutrition > Sample Booking once paid. */
import type { CartItem } from './helpers'

const isLocal = ['localhost', '127.0.0.1'].includes(location.hostname)
export const API_BASE = (import.meta.env.VITE_API_BASE_URL || (isLocal ? 'http://localhost' : 'https://api.fggroup.in')).replace(/\/+$/, '')
const PUBLIC = `${API_BASE}/public/v1`

/* Source tag, so contact inquiries are routed to the GLS team (fg-api contact-us.js). */
export const SOURCE = 'gomzilifesciences.in/nutrition/sample-booking'

async function post<T = any>(path: string, body: unknown): Promise<T> {
	let res: Response
	try {
		res = await fetch(PUBLIC + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
	} catch {
		throw new Error('We couldn’t reach the server. Check your connection and try again.')
	}
	const json = await res.json().catch(() => ({}))
	if (!res.ok) throw new Error(json?.message || 'Something went wrong. Please try again.')
	return json?.data as T
}

/* OTP is sent on WhatsApp by the shared inquiry OTP service. In development the API also returns the code. */
export const sendOtp = (mobile: string) => post<{ verification_id: string; otp?: string }>('/inquiry-otp/send', { mobile, country_code: '+91' })
export const verifyOtp = (verification_id: string, otp: string) => post('/inquiry-otp/verify', { verification_id, otp })

export interface Customer { name: string; company: string; mobile: string; email: string; addr1: string; addr2: string; city: string; pin: string; state: string; gst: string; terms: boolean }
export interface CreatedOrder {
	booking_id: string
	order_id: string
	amount: number
	subtotal: number
	shipping: number
	razorpay: { key: string; order_id: string; amount: number; currency: string }
}
export interface ConfirmedOrder {
	order_id: string
	amount: number
	payment_method?: string
	paid_at: string
	customer_name: string
	email: string
	invoice_number?: string
	/** Signed token for the customer's own invoice PDF */
	invoice_token?: string
}

/* Invoice PDF link; the server sends it as a download */
export const invoiceUrl = (token: string) => `${PUBLIC}/gls-sample-booking/invoice?token=${encodeURIComponent(token)}`

const toPayloadItem = (i: CartItem) =>
	i.kind === 'combo'
		? { kind: 'combo', parts: i.parts.map(({ pid, flavour, variant, extra }) => ({ pid, flavour, variant, extra })) }
		: { kind: 'single', pid: i.pid, flavour: i.flavour, variant: i.variant, qty: i.qty }

export const createSampleOrder = (verification_id: string, c: Customer, box: CartItem[], method: string) =>
	post<CreatedOrder>('/gls-sample-booking/create-order', {
		verification_id,
		customer: { name: c.name, company: c.company, mobile: c.mobile, email: c.email, gstin: c.gst },
		address: { address_line_1: c.addr1, address_line_2: c.addr2, city: c.city, state: c.state, pin_code: c.pin },
		items: box.map(toPayloadItem),
		payment_method: method,
	})

export const verifySamplePayment = (r: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) =>
	post<ConfirmedOrder>('/gls-sample-booking/verify-payment', r)

/* Price requests and R&D consultations are contact inquiries, not sample orders: they show up in the
   GLS admin panel under Nutrition > Contact Inquiry, told apart by their subject. */
export type InquiryKind = 'pricing' | 'consult'
export const INQUIRY_SUBJECTS: Record<InquiryKind, string> = { pricing: 'Price your own formula', consult: 'Book an R&D consultation' }

export const submitInquiry = (kind: InquiryKind, d: { name: string; email: string; mobile: string; message: string; details: Record<string, unknown> }) =>
	post('/contact-inquiry', { ...d, subject: INQUIRY_SUBJECTS[kind], source: `${SOURCE}#${kind}` })

let rzpScript: Promise<void> | null = null
export function loadRazorpay() {
	if (window.Razorpay) return Promise.resolve()
	return (rzpScript ||= new Promise<void>((resolve, reject) => {
		const s = document.createElement('script')
		s.src = 'https://checkout.razorpay.com/v1/checkout.js'
		s.onload = () => resolve()
		s.onerror = () => {
			rzpScript = null
			reject(new Error('Couldn’t load the payment window. Check your connection and try again.'))
		}
		document.body.appendChild(s)
	}))
}
