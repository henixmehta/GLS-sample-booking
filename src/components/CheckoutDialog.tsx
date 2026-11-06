import { useEffect, useRef, useState } from 'react'
import { STATES } from '../data/catalog'
import { createSampleOrder, invoiceUrl, invoiceUrlByOrderId, loadRazorpay, sendOtp, verifySamplePayment, type ConfirmedOrder, type CreatedOrder, type Customer } from '../lib/api'
import { customBeakerSvg, grandTotalOf, inr, isCustom, itemImg, itemName, itemPrice, itemSub, shipNudge, shippingOf, subtotalOf, validEmail, validMobile, validPin, type CartItem } from '../lib/helpers'
import { IMG } from '../lib/images'
import Dialog, { CloseX, Tick } from './Dialog'
import { goHome } from './Layout'
import OtpPanel, { type OtpSession } from './OtpPanel'
import { useShop } from './ShopContext'

const TITLES = ['Your cart', 'Delivery details', 'Verify your email', 'Payment', 'Order placed']
const PAY_METHODS = [
	{ value: 'UPI', label: 'UPI', small: 'GPay, PhonePe, Paytm or any UPI app', rzp: 'upi' },
	{ value: 'Card', label: 'Debit or credit card', small: 'Visa, Mastercard, RuPay', rzp: 'card' },
	{ value: 'Net banking', label: 'Net banking', small: 'All major Indian banks', rzp: 'netbanking' },
]
const EMPTY: Customer = { name: '', company: '', mobile: '', email: '', addr1: '', addr2: '', city: '', pin: '', state: '', gst: '', terms: false }

function LineItems({ box, onRemove }: { box: CartItem[]; onRemove?: (idx: number) => void }) {
	return (
		<>
			{box.map((i, idx) => {
				const isC = isCustom(i)
				const thumb = isC ? (i.previewUrl || i.attachment || customBeakerSvg) : itemImg(i)
				return (
					<div className='line-item' key={idx}>
						{isC && !i.previewUrl && !i.attachment ? (
							<div
								style={{
									width: '56px',
									height: '56px',
									borderRadius: '10px',
									background: 'radial-gradient(circle, #dcfce7 0%, #f0fdf4 75%)',
									border: '1px solid #bbf7d0',
									display: 'grid',
									placeItems: 'center',
									flexShrink: 0,
								}}
							>
								<svg width='28' height='28' viewBox='0 0 24 24' fill='none' stroke='#16a34a' strokeWidth='1.9' strokeLinecap='round' strokeLinejoin='round'>
									<path d='M10 2v7.5' />
									<path d='M14 2v7.5' />
									<path d='M8.5 2h7' />
									<path d='M14 9.5a6.5 6.5 0 1 1-4 0v-7.5' />
									<circle cx='12' cy='15' r='1' fill='#16a34a' />
									<circle cx='10' cy='18' r='1' fill='#16a34a' />
									<circle cx='14' cy='18' r='1' fill='#16a34a' />
								</svg>
							</div>
						) : (
							<img
								src={thumb}
								alt=''
								onError={(e) => {
									e.currentTarget.onerror = null
									e.currentTarget.src = customBeakerSvg
								}}
							/>
						)}
						<div className='meta'>
							{isC && (
								<div style={{ display: 'inline-block', fontSize: '9.5px', fontWeight: 700, background: '#e0f2fe', color: '#0369a1', padding: '1px 5px', borderRadius: '4px', marginBottom: '2px' }}>
									Custom Demand
								</div>
							)}
							<h4>{itemName(i)}</h4>
							<div className='sub'>{itemSub(i)}</div>
							{onRemove && (
								<button className='rm' type='button' onClick={() => onRemove(idx)}>
									Remove
								</button>
							)}
						</div>
						<div className='amt'>{inr(itemPrice(i))}</div>
					</div>
				)
			})}
		</>
	)
}

/* Totals as the browser sees them; once the server has priced the order its figures are shown instead. */
function Totals({ box, priced }: { box: CartItem[]; priced?: CreatedOrder | null }) {
	const sub = priced?.subtotal ?? subtotalOf(box), ship = priced?.shipping ?? shippingOf(box), total = priced?.amount ?? grandTotalOf(box)
	return (
		<>
			<div className='totals'>
				<div>
					<span>Samples</span>
					<span>{inr(sub)}</span>
				</div>
				<div>
					<span>Shipping</span>
					<span>{ship ? inr(ship) : 'Free'}</span>
				</div>
				<div className='grand'>
					<span>Total (incl. GST)</span>
					<span>{inr(total)}</span>
				</div>
			</div>
			<p className='ship-note'>{shipNudge(box)}</p>
		</>
	)
}

interface Done { order: ConfirmedOrder; items: { name: string; sub: string }[] }

export default function CheckoutDialog() {
	const { box, removeAt, clearBox, checkout, closeCheckout, setTermsOpen, toast } = useShop()
	const [step, setStep] = useState(0)
	const [cust, setCust] = useState<Customer>(EMPTY)
	const [bad, setBad] = useState<Record<string, boolean>>({})
	const [detErr, setDetErr] = useState('')
	const [sending, setSending] = useState(false)
	const [otp, setOtp] = useState<OtpSession | null>(null)
	const [method, setMethod] = useState('UPI')
	const [created, setCreated] = useState<CreatedOrder | null>(null)
	const [paying, setPaying] = useState(false)
	const [payErr, setPayErr] = useState('')
	const [payTried, setPayTried] = useState(false)
	const [done, setDone] = useState<Done | null>(null)
	const [rzpOpen, setRzpOpen] = useState(false)
	const rzpOpenRef = useRef(false)
	const bodyRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		if (!checkout.nonce) return
		setStep(box.length ? checkout.step : 0)
		setDone(null)
		setCreated(null)
		setPayErr('')
		setPayTried(false)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [checkout.nonce])

	useEffect(() => {
		if (bodyRef.current) bodyRef.current.scrollTop = 0
	}, [step])

	const go = (s: number) => {
		if (s < 3) setCreated(null) // details or cart may change, so the server prices it again
		setStep(s)
	}
	const field = (k: keyof Customer) => ({
		name: k,
		value: cust[k] as string,
		className: bad[k] ? 'invalid' : undefined,
		'aria-invalid': !!bad[k],
		onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setCust({ ...cust, [k]: e.target.value }),
	})

	async function continueToOtp() {
		const d = cust
		const b: Record<string, boolean> = {
			name: !d.name.trim(),
			mobile: !validMobile(d.mobile),
			email: !validEmail(d.email),
			addr1: d.addr1.trim().length < 5,
			city: !d.city.trim(),
			pin: !validPin(d.pin),
			state: !d.state,
		}
		setBad(b)
		const labels: Record<string, string> = { name: 'name', mobile: 'a valid 10-digit mobile', email: 'a valid email', addr1: 'address', city: 'city', pin: 'a 6-digit pincode', state: 'state' }
		const missing = Object.keys(b).filter((k) => b[k]).map((k) => labels[k])
		if (missing.length) return setDetErr('Add ' + missing.join(', ') + ' to continue.')
		if (!d.terms) return setDetErr('Tick the box to accept the sample order terms.')
		if (sending) return // ignore double clicks while a request is already in flight
		setDetErr('')
		setSending(true)
		try {
			setOtp(await sendOtp(d.mobile, d.email))
			go(2)
		} catch (ex: any) {
			setDetErr(ex.message)
		} finally {
			setSending(false)
		}
	}

	function showRazorpay(show: boolean) {
		rzpOpenRef.current = show
		setRzpOpen(show)
	}

	async function pay() {
		setPaying(true)
		setPayErr('')
		setPayTried(true)
		try {
			const order = created ?? (await createSampleOrder(otp!.verification_id, cust, box, method))
			setCreated(order)
			await loadRazorpay()
			const items = box.map((i) => ({ name: itemName(i), sub: itemSub(i) }))
			const rzp = new window.Razorpay!({
				key: order.razorpay.key,
				order_id: order.razorpay.order_id,
				amount: order.razorpay.amount,
				currency: order.razorpay.currency,
				name: 'Gomzi Life Science LLP',
				description: `Sample order ${order.order_id}`,
				image: new URL(IMG.logo, location.href).href,
				prefill: { name: cust.name, email: cust.email, contact: '+91' + cust.mobile },
				theme: { color: '#5E9A1F' },
				handler: async (r: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
					showRazorpay(false)
					try {
						const confirmed = await verifySamplePayment(r)
						setDone({ order: confirmed, items })
						clearBox()
						setStep(4)
					} catch (ex: any) {
						setPayErr(`${ex.message} If money was taken, your order is safe: we’ll confirm it by email.`)
					} finally {
						setPaying(false)
					}
				},
				modal: {
					ondismiss: () => {
						showRazorpay(false)
						setPaying(false)
					},
				},
			})
			rzp.on('payment.failed', (r: any) => setPayErr(r?.error?.description || 'Payment failed. Try again or pick another method.'))
			showRazorpay(true)
			rzp.open()
		} catch (ex: any) {
			setPayErr(ex.message)
			setPaying(false)
		}
	}

	const total = created?.amount ?? grandTotalOf(box)
	let body: React.ReactNode = null, foot: React.ReactNode = null

	if (step === 0) {
		body = box.length ? (
			<>
				<LineItems box={box} onRemove={removeAt} />
				<Totals box={box} />
			</>
		) : (
			<div className='empty'>
				<p>Your cart is empty.</p>
				<p>Pick a category to add your first sample.</p>
			</div>
		)
		foot = box.length ? (
			<>
				<button className='btn btn-ghost' data-close type='button'>
					Add more samples
				</button>
				<button className='btn btn-primary' type='button' onClick={() => go(1)}>
					Continue to details
				</button>
			</>
		) : (
			<a className='btn btn-primary' href='#' data-close onClick={goHome}>
				Browse categories
			</a>
		)
	}

	if (step === 1) {
		body = (
			<form noValidate onSubmit={(e) => e.preventDefault()}>
				<div className='fields'>
					<label className='f'>
						Full name
						<input autoComplete='name' required {...field('name')} />
					</label>
					<label className='f'>
						Brand / company <span className='opt'>(optional)</span>
						<input autoComplete='organization' {...field('company')} />
					</label>
					<label className='f'>
						Mobile <span className='opt'>(for dispatch tracking)</span>
						<div className='mobile-in'>
							<span>+91</span>
							<input inputMode='numeric' maxLength={10} autoComplete='tel-national' required {...field('mobile')} />
						</div>
					</label>
					<label className='f'>
						Email <span className='opt'>(we’ll send an OTP)</span>
						<input type='email' autoComplete='email' required {...field('email')} />
					</label>
					<label className='f full'>
						Address
						<input autoComplete='address-line1' placeholder='House / flat, building, street' required {...field('addr1')} />
					</label>
					<label className='f full'>
						Area and landmark <span className='opt'>(optional)</span>
						<input autoComplete='address-line2' {...field('addr2')} />
					</label>
					<label className='f'>
						City
						<input autoComplete='address-level2' required {...field('city')} />
					</label>
					<label className='f'>
						Pincode
						<input inputMode='numeric' maxLength={6} autoComplete='postal-code' required {...field('pin')} />
					</label>
					<label className='f'>
						State
						<select required {...field('state')}>
							<option value=''>Choose state</option>
							{STATES.map((s) => (
								<option key={s}>{s}</option>
							))}
						</select>
					</label>
					<label className='f'>
						GSTIN <span className='opt'>(optional, for a GST invoice)</span>
						<input maxLength={15} style={{ textTransform: 'uppercase' }} {...field('gst')} />
					</label>
				</div>
				<label className='consent'>
					<input type='checkbox' name='terms' checked={cust.terms} required onChange={(e) => setCust({ ...cust, terms: e.target.checked })} />
					<span>
						I agree to the{' '}
						<a
							href='#'
							onClick={(e) => {
								e.preventDefault()
								setTermsOpen(true)
							}}>
							sample order terms
						</a>
						, including that samples are for evaluation only and not for resale.
					</span>
				</label>
				<p className='err' role='alert' style={{ marginTop: 10 }}>
					{detErr}
				</p>
			</form>
		)
		foot = (
			<>
				<button className='btn btn-ghost' type='button' onClick={() => go(0)}>
					Back
				</button>
				<button className='btn btn-primary' type='button' disabled={sending} onClick={continueToOtp}>
					Continue and send OTP
				</button>
			</>
		)
	}

	if (step === 3) {
		body = (
			<>
				<LineItems box={box} />
				<Totals box={box} priced={created} />
				<p className='note' style={{ margin: '14px 0 6px' }}>
					Delivering to {cust.name}, {[cust.addr1, cust.addr2, cust.city, cust.state, cust.pin].filter(Boolean).join(', ')}
				</p>
				<div className='opt-label'>Pay with</div>
				<div className='pay-opts'>
					{PAY_METHODS.map((m) => (
						<label key={m.value}>
							<input type='radio' name='pm' value={m.value} checked={method === m.value} onChange={() => setMethod(m.value)} />
							<span>
								{m.label}
								<small>{m.small}</small>
							</span>
						</label>
					))}
				</div>
				<p className='err' role='alert' style={{ marginTop: 10 }}>
					{payErr}
				</p>
			</>
		)
		foot = (
			<button className='btn btn-primary btn-block' type='button' disabled={paying} onClick={pay}>
				{paying ? (
					<>
						<span className='spinner' /> Processing payment
					</>
				) : payTried && payErr ? (
					'Try payment again'
				) : (
					`Pay ${inr(total)}`
				)}
			</button>
		)
	}

	if (step === 4 && done) {
		const o = done.order
		body = (
			<div className='done'>
				<Tick />
				<h3 style={{ fontSize: 24 }}>Thank you, {o.customer_name.split(' ')[0]}. Your samples are booked.</h3>
				<div className='ref'>Order {o.order_id}</div>
				<p className='note'>
					Paid {inr(o.amount)}
					{o.payment_method ? ` by ${o.payment_method}` : ''} on {new Date(o.paid_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}. We’ll dispatch within 2–4 working days and share tracking on WhatsApp.
				</p>
				{(o.invoice_token || o.order_id) && (
					<div className='invoice-box'>
						<svg viewBox='0 0 24 24' width='28' height='28' aria-hidden='true'>
							<path d='M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z M14 3v5h5 M9 13h6 M9 17h4' fill='none' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round' />
						</svg>
						<div className='invoice-meta'>
							<b>Invoice {o.invoice_number || 'Generated'}</b>
							<span>PDF GST invoice</span>
						</div>
						<a
							className='btn btn-primary invoice-dl'
							href={o.invoice_token ? invoiceUrl(o.invoice_token) : invoiceUrlByOrderId(o.order_id)}
							target='_blank'
							rel='noopener noreferrer'
							download>
							Download invoice
						</a>
					</div>
				)}
				<div className='mail' aria-label='Confirmation email preview'>
					<div className='mail-head'>
						<b>Email sent</b> to {o.email}
						<br />
						Subject: Your Gomzi sample order {o.order_id} is confirmed
						{o.invoice_number ? (
							<>
								<br />
								Attachment: Invoice-{o.invoice_number.replace(/[^A-Za-z0-9-]+/g, '-')}.pdf
							</>
						) : null}
					</div>
					<div className='mail-body'>
						<p>Hi {o.customer_name},</p>
						<p style={{ margin: '8px 0' }}>We’ve received your payment of {inr(o.amount)}. Here’s what’s coming your way:</p>
						<ul style={{ margin: '0 0 8px', paddingLeft: 18 }}>
							{done.items.map((i, k) => (
								<li key={k}>
									{i.name}: {i.sub}
								</li>
							))}
						</ul>
						<p>Ready to launch? Reply to this email or call +91 83200 77993 to plan your first batch.</p>
						<p style={{ marginTop: 8 }}>Team Gomzi Life Science LLP</p>
					</div>
				</div>
			</div>
		)
		foot = (
			<button className='btn btn-primary' type='button' onClick={closeCheckout}>
				Done
			</button>
		)
	}

	const content = (b: React.ReactNode, f: React.ReactNode) => (
		<>
			<div className='dlg-body' ref={bodyRef}>
				{b}
			</div>
			<div className='dlg-foot'>{f}</div>
		</>
	)

	return (
		<Dialog open={checkout.open && !rzpOpen} onClose={() => !rzpOpenRef.current && closeCheckout()} labelledBy='cTitle'>
			<div className='dlg-head'>
				<h3 id='cTitle'>{TITLES[step]}</h3>
				<CloseX />
			</div>
			<ol className='steps' aria-label='Booking progress'>
				{['Cart', 'Details', 'Verify OTP', 'Payment', 'Confirmed'].map((s, i) => (
					<li key={s} className={i <= step ? 'on' : undefined} aria-current={i === step ? 'step' : 'false'}>
						{s}
					</li>
				))}
			</ol>
			{step === 2 && otp ? (
				<OtpPanel
					mobile={cust.mobile}
					email={cust.email}
					session={otp}
					onBack={() => go(1)}
					onOk={() => go(3)}
					onResend={async () => {
						setOtp(await sendOtp(cust.mobile, cust.email))
						toast(`New code sent to ${cust.email}`)
					}}>
					{content}
				</OtpPanel>
			) : (
				content(body, foot)
			)}
		</Dialog>
	)
}
