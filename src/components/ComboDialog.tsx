import { useEffect, useState } from 'react'
import { COMBO, MAX_PER_ITEM } from '../data/catalog'
import { byId, comboPrice, inr, pimg, type KitPart } from '../lib/helpers'
import Dialog, { CloseX } from './Dialog'
import { useShop } from './ShopContext'

const kitPart = (pid: string): KitPart => {
	const p = byId(pid)
	return { pid, variant: p.variants ? p.variants[0] : null, flavour: p.flavours[0], extra: 0 }
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
		if (comboOpen) setKit(COMBO.parts.map((pt) => kitPart(pt.options[0])))
	}, [comboOpen])

	const setPart = (k: number, x: KitPart) => setKit((all) => all.map((y, j) => (j === k ? x : y)))
	const total = comboPrice(kit)

	return (
		<Dialog open={comboOpen} onClose={() => setComboOpen(false)} labelledBy='kTitle'>
			<div className='dlg-head'>
				<h3 id='kTitle'>Full Combo Sample Kit</h3>
				<CloseX />
			</div>
			<div className='dlg-body'>
				<p className='note' style={{ marginBottom: 6 }}>
					One sample of each is included: {inr(COMBO.price)} for the kit with free shipping. Want more of something? Each extra pack is charged at that product’s sample price.
				</p>
				{kit.map((x, k) => {
					const pt = COMBO.parts[k], p = byId(x.pid)
					return (
						<div className='kit-row' key={pt.label}>
							<img src={pimg(p)} alt='' />
							<div className='kit-main'>
								<h4>{pt.label}</h4>
								<div className='kit-sels'>
									{pt.options.length > 1 ? (
										<Sel label='pid' opts={pt.options} cur={x.pid} labels={pt.options.map((o) => byId(o).name)} onChange={(v) => setPart(k, { ...kitPart(v), extra: x.extra })} />
									) : (
										<span className='sub'>{p.name}</span>
									)}
									{p.variants && <Sel label='variant' opts={p.variants} cur={x.variant} onChange={(v) => setPart(k, { ...x, variant: v })} />}
									{p.flavours.length > 1 ? <Sel label='flavour' opts={p.flavours} cur={x.flavour} onChange={(v) => setPart(k, { ...x, flavour: v })} /> : <span className='sub'>{x.flavour}</span>}
								</div>
							</div>
							<div className='kit-extra'>
								<span className='note'>{x.extra ? `+${inr(x.extra * p.price)} for ${x.extra} extra` : `1 included, extra ${inr(p.price)} each`}</span>
								<div className='qty'>
									<button type='button' aria-label={`One less ${pt.label}`} disabled={x.extra === 0} onClick={() => setPart(k, { ...x, extra: Math.max(0, x.extra - 1) })}>
										−
									</button>
									<output aria-label={`${pt.label} quantity`}>{1 + x.extra}</output>
									<button type='button' aria-label={`One more ${pt.label}`} disabled={1 + x.extra >= MAX_PER_ITEM} onClick={() => setPart(k, { ...x, extra: Math.min(MAX_PER_ITEM - 1, x.extra + 1) })}>
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
					{total > COMBO.price && (
						<small>
							{inr(COMBO.price)} kit + {inr(total - COMBO.price)} extras
						</small>
					)}
				</span>
				<button
					className='btn btn-primary'
					type='button'
					onClick={() => {
						addCombo({ kind: 'combo', qty: 1, parts: kit.map((x) => ({ ...x })) })
						setComboOpen(false)
						openCheckout(0)
					}}>
					Add combo to cart
				</button>
			</div>
		</Dialog>
	)
}
