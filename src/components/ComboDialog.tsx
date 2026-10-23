import { useEffect, useState } from 'react'
import { COMBO, MAX_PER_ITEM } from '../data/catalog'
import { byId, comboItemCount, comboPrice, inr, onImgError, pimg, type KitPart } from '../lib/helpers'
import Dialog, { CloseX } from './Dialog'
import { useShop } from './ShopContext'

const kitPart = (pid: string, qty = 1): KitPart => {
	const p = byId(pid)
	return { pid, variant: p.variants ? p.variants[0] : null, flavour: p.flavours[0], qty, extra: Math.max(0, qty - 1) }
}

function Sel({ label, opts, cur, labels, onChange }: { label: string; opts: string[]; cur: string | null; labels?: string[]; onChange: (v: string) => void }) {
	return (
		<select aria-label={label} value={cur ?? ''} onChange={(e) => onChange(e.target.value)}>
			{opts.map((o, j) => (
				<option value={o} key={o}>
					{labels ? labels[j] : o}
				</option>
			))}
		</select>
	)
}

export default function ComboDialog() {
	const { comboOpen, setComboOpen, addCombo, openCheckout } = useShop()
	const [kit, setKit] = useState<KitPart[]>([])

	useEffect(() => {
		if (comboOpen) setKit(COMBO.parts.map((pt) => kitPart(pt.options[0], 1)))
	}, [comboOpen])

	const setPart = (k: number, x: KitPart) => setKit((all) => all.map((y, j) => (j === k ? x : y)))
	const totalItems = comboItemCount(kit)
	const total = comboPrice(kit)
	const regularCost = totalItems * 249
	const savings = Math.max(0, regularCost - total)

	return (
		<Dialog open={comboOpen} onClose={() => setComboOpen(false)} labelledBy='kTitle'>
			<div className='dlg-head'>
				<h3 id='kTitle'>Custom Combo Sample Kit</h3>
				<CloseX />
			</div>
			<div className='dlg-body'>
				{/* Tiered pricing guide pills */}
				<div
					style={{
						background: 'var(--surface-2)',
						border: '1.5px solid var(--line)',
						borderRadius: 12,
						padding: '12px 14px',
						marginBottom: 16,
					}}>
					<div style={{ fontWeight: 800, fontSize: 13.5, color: 'var(--ink)', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
						<span>⚡ Tiered Combo Savings</span>
						<span style={{ fontSize: 12, color: 'var(--lime-deep)', fontWeight: 700 }}>Free shipping included</span>
					</div>
					<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(92px, 1fr))', gap: 6, textAlign: 'center' }}>
						{[
							{ n: 1, label: '1 Sample', price: '₹249' },
							{ n: 2, label: '2 Samples', price: '₹450' },
							{ n: 3, label: '3 Samples', price: '₹650' },
							{ n: 4, label: '4 Samples', price: '₹750' },
							{ n: 5, label: '5 Samples', price: '₹999' },
							{ n: 6, label: '6+ Samples', price: '+₹249 ea' },
						].map((tier) => {
							const active = tier.n === 6 ? totalItems >= 6 : totalItems === tier.n
							return (
								<div
									key={tier.n}
									style={{
										background: active ? 'var(--lime-deep)' : 'var(--surface)',
										color: active ? '#ffffff' : 'inherit',
										border: `1.5px solid ${active ? 'var(--lime-deep)' : 'var(--line)'}`,
										borderRadius: 8,
										padding: '6px 4px',
										transition: 'all .2s ease',
										boxShadow: active ? '0 2px 8px rgba(94, 154, 31, .35)' : 'none',
									}}>
									<div style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.02em', opacity: active ? 0.95 : 0.75 }}>{tier.label}</div>
									<div style={{ fontSize: 14, fontWeight: 900 }}>{tier.price}</div>
								</div>
							)
						})}
					</div>
				</div>

				<p className='note' style={{ marginBottom: 12 }}>
					Choose any combination of samples below. Add or remove items to get instant bundle savings.
				</p>

				{kit.map((x, k) => {
					const pt = COMBO.parts[k],
						p = byId(x.pid)
					const curQty = x.qty !== undefined ? x.qty : 1 + (x.extra || 0)
					return (
						<div className={`kit-row ${curQty === 0 ? 'disabled' : ''}`} key={pt.label} style={{ opacity: curQty === 0 ? 0.45 : 1, transition: 'opacity .2s' }}>
							<img src={pimg(p)} alt='' onError={onImgError(p)} />
							<div className='kit-main'>
								<h4>{pt.label}</h4>
								<div className='kit-sels'>
									{pt.options.length > 1 ? (
										<Sel
											label='pid'
											opts={pt.options}
											cur={x.pid}
											labels={pt.options.map((o) => byId(o).name)}
											onChange={(v) => setPart(k, { ...kitPart(v, curQty), qty: curQty, extra: Math.max(0, curQty - 1) })}
										/>
									) : (
										<span className='sub'>{p.name}</span>
									)}
									{p.variants && <Sel label='variant' opts={p.variants} cur={x.variant} onChange={(v) => setPart(k, { ...x, variant: v })} />}
									{p.flavours.length > 1 ? <Sel label='flavour' opts={p.flavours} cur={x.flavour} onChange={(v) => setPart(k, { ...x, flavour: v })} /> : <span className='sub'>{x.flavour}</span>}
								</div>
							</div>
							<div className='kit-extra'>
								<span className='note' style={{ fontWeight: 600, color: curQty === 0 ? 'var(--ink-soft)' : 'var(--ink)' }}>
									{curQty === 0 ? 'Not selected' : curQty === 1 ? '1 sample' : `${curQty} samples`}
								</span>
								<div className='qty'>
									<button
										type='button'
										aria-label={`One less ${pt.label}`}
										disabled={curQty === 0}
										onClick={() => {
											const nextQty = Math.max(0, curQty - 1)
											setPart(k, { ...x, qty: nextQty, extra: Math.max(0, nextQty - 1) })
										}}>
										−
									</button>
									<output aria-label={`${pt.label} quantity`}>{curQty}</output>
									<button
										type='button'
										aria-label={`One more ${pt.label}`}
										disabled={curQty >= MAX_PER_ITEM}
										onClick={() => {
											const nextQty = Math.min(MAX_PER_ITEM, curQty + 1)
											setPart(k, { ...x, qty: nextQty, extra: Math.max(0, nextQty - 1) })
										}}>
										+
									</button>
								</div>
							</div>
						</div>
					)
				})}
			</div>
			<div className='dlg-foot'>
				<span className='price' style={{ marginRight: 'auto' }}>
					{inr(total)}
					<small>
						{totalItems === 0 ? (
							'Select at least 1 sample'
						) : (
							<>
								{totalItems} sample{totalItems > 1 ? 's' : ''} selected
								{savings > 0 && <b style={{ color: 'var(--lime-deep)', marginLeft: 6 }}>Save {inr(savings)}!</b>}
							</>
						)}
					</small>
				</span>
				<button
					className='btn btn-primary'
					type='button'
					disabled={totalItems === 0}
					onClick={() => {
						const activeParts = kit.filter((x) => (x.qty !== undefined ? x.qty > 0 : 1 + (x.extra || 0) > 0))
						addCombo({
							kind: 'combo',
							qty: 1,
							parts: activeParts.map((x) => ({
								...x,
								qty: x.qty !== undefined ? x.qty : 1 + (x.extra || 0),
								extra: Math.max(0, (x.qty !== undefined ? x.qty : 1 + (x.extra || 0)) - 1),
							})),
						})
						setComboOpen(false)
						openCheckout(0)
					}}>
					{totalItems === 0 ? 'Select samples' : `Add combo (${inr(total)}) to cart`}
				</button>
			</div>
		</Dialog>
	)
}
