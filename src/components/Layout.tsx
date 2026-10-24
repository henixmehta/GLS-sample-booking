import type { MouseEvent } from 'react'
import { inr, itemCount, subtotalOf } from '../lib/helpers'
import { CERT_LOGOS, IMG } from '../lib/images'
import { useShop } from './ShopContext'

/* Links with href="#" go back to the category view, like the original page. */
export function goHome(e: MouseEvent) {
	e.preventDefault()
	if (location.hash) location.hash = ''
	else window.dispatchEvent(new HashChangeEvent('hashchange'))
}

export function Header() {
	const { box, openDrawer, setComboOpen } = useShop()
	const sub = subtotalOf(box)
	return (
		<header className='top'>
			<div className='wrap'>
				<a href='#' className='logo' aria-label='Gomzi Life Science LLP, all categories' onClick={goHome}>
					<img src={IMG.logo} alt='Gomzi Life Science LLP' />
				</a>
				<div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
					<a href='#invoice' className='btn btn-ghost' style={{ fontSize: '13px', padding: '6px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#334155', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
						<svg viewBox='0 0 24 24' width='16' height='16' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
							<path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z'></path>
							<polyline points='14 2 14 8 20 8'></polyline>
							<line x1='12' y1='18' x2='12' y2='12'></line>
							<line x1='9' y1='15' x2='15' y2='15'></line>
						</svg>
						Invoice
					</a>
					<button className='btn btn-primary cart-btn' type='button' aria-label='Open cart' onClick={openDrawer}>
						<svg viewBox='0 0 24 24' width='20' height='20' aria-hidden='true'>
							<path d='M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.5L21 8H6' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
							<circle cx='10' cy='20' r='1.5' fill='currentColor' />
							<circle cx='17' cy='20' r='1.5' fill='currentColor' />
						</svg>
						Cart <span className='box-count'>{box.reduce((a, i) => a + itemCount(i), 0)}</span>
						<span className='cart-total'>{box.length ? inr(sub) : ''}</span>
					</button>
				</div>
			</div>
			<button className='offerbar' type='button' onClick={() => setComboOpen(true)}>
				<span className='wrap'>
					<b>Combo offer: 1 for ₹249, 2 for ₹450, 3 for ₹650, 4 for ₹750, 5 for ₹999</b>
					<span className='ob-items'>Protein, Pre-Workout, Creatine, BCAA &amp; Gainer</span>
					<span className='ob-ship'>Free shipping</span>
					<span className='ob-go'>Build your combo ›</span>
				</span>
			</button>
		</header>
	)
}

export function Footer() {
	return (
		<footer>
			<div className='wrap foot'>
				<p>
					<b>Gomzi Life Science LLP</b>, 443 to 445, 1st Floor, RJD Textile Park, Ichchhapor, Hazira Road, Surat, Gujarat 394510
				</p>
				<p>
					<a href='tel:+918320077993'>+91 83200 77993</a> &nbsp;|&nbsp;{' '}
					<a href='#invoice'>Download Invoice</a> &nbsp;|&nbsp;{' '}
					<a href='https://gomzilifesciences.in' target='_blank' rel='noopener'>
						gomzilifesciences.in
					</a>
				</p>
				<ul className='foot-certs' aria-label='Certifications'>
					{CERT_LOGOS.map((c) => (
						<li key={c.name}>
							<img src={c.src} alt={c.name} title={c.name} loading='lazy' />
						</li>
					))}
				</ul>
			</div>
		</footer>
	)
}
