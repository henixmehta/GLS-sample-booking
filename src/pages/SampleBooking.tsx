import { useEffect, useRef, useState, type FormEvent } from 'react'
import CheckoutDialog from '../components/CheckoutDialog'
import CartDrawer from '../components/CartDrawer'
import ComboDialog from '../components/ComboDialog'
import Dialog, { CloseX, Tick } from '../components/Dialog'
import { Footer, goHome, Header } from '../components/Layout'
import OtpPanel, { type OtpSession } from '../components/OtpPanel'
import ProductDialog from '../components/ProductDialog'
import { Toast, useShop } from '../components/ShopContext'
import TermsDialog from '../components/TermsDialog'
import { CATEGORIES, PRODUCTS } from '../data/catalog'
import { API_BASE, invoiceUrlByOrderId, lookupInvoice, sendOtp, submitInquiry, type InvoiceInfo } from '../lib/api'
import { byId, catById, inr, onImgError, pimg, rand, softScrollTo, validEmail, validMobile } from '../lib/helpers'

type FormData_ = Record<string, any>
function readForm(f: HTMLFormElement): FormData_ {
	const d: FormData_ = {}
	new FormData(f).forEach((v, k) => {
		d[k] = d[k] !== undefined ? [].concat(d[k], v as any) : v
	})
	f.querySelectorAll<HTMLInputElement>('input[type=checkbox]').forEach((c) => {
		if (c.name !== 'addons') d[c.name] = c.checked
	})
	if (d.addons !== undefined) d.addons = [].concat(d.addons)
	return d
}
const cls = (bad: Record<string, boolean>, k: string) => ({ className: bad[k] ? 'invalid' : undefined, 'aria-invalid': !!bad[k] })

function useHash() {
	const [h, setH] = useState(() => location.hash.slice(1))
	useEffect(() => {
		const f = () => setH(location.hash.slice(1))
		window.addEventListener('hashchange', f)
		return () => window.removeEventListener('hashchange', f)
	}, [])
	return h
}

/* ============== categories ============== */
function HomeView({ hash }: { hash: string }) {
	const { openProduct, quickAdd } = useShop()
	const [activeCat, setActiveCat] = useState(() => (catById(hash) ? hash : CATEGORIES[0].id))
	const panel = useRef<HTMLDivElement>(null)
	useEffect(() => {
		if (catById(hash)) setActiveCat(hash)
	}, [hash])
	const c = catById(activeCat)

	return (
		<section className='view'>
			<div className='page-head'>
				<h1 className='bar'>Sample booking</h1>
				<p className='lede'>Choose a category, pick your product and flavour, and add it to your cart.</p>
				<ul className='usps' aria-label='Why Gomzi'>
					<li>Every batch lab-tested</li>
					<li>FSSAI, ISO 22000, GMP and HACCP certified facility</li>
					<li>Low MOQ 50–100 kg</li>
					<li>Bulk ready in 5–10 days</li>
				</ul>
			</div>
			<div className='cat-row' id='categories' role='tablist' aria-label='Product categories'>
				{CATEGORIES.map((cat) => {
					const n = PRODUCTS.filter((p) => p.cat === cat.id).length
					return (
						<button
							className='cbox'
							type='button'
							role='tab'
							key={cat.id}
							aria-selected={cat.id === activeCat}
							aria-controls='catPanel'
							onClick={() => {
								setActiveCat(cat.id)
								softScrollTo(panel.current!)
								if (location.hash.slice(1) !== cat.id) history.replaceState(history.state, '', '#' + cat.id)
							}}>
							<span className='ci'>
								<img src={pimg(byId(cat.cover))} alt='' onError={onImgError(byId(cat.cover))} />
							</span>
							<b>{cat.name}</b>
							<span>
								{n} product{n > 1 ? 's' : ''}
							</span>
						</button>
					)
				})}
			</div>
			<div className='cat-panel' id='catPanel' role='tabpanel' ref={panel}>
				<h2>{c.name}</h2>
				<p className='cat-line'>{c.line}</p>
				<div className='grid'>
					{PRODUCTS.filter((p) => p.cat === activeCat).map((p) => (
						<article className='card' key={p.id}>
							<button className={`card-media ${p.wide ? 'wide' : ''}`} type='button' aria-label={`Choose options for ${p.name}`} onClick={() => openProduct(p.id)}>
								<img src={pimg(p)} alt={`${p.name} sample pack`} loading='lazy' onError={onImgError(p)} />
							</button>
							<div className='card-body'>
								<h3>
									{p.name}
									{p.isNew && <span className='new-tag'>New</span>}
								</h3>
								<p>{p.desc}</p>
								<dl className='spec'>
									{p.card.map(([k, v]) => (
										<div key={k}>
											<dt>{k}</dt>
											<dd>{v}</dd>
										</div>
									))}
								</dl>
								<div className='flv-line'>
									{p.flavours.length > 1 ? (
										<>
											<b>{p.flavours.length} options</b>: {p.flavours.slice(0, 3).join(', ')}
											{p.flavours.length > 3 ? '…' : ''}
										</>
									) : (
										<b>{p.flavours[0]}</b>
									)}
									{p.variants && (
										<>
											{' '}
											&nbsp;|&nbsp;{' '}
											<b>
												{p.variants.length} {p.variantLabel!.toLowerCase()}s
											</b>
										</>
									)}
								</div>
								<div className='card-foot'>
									<div className='price'>
										{inr(p.price)}
										<small>{p.pack}</small>
									</div>
									<button className='btn btn-primary add-btn' type='button' aria-label={`Add ${p.name} to cart`} onClick={() => quickAdd(p.id)}>
										<svg viewBox='0 0 24 24' width='18' height='18' aria-hidden='true'>
											<path d='M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.5L21 8H6' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
											<circle cx='10' cy='20' r='1.5' fill='currentColor' />
											<circle cx='17' cy='20' r='1.5' fill='currentColor' />
										</svg>
										Add to cart
									</button>
								</div>
							</div>
						</article>
					))}
				</div>
			</div>
			<p className='disclaimer'>
				Samples are for tasting and experiencing our standard formulas. Nutrition values shown are approximate and indicative only. Your own product is lab-tested on production, and you’re welcome to get it independently tested before launch.
			</p>

			<h2 className='bar bar-sm' style={{ marginTop: 44 }}>
				Something custom?
			</h2>
			<div className='more'>
				<a className='more-card' href='#pricing'>
					<h3>Price your own formula</h3>
					<p>Tell us your spec and get a sample and bulk price within 24 working hours.</p>
					<span className='btn btn-ghost'>Request a price</span>
				</a>
				<a className='more-card' href='#consult'>
					<h3>Book an R&amp;D consultation</h3>
					<p>Discuss a new formulation with our experts. Your formula stays confidential.</p>
					<span className='btn btn-ghost'>Book a consultation</span>
				</a>
				<a className='more-card' href='#invoice'>
					<h3>Download your invoice</h3>
					<p>Already booked your sample? Enter your Order ID to download your GST invoice PDF.</p>
					<span className='btn btn-ghost'>Download invoice</span>
				</a>
			</div>
		</section>
	)
}

const BackLink = () => (
	<a className='back' href='#' onClick={goHome}>
		‹ All categories
	</a>
)

/* ============== custom pricing ============== */
function PricingView() {
	const [bad, setBad] = useState<Record<string, boolean>>({})
	const [err, setErr] = useState('')
	const [busy, setBusy] = useState(false)
	const [done, setDone] = useState<{ ref: string; email: string; mobile: string } | null>(null)

	async function onSubmit(e: FormEvent<HTMLFormElement>) {
		e.preventDefault()
		const d = readForm(e.currentTarget)
		const b: Record<string, boolean> = {}
		const list: string[] = []
		const check = (k: string, isBad: boolean, label: string) => {
			b[k] = isBad
			if (isBad) list.push(label)
		}
		check('type', !d.type, 'product type')
		check('pack', !d.pack, 'pack')
		check('packaging', !d.packaging, 'packaging')
		check('volume', !d.volume, 'planned order')
		check('flavour', !d.flavour.trim(), 'flavour')
		check('name', !d.name.trim(), 'name')
		check('mobile', !validMobile(d.mobile), 'a valid mobile')
		check('email', !validEmail(d.email), 'a valid email')
		setBad(b)
		if (list.length) return setErr('Add ' + list.join(', ') + ' to request a price.')
		setErr('')
		setBusy(true)
		const ref = 'GLS-Q-' + rand(6)
		try {
			await submitInquiry('pricing', {
				name: d.name,
				email: d.email,
				mobile: d.mobile,
				message: [
					`Price request ${ref}`,
					`Product type: ${d.type}`,
					d.protein && `Protein per serving: ${d.protein}`,
					`Flavour: ${d.flavour}`,
					`Pack size: ${d.pack}`,
					`Packaging: ${d.packaging}`,
					`Planned first order: ${d.volume}`,
					d.addons?.length && `Add-ons: ${d.addons.join(', ')}`,
					d.company && `Brand / company: ${d.company}`,
					d.notes && `Notes: ${d.notes}`,
				]
					.filter(Boolean)
					.join('\n'),
				details: { kind: 'price_request', ref, ...d, at: new Date().toISOString() },
			})
			setDone({ ref, email: d.email, mobile: d.mobile })
		} catch (ex: any) {
			setErr(ex.message)
		} finally {
			setBusy(false)
		}
	}

	return (
		<section className='view'>
			<BackLink />
			<div className='page-head'>
				<h1 className='bar'>Price your own formula</h1>
				<p className='lede'>Want a sample built to your own spec? Fill this in and we’ll email and WhatsApp you a sample and bulk price within 24 working hours.</p>
			</div>
			{done ? (
				<div className='formcard'>
					<div className='done'>
						<Tick />
						<h3 style={{ fontSize: 22 }}>Price request received</h3>
						<div className='ref'>{done.ref}</div>
						<p className='note'>
							We’ll email your quote to {done.email} and WhatsApp +91 {done.mobile} within 24 working hours. A copy of your request is in your inbox now.
						</p>
					</div>
				</div>
			) : (
				<form className='formcard' noValidate onSubmit={onSubmit}>
					<fieldset>
						<legend>Your product</legend>
						<div className='fields'>
							<label className='f'>
								Product type
								<select name='type' required {...cls(bad, 'type')}>
									<option value=''>Choose one</option>
									{['Whey protein', 'Plant protein', 'Yeast protein', 'Mass gainer', 'Creatine', 'BCAA', 'EAA', 'Pre-workout', 'Fat burner', 'Peanut butter', 'Instant protein beverage', 'Something else'].map((o) => (
										<option key={o}>{o}</option>
									))}
								</select>
							</label>
							<label className='f'>
								Protein per serving <span className='opt'>(if relevant)</span>
								<input name='protein' placeholder='e.g. 25 g per 35 g scoop' />
							</label>
							<label className='f'>
								Flavour
								<input name='flavour' placeholder='e.g. Kesar pista, Mango' required {...cls(bad, 'flavour')} />
							</label>
							<label className='f'>
								Pack size
								<select name='pack' required {...cls(bad, 'pack')}>
									<option value=''>Choose one</option>
									{['250 g', '500 g', '1 kg', '2 kg', 'Sachets', 'Other'].map((o) => (
										<option key={o}>{o}</option>
									))}
								</select>
							</label>
							<label className='f'>
								Packaging
								<select name='packaging' required {...cls(bad, 'packaging')}>
									<option value=''>Choose one</option>
									{['Jar / tub', 'Stand-up pouch', 'Single-serve sachet', 'Not sure yet'].map((o) => (
										<option key={o}>{o}</option>
									))}
								</select>
							</label>
							<label className='f'>
								Planned first order
								<select name='volume' required {...cls(bad, 'volume')}>
									<option value=''>Choose one</option>
									{['Sample only for now', '50–100 kg', '100–500 kg', '500 kg+'].map((o) => (
										<option key={o}>{o}</option>
									))}
								</select>
							</label>
							<div className='full'>
								<div className='opt-label' style={{ marginTop: 4 }}>
									Add-ons
								</div>
								<div className='checks'>
									{['Digestive enzymes', 'Added creatine', 'Added BCAA / EAA', 'Vitamins & minerals', 'Electrolytes', 'Sugar-free / stevia'].map((o) => (
										<label key={o}>
											<input type='checkbox' name='addons' value={o} />
											{o}
										</label>
									))}
								</div>
							</div>
							<label className='f full'>
								Anything else we should know <span className='opt'>(optional)</span>
								<textarea name='notes' placeholder='Target price, competitor product you want to match, label claims…' />
							</label>
						</div>
					</fieldset>
					<fieldset>
						<legend>Where to send the quote</legend>
						<div className='fields'>
							<label className='f'>
								Full name
								<input name='name' autoComplete='name' required {...cls(bad, 'name')} />
							</label>
							<label className='f'>
								Brand / company <span className='opt'>(optional)</span>
								<input name='company' autoComplete='organization' />
							</label>
							<label className='f'>
								Mobile
								<div className='mobile-in'>
									<span>+91</span>
									<input name='mobile' inputMode='numeric' maxLength={10} autoComplete='tel-national' required {...cls(bad, 'mobile')} />
								</div>
							</label>
							<label className='f'>
								Email
								<input name='email' type='email' autoComplete='email' required {...cls(bad, 'email')} />
							</label>
						</div>
					</fieldset>
					<p className='err' role='alert'>
						{err}
					</p>
					<button className='btn btn-primary btn-block' type='submit' disabled={busy}>
						Request price
					</button>
				</form>
			)}
		</section>
	)
}

/* ============== R&D consultation ============== */
function ConsultView() {
	const { toast } = useShop()
	const [bad, setBad] = useState<Record<string, boolean>>({})
	const [err, setErr] = useState('')
	const [busy, setBusy] = useState(false)
	const [data, setData] = useState<FormData_ | null>(null)
	const [otp, setOtp] = useState<OtpSession | null>(null)
	const [otpOpen, setOtpOpen] = useState(false)
	const [done, setDone] = useState<{ ref: string; d: FormData_ } | null>(null)
	const minDate = new Date(Date.now() + 864e5).toISOString().slice(0, 10)

	async function onSubmit(e: FormEvent<HTMLFormElement>) {
		e.preventDefault()
		const d = readForm(e.currentTarget)
		const b: Record<string, boolean> = {}
		const list: string[] = []
		const check = (k: string, isBad: boolean, label: string) => {
			b[k] = isBad
			if (isBad) list.push(label)
		}
		check('name', !d.name.trim(), 'name')
		check('mobile', !validMobile(d.mobile), 'a valid mobile')
		check('email', !validEmail(d.email), 'a valid email')
		check('date', !d.date || d.date < minDate, 'a date from tomorrow')
		check('slot', !d.slot, 'time slot')
		check('mode', !d.mode, 'meeting type')
		check('stage', !d.stage, 'your stage')
		check('idea', d.idea.trim().length < 30, 'a fuller product description (30+ characters)')
		check('topics', !d.topics.trim(), 'what to discuss')
		setBad(b)
		if (list.length) return setErr('Add ' + list.join(', ') + '.')
		if (!d.own || !d.nda) return setErr('Tick both confidentiality declarations to book.')
		setErr('')
		setBusy(true)
		try {
			setOtp(await sendOtp(d.mobile, d.email))
			setData(d)
			setOtpOpen(true)
		} catch (ex: any) {
			setErr(ex.message)
		} finally {
			setBusy(false)
		}
	}

	async function book() {
		const d = data!
		const ref = 'GLS-RD-' + rand(6)
		// fg-api treats details.date/slot as a capped booking slot (shared with FWG), so send them under other keys.
		const { date, slot, ...rest } = d
		await submitInquiry('consult', {
			name: d.name,
			email: d.email,
			mobile: d.mobile,
			message: [
				`R&D consultation ${ref}`,
				`Preferred date: ${d.date}, ${d.slot}`,
				`Meeting type: ${d.mode}`,
				`Stage: ${d.stage}`,
				d.company && `Brand / company: ${d.company}`,
				`What they want to make: ${d.idea}`,
				d.ingredients && `Ingredients and dosages: ${d.ingredients}`,
				`To discuss: ${d.topics}`,
				'Confidentiality declarations accepted, mobile verified by OTP.',
			]
				.filter(Boolean)
				.join('\n'),
			details: { kind: 'rnd_consultation', ref, ...rest, preferredDate: date, preferredSlot: slot, confidentialityAccepted: true, mobileVerified: true, at: new Date().toISOString() },
		})
		setOtpOpen(false)
		setDone({ ref, d })
		toast('Consultation booked')
	}

	return (
		<section className='view'>
			<BackLink />
			<div className='page-head'>
				<h1 className='bar'>Book an R&amp;D consultation</h1>
				<p className='lede'>
					Talk through a new formulation with our experts: feasibility, ingredients, cost and compliance. Everything you share stays confidential, and submitting it gives us no rights to your formula.
				</p>
			</div>
			{done ? (
				<div className='formcard'>
					<div className='done'>
						<Tick />
						<h3 style={{ fontSize: 22 }}>Your consultation is booked</h3>
						<div className='ref'>{done.ref}</div>
						<p className='note'>
							{done.d.mode} on {new Date(done.d.date + 'T00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}, {done.d.slot}. Our R&amp;D team will confirm the slot by email at {done.d.email}. Your formulation is recorded under the
							confidentiality terms you accepted.
						</p>
					</div>
				</div>
			) : (
				<form className='formcard' noValidate onSubmit={onSubmit}>
					<fieldset>
						<legend>About you</legend>
						<div className='fields'>
							<label className='f'>
								Full name
								<input name='name' autoComplete='name' required {...cls(bad, 'name')} />
							</label>
							<label className='f'>
								Brand / company <span className='opt'>(optional)</span>
								<input name='company' autoComplete='organization' />
							</label>
							<label className='f'>
								Mobile
								<div className='mobile-in'>
									<span>+91</span>
									<input name='mobile' inputMode='numeric' maxLength={10} autoComplete='tel-national' required {...cls(bad, 'mobile')} />
								</div>
							</label>
							<label className='f'>
								Email
								<input name='email' type='email' autoComplete='email' required {...cls(bad, 'email')} />
							</label>
						</div>
					</fieldset>
					<fieldset>
						<legend>When and how</legend>
						<div className='fields'>
							<label className='f'>
								Preferred date
								<input name='date' type='date' required min={minDate} {...cls(bad, 'date')} />
							</label>
							<label className='f'>
								Time slot
								<select name='slot' required {...cls(bad, 'slot')}>
									<option value=''>Choose a slot</option>
									{['10:00–11:00 AM', '11:30 AM–12:30 PM', '2:00–3:00 PM', '3:30–4:30 PM', '5:00–6:00 PM'].map((o) => (
										<option key={o}>{o}</option>
									))}
								</select>
							</label>
							<label className='f'>
								Meeting type
								<select name='mode' required {...cls(bad, 'mode')}>
									<option value=''>Choose one</option>
									{['Video call', 'Phone call', 'Visit our Surat facility'].map((o) => (
										<option key={o}>{o}</option>
									))}
								</select>
							</label>
							<label className='f'>
								Where are you now
								<select name='stage' required {...cls(bad, 'stage')}>
									<option value=''>Choose one</option>
									{['Just an idea', 'Formula drafted', 'Selling already, want to reformulate'].map((o) => (
										<option key={o}>{o}</option>
									))}
								</select>
							</label>
						</div>
					</fieldset>
					<fieldset>
						<legend>Your formulation</legend>
						<div className='fields'>
							<label className='f full'>
								What do you want to make?
								<textarea
									name='idea'
									required
									minLength={30}
									placeholder='Describe the product, who it’s for and what makes it different. e.g. A 30 g protein whey blend with ashwagandha for women 25–40, chocolate hazelnut flavour.'
									{...cls(bad, 'idea')}
								/>
							</label>
							<label className='f full'>
								Ingredients and dosages <span className='opt'>(as much as you have)</span>
								<textarea name='ingredients' placeholder='e.g. Whey isolate 70%, Whey concentrate 20%, KSM-66 Ashwagandha 300 mg, Digestive enzymes 50 mg…' />
							</label>
							<label className='f full'>
								What should we discuss?
								<textarea name='topics' required placeholder='Feasibility, cost per kg, shelf life, FSSAI category, label claims, flavour trials…' style={{ minHeight: 80 }} {...cls(bad, 'topics')} />
							</label>
						</div>
					</fieldset>
					<label className='consent shield'>
						<input type='checkbox' name='own' required />
						<span>I confirm this formulation and information belong to me or my company, and I’m sharing them only to discuss development and manufacturing with Gomzi Life Science LLP.</span>
					</label>
					<label className='consent shield'>
						<input type='checkbox' name='nda' required />
						<span>
							I understand Gomzi Life Science LLP will keep my formulation confidential and will not use, copy, share or manufacture it for anyone else. Submitting it here transfers <b>no rights</b> of any kind to Gomzi Life Science LLP.
						</span>
					</label>
					<p className='err' role='alert' style={{ marginTop: 10 }}>
						{err}
					</p>
					<button className='btn btn-primary btn-block' type='submit' style={{ marginTop: 6 }} disabled={busy}>
						Verify mobile and book
					</button>
				</form>
			)}

			{/* OTP dialog (used by the consultation form) */}
			<Dialog open={otpOpen} onClose={() => setOtpOpen(false)} labelledBy='oTitle'>
				<div className='dlg-head'>
					<h3 id='oTitle'>Verify your mobile</h3>
					<CloseX />
				</div>
				{otp && data && (
					<OtpPanel
						mobile={data.mobile}
						session={otp}
						onBack={() => setOtpOpen(false)}
						onOk={book}
						onResend={async () => {
							setOtp(await sendOtp(data.mobile, data.email))
							toast('New code sent')
						}}>
						{(body, foot) => (
							<>
								<div className='dlg-body'>{body}</div>
								<div className='dlg-foot'>{foot}</div>
							</>
						)}
					</OtpPanel>
				)}
			</Dialog>
		</section>
	)
}

/* ============== download invoice view ============== */
function InvoiceView() {
	const [orderId, setOrderId] = useState('')
	const [busy, setBusy] = useState(false)
	const [err, setErr] = useState('')
	const [info, setInfo] = useState<InvoiceInfo | null>(null)

	async function onSearch(e: FormEvent) {
		e.preventDefault()
		const q = orderId.trim()
		if (!q) return setErr('Please enter your Order ID or 10-digit mobile number.')
		setErr('')
		setBusy(true)
		setInfo(null)
		try {
			const data = await lookupInvoice(q)
			setInfo(data)
		} catch (ex: any) {
			setErr(ex.message || 'Invoice not found. Please check your details.')
		} finally {
			setBusy(false)
		}
	}

	return (
		<section className='view'>
			<BackLink />
			<div className='page-head'>
				<h1 className='bar'>Download Sample Order Invoice</h1>
				<p className='lede'>Enter your Order ID (e.g. GLS-S-ABC123) or registered 10-digit mobile number to download your GST tax invoice.</p>
			</div>
			<form className='formcard' noValidate onSubmit={onSearch} style={{ maxWidth: '580px', margin: '0 auto' }}>
				<div className='fields'>
					<label className='f full'>
						Order ID or Mobile Number
						<input
							type='text'
							placeholder='e.g. GLS-S-XXXXXX or 9876543210'
							value={orderId}
							onChange={(e) => {
								setOrderId(e.target.value)
								if (err) setErr('')
							}}
							required
							style={{ fontSize: '16px', padding: '12px 14px' }}
						/>
					</label>
				</div>
				{err && <p className='err' role='alert' style={{ marginTop: 12 }}>{err}</p>}
				<button className='btn btn-primary btn-block' type='submit' disabled={busy} style={{ marginTop: 14 }}>
					{busy ? 'Searching invoice...' : 'Find Invoice'}
				</button>
				{info && (
					<div className='done' style={{ marginTop: 24, textAlign: 'left', padding: '18px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
						<div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
							<div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#dcfce7', color: '#166534', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>✓</div>
							<div>
								<b style={{ fontSize: '16px', color: '#0f172a' }}>Invoice Ready</b>
								<div style={{ fontSize: '13px', color: '#64748b' }}>Order {info.order_id} • Invoice {info.invoice_number || 'Generated'}</div>
							</div>
						</div>
						<div style={{ fontSize: '14px', lineHeight: '1.6', color: '#334155', marginBottom: '16px' }}>
							<div><b>Customer:</b> {info.customer_name}</div>
							<div><b>Amount Paid:</b> {inr(info.amount)}</div>
							{info.booking_date && <div><b>Date:</b> {new Date(info.booking_date).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</div>}
						</div>
						<a
							className='btn btn-primary btn-block'
							href={info.download_url ? (info.download_url.startsWith('http') ? info.download_url : `${API_BASE}${info.download_url}`) : invoiceUrlByOrderId(info.order_id)}
							download
							target='_blank'
							rel='noopener noreferrer'
							style={{ textAlign: 'center', textDecoration: 'none', display: 'block' }}>
							Download Invoice PDF
						</a>
					</div>
				)}
				<p className='note' style={{ marginTop: 20, textAlign: 'center', fontSize: '13px', color: '#64748b' }}>
					Need help? Call or WhatsApp our team at <a href='tel:+918320077993' style={{ color: '#5E9A1F', fontWeight: 'bold' }}>+91 83200 77993</a>.
				</p>
			</form>
		</section>
	)
}

/* ============== page ============== */
export default function SampleBooking() {
	const hash = useHash()
	const view = hash === 'pricing' || hash === 'consult' || hash === 'invoice' ? hash : 'home'
	const lastView = useRef(view)
	useEffect(() => {
		if (view !== lastView.current) window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
		lastView.current = view
	}, [view])
	useEffect(() => {
		document.title = 'Gomzi Life Science LLP — Book a product sample'
	}, [])

	return (
		<>
			<Header />
			<main className='wrap'>
				{view === 'home' && <HomeView hash={hash} />}
				{view === 'pricing' && <PricingView />}
				{view === 'consult' && <ConsultView />}
				{view === 'invoice' && <InvoiceView />}
			</main>
			<Footer />
			<ProductDialog />
			<ComboDialog />
			<CartDrawer />
			<CheckoutDialog />
			<TermsDialog />
			<Toast />
		</>
	)
}
