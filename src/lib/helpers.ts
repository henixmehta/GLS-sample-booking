import { CATEGORIES, COMBO, FREE_SHIP_MIN, MAX_PER_ITEM, PRODUCTS, SHIP_FEE, type Product } from '../data/catalog'
import { IMG } from './images'

export const inr = (n: number) => '₹' + n.toLocaleString('en-IN')
export const rand = (n: number) => Array.from({ length: n }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)]).join('')
export const byId = (id: string) => PRODUCTS.find((p) => p.id === id) as Product
export const catById = (id: string) => CATEGORIES.find((c) => c.id === id)!
export const validMobile = (m: string) => /^[6-9]\d{9}$/.test(m)
export const validEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e)
export const validPin = (p: string) => /^[1-9]\d{5}$/.test(p)
export const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches

/* Eased scroll that lands the element just below the sticky header. Animated in JS because browsers skip
   smooth scrolling when the OS turns animation effects off (common on Windows). Any wheel/touch/key input cancels it. */
export function softScrollTo(el: HTMLElement, ms = 650) {
	const header = document.querySelector<HTMLElement>('header.top')
	const from = window.scrollY
	const to = Math.max(0, el.getBoundingClientRect().top + from - (header?.offsetHeight ?? 0) - 12)
	if (Math.abs(to - from) < 2) return
	const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2)
	const start = performance.now()
	let stopped = false
	const stop = () => (stopped = true)
	const events = ['wheel', 'touchstart', 'keydown'] as const
	events.forEach((ev) => window.addEventListener(ev, stop, { once: true, passive: true }))
	const step = (now: number) => {
		const t = Math.min(1, (now - start) / ms)
		if (!stopped) window.scrollTo({ top: from + (to - from) * ease(t), behavior: 'instant' as ScrollBehavior })
		if (t < 1 && !stopped) requestAnimationFrame(step)
		else events.forEach((ev) => window.removeEventListener(ev, stop))
	}
	requestAnimationFrame(step)
}

/* Package illustration for products without a photo or as a fallback */
export function packSVG(p?: Product) {
	if (!p) return ''
	const c = p.color || (p.cat === 'creatine' ? '#F2C230' : p.cat === 'whey' ? '#7FB3D5' : p.cat === 'plant' ? '#6BAA3A' : p.cat === 'gainer' ? '#B5763F' : '#8DC63F')
	const t = p.dark ? '#1b1b1b' : '#ffffff'
	const nm = p.short || (p.name ? p.name.toUpperCase().slice(0, 14) : 'SAMPLE')
	const shape = p.shape || (p.cat === 'beverage' ? 'sachet' : p.cat === 'wellness' ? 'bottle' : p.cat === 'creatine' || p.cat === 'amino' ? 'jar' : 'tub')
	const fs = nm.length > 12 ? 15 : nm.length > 9 ? 18 : 22
	const label = (y: number) => `<text x="100" y="${y}" text-anchor="middle" font-family="Montserrat,Arial,sans-serif" font-weight="800" font-size="12" fill="#fff" letter-spacing="1">YOUR LOGO</text>`
	let s = ''
	if (shape === 'tub') s = `<rect x="48" y="12" width="104" height="30" rx="6" fill="#111"/><rect x="44" y="36" width="112" height="10" rx="3" fill="#222"/><rect x="28" y="44" width="144" height="186" rx="34" fill="#1d1d1d"/><path d="M28 135h144v52c0 24-14 43-34 43H62c-20 0-34-19-34-43z" fill="${c}"/>${label(100)}<text x="100" y="168" text-anchor="middle" font-family="Montserrat,Arial,sans-serif" font-weight="900" font-style="italic" font-size="${fs}" fill="${t}">${nm}</text>`
	if (shape === 'jar') s = `<rect x="30" y="50" width="140" height="40" rx="8" fill="#111"/><rect x="26" y="86" width="148" height="112" rx="14" fill="#1d1d1d"/><rect x="26" y="146" width="148" height="52" rx="10" fill="${c}"/><rect x="26" y="146" width="148" height="12" fill="${c}"/>${label(118)}<text x="100" y="178" text-anchor="middle" font-family="Montserrat,Arial,sans-serif" font-weight="900" font-size="${fs - 2}" fill="${t}">${nm}</text>`
	if (shape === 'bottle') s = `<rect x="70" y="16" width="60" height="30" rx="5" fill="#111"/><rect x="62" y="44" width="76" height="12" rx="3" fill="#2a2a2a"/><rect x="44" y="54" width="112" height="170" rx="20" fill="#f4f4f4" stroke="#ddd"/><rect x="44" y="96" width="112" height="96" fill="${c}"/>${label(126)}<text x="100" y="160" text-anchor="middle" font-family="Montserrat,Arial,sans-serif" font-weight="900" font-size="${Math.min(15, Math.floor(150 / nm.length))}" fill="${t}">${nm}</text>`
	if (shape === 'sachet') s = `<path d="M40 30l8 8 8-8 8 8 8-8 8 8 8-8 8 8 8-8 8 8 8-8 8 8 8-8 8 8 8-8v190H40z" fill="${c}"/><rect x="40" y="150" width="120" height="70" fill="rgba(0,0,0,.18)"/><circle cx="100" cy="185" r="18" fill="rgba(255,255,255,.85)"/><text x="100" y="191" text-anchor="middle" font-family="Montserrat,Arial,sans-serif" font-weight="800" font-size="14" fill="${c}">5g</text>${label(80)}<text x="100" y="120" text-anchor="middle" font-family="Montserrat,Arial,sans-serif" font-weight="900" font-size="${Math.min(fs, 14)}" fill="#fff">${nm}</text>`
	if (shape === 'bar') s = `<g transform="rotate(-12 100 120)"><path d="M14 92l6-6 6 6 6-6v68l-6-6-6 6-6-6z" fill="#111"/><rect x="30" y="86" width="140" height="68" fill="#1d1d1d"/><rect x="30" y="128" width="140" height="26" fill="${c}"/><path d="M170 86l6 6 6-6 6 6v68l-6-6-6 6-6-6z" fill="#111"/><text x="100" y="112" text-anchor="middle" font-family="Montserrat,Arial,sans-serif" font-weight="800" font-size="11" fill="#fff">YOUR LOGO</text><text x="100" y="147" text-anchor="middle" font-family="Montserrat,Arial,sans-serif" font-weight="900" font-size="14" fill="#1b1b1b">${nm}</text></g>`
	const vb = ({ jar: '12 40 176 168', bar: '0 52 200 136', sachet: '20 20 160 214' } as Record<string, string>)[shape] || '0 0 200 240'
	const sh = shape === 'tub' || shape === 'bottle' ? `<ellipse cx="100" cy="232" rx="70" ry="6" fill="rgba(0,0,0,.12)"/>` : ''
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}">${sh}${s}</svg>`
	return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)
}
const svgCache: Record<string, string> = {}
export const pimg = (p?: Product) => (p ? (p.img && IMG[p.img] ? IMG[p.img] : (svgCache[p.id] ||= packSVG(p))) : '')

export const onImgError = (p?: Product) => (e: React.SyntheticEvent<HTMLImageElement>) => {
	const target = e.currentTarget
	const fallback = packSVG(p)
	if (fallback && target.src !== fallback) {
		target.src = fallback
	}
}

/* ============== cart ============== */
export interface Selection { pid: string; flavour: string; variant: string | null; qty: number }
export interface KitPart { pid: string; flavour: string; variant: string | null; extra: number; qty?: number }
export interface CustomDemandItem {
	kind: 'custom'
	customId: string
	name: string
	category: string
	flavour: string
	pack: string
	notes: string
	attachment: string
	previewUrl?: string
	price: number
	qty: number
}

export const customBeakerSvg =
	'data:image/svg+xml;charset=utf-8,' +
	encodeURIComponent(
		'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect width="80" height="80" rx="14" fill="#dcfce7"/><g transform="translate(20, 18)"><path d="M10 2v7.5" stroke="#16a34a" stroke-width="2.4" stroke-linecap="round"/><path d="M14 2v7.5" stroke="#16a34a" stroke-width="2.4" stroke-linecap="round"/><path d="M7.5 2h9" stroke="#16a34a" stroke-width="2.4" stroke-linecap="round"/><path d="M14 9.5a7 7 0 1 1-4 0v-7.5" stroke="#16a34a" stroke-width="2.4" fill="none" stroke-linejoin="round"/><circle cx="12" cy="17" r="1.5" fill="#16a34a"/><circle cx="9.5" cy="21" r="1.5" fill="#16a34a"/><circle cx="14.5" cy="21" r="1.5" fill="#16a34a"/></g></svg>'
	)
export type CartItem = (Selection & { kind?: undefined }) | { kind: 'combo'; qty: 1; parts: KitPart[] } | CustomDemandItem

/* Tiered combo pricing:
   1 product: ₹249
   2 products: ₹450
   3 products: ₹650
   4 products: ₹750
   5 products: ₹999
   6+ products: ₹999 + (count - 5) * 249 */
export function comboTierPrice(count: number): number {
	if (count <= 0) return 0
	if (count === 1) return 249
	if (count === 2) return 450
	if (count === 3) return 650
	if (count === 4) return 750
	if (count === 5) return 999
	return 999 + (count - 5) * 249
}

export const comboItemCount = (parts: KitPart[]) =>
	parts.reduce((sum, x) => sum + (x.qty !== undefined ? x.qty : 1 + (x.extra || 0)), 0)

export const comboPrice = (parts: KitPart[]) => comboTierPrice(comboItemCount(parts))
export const comboExtras = (parts: KitPart[]) => Math.max(0, comboPrice(parts) - COMBO.price)
export const isCombo = (i: CartItem): i is Extract<CartItem, { kind: 'combo' }> => i.kind === 'combo'
export const isCustom = (i: CartItem): i is CustomDemandItem => i.kind === 'custom'
export const optsTxt = (x: { variant: string | null; flavour: string }) => [x.variant, x.flavour].filter(Boolean).join(', ')
export const itemPrice = (i: CartItem) => {
	if (isCombo(i)) return comboPrice(i.parts)
	if (isCustom(i)) return (i.price || 249) * i.qty
	return byId(i.pid).price * i.qty
}
export const itemName = (i: CartItem) => {
	if (isCombo(i)) {
		const n = comboItemCount(i.parts)
		return n === 5 ? 'Full Combo Sample Kit (5 samples)' : `Combo Sample Kit (${n} sample${n > 1 ? 's' : ''})`
	}
	if (isCustom(i)) {
		return i.name || 'Custom Demanded Product'
	}
	return byId(i.pid).name
}
export const itemSub = (i: CartItem) => {
	if (isCombo(i)) {
		return i.parts
				.filter((x) => (x.qty !== undefined ? x.qty > 0 : true))
				.map((x) => `${byId(x.pid).name} (${optsTxt(x)}) ×${x.qty !== undefined ? x.qty : 1 + (x.extra || 0)}`)
				.join('; ')
	}
	if (isCustom(i)) {
		const parts = [i.category, i.flavour, i.pack].filter(Boolean)
		return `${parts.join(', ') || 'Custom formulation'} ×${i.qty}`
	}
	return `${[optsTxt(i), byId(i.pid).pack].filter(Boolean).join(', ')} ×${i.qty}`
}
export const itemImg = (i: CartItem) => {
	if (isCombo(i)) return IMG.lineup
	if (isCustom(i)) return i.previewUrl || i.attachment || customBeakerSvg
	return pimg(byId(i.pid))
}
export const itemCount = (i: CartItem) => (isCombo(i) ? 1 : i.qty)
export const isValidItem = (i: CartItem) => {
	if (isCombo(i)) return i.parts.filter((x) => (x.qty !== undefined ? x.qty > 0 : true)).every((x) => byId(x.pid))
	if (isCustom(i)) return !!i.name && typeof i.qty === 'number' && i.qty > 0
	return !!byId(i.pid)
}

export function mergeSel(box: CartItem[], sel: Selection): CartItem[] {
	const ex = box.findIndex((i) => !isCombo(i) && !isCustom(i) && i.pid === sel.pid && i.flavour === sel.flavour && i.variant === sel.variant)
	if (ex < 0) return [...box, { ...sel }]
	return box.map((i, k) => (k === ex && !isCombo(i) && !isCustom(i) ? { ...i, qty: Math.min(MAX_PER_ITEM, i.qty + sel.qty) } : i))
}

/* First flavour / option, one pack: what the product card's "Add to cart" puts in the cart */
export const defaultSel = (pid: string): Selection => {
	const p = byId(pid)
	return { pid, flavour: p.flavours[0], variant: p.variants ? p.variants[0] : null, qty: 1 }
}

/* Change flavour, option or packs of a cart line. If it now matches another line, the two are merged. */
export function updateItem(box: CartItem[], idx: number, patch: Partial<Selection> & { qty?: number }): CartItem[] {
	const item = box[idx]
	if (!item || isCombo(item)) return box
	if (isCustom(item)) {
		const next = { ...item, qty: Math.min(MAX_PER_ITEM, Math.max(1, patch.qty ?? item.qty)) }
		return box.map((x, k) => (k === idx ? next : x))
	}
	const next = { ...item, ...patch, qty: Math.min(MAX_PER_ITEM, Math.max(1, patch.qty ?? item.qty)) }
	const dup = box.findIndex((i, k) => k !== idx && !isCombo(i) && !isCustom(i) && i.pid === next.pid && i.flavour === next.flavour && i.variant === next.variant)
	if (dup < 0) return box.map((x, k) => (k === idx ? next : x))
	return box.flatMap((x, k) => (k === idx ? [] : k === dup && !isCombo(x) && !isCustom(x) ? [{ ...x, qty: Math.min(MAX_PER_ITEM, x.qty + next.qty) }] : [x]))
}

/* "You may also like": products from the same categories as the cart first, then other photographed products */
export function relatedTo(box: CartItem[], limit = 6): Product[] {
	const inCart = new Set(box.flatMap((i) => (isCombo(i) ? i.parts.map((x) => x.pid) : isCustom(i) ? [] : [i.pid])))
	const cats = new Set([...inCart].map((id) => byId(id).cat))
	const same = PRODUCTS.filter((p) => cats.has(p.cat) && !inCart.has(p.id))
	const others = PRODUCTS.filter((p) => !cats.has(p.cat) && !inCart.has(p.id) && p.img)
	return [...same, ...others].slice(0, limit)
}

export const subtotalOf =(box: CartItem[]) => box.reduce((a, i) => a + itemPrice(i), 0)
export const shippingOf = (box: CartItem[]) => (!box.length || subtotalOf(box) >= FREE_SHIP_MIN ? 0 : SHIP_FEE)
export const grandTotalOf = (box: CartItem[]) => subtotalOf(box) + shippingOf(box)
export function shipNudge(box: CartItem[]) {
	if (!box.length) return `Free shipping on orders of ${inr(FREE_SHIP_MIN)} or more.`
	const s = subtotalOf(box)
	if (s >= FREE_SHIP_MIN) return 'You’ve unlocked free shipping.'
	const r = FREE_SHIP_MIN - s, avg = s / box.reduce((a, i) => a + itemCount(i), 0), n = Math.max(1, Math.ceil(r / avg))
	return `Add ${n} more sample${n > 1 ? 's' : ''} (${inr(r)} more) to get free shipping.`
}
