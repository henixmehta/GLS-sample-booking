import { useEffect, useState } from 'react'
import { MAX_PER_ITEM, type NutTable } from '../data/catalog'
import { byId, catById, inr, onImgError, pimg, type Selection } from '../lib/helpers'
import Dialog, { CloseX } from './Dialog'
import { useShop } from './ShopContext'

function Nut({ t }: { t: NutTable }) {
	return (
		<>
			{t.title && <h5 style={{ fontFamily: 'var(--display)', fontSize: 14, margin: '14px 0 0' }}>{t.title}</h5>}
			<div className='nut-wrap'>
				<table className='nut nut-full'>
					<thead>
						<tr>
							<th scope='col'>Nutrients</th>
							{t.head.map((h) => (
								<th scope='col' key={h}>
									{h}
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{t.rows.map((r) => (
							<tr key={r[0]}>
								<th scope='row'>{r[0]}</th>
								{r.slice(1).map((c, j) => (
									<td key={j}>{c}</td>
								))}
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</>
	)
}

export default function ProductDialog() {
	const { productId, closeProduct, addSel, openDrawer, openCheckout } = useShop()
	const [sel, setSel] = useState<Selection | null>(null)

	useEffect(() => {
		if (!productId) return
		const p = byId(productId)
		setSel({ pid: productId, flavour: p.flavours[0], variant: p.variants ? p.variants[0] : null, qty: 1 })
	}, [productId])

	const p = sel ? byId(sel.pid) : null

	const add = () => {
		addSel(sel!)
		closeProduct()
	}

	return (
		<Dialog open={!!productId} onClose={closeProduct} labelledBy='pTitle'>
			<div className='dlg-head'>
				<h3 id='pTitle'>{p?.name}</h3>
				<CloseX />
			</div>
			<div className='dlg-body'>
				{p && sel && (
					<div className='pd'>
						<div className='pd-img'>
							<img src={pimg(p)} alt={p.name} onError={onImgError(p)} />
						</div>
						<div>
							<span className='cat'>
								{catById(p.cat).name} &nbsp;|&nbsp; {p.pack}
							</span>
							<p style={{ marginTop: 8 }}>{p.desc}</p>
							{p.nut ? (
								p.nut.map((t, k) => <Nut t={t} key={k} />)
							) : (
								<table className='nut'>
									<tbody>
										{p.facts.map(([k, v]) => (
											<tr key={k}>
												<th scope='row'>{k}</th>
												<td>{v}</td>
											</tr>
										))}
									</tbody>
								</table>
							)}
							{p.lists && (
								<div className='plist'>
									{p.lists.map(([t, l]) => (
										<div key={t}>
											<h5>{t}</h5>
											<ul>
												{l.map((x) => (
													<li key={x}>{x}</li>
												))}
											</ul>
										</div>
									))}
								</div>
							)}
							<p className='note' style={{ marginTop: 8 }}>
								{p.isNew ? 'Formula is customisable. Values for your sample come with it.' : 'Approximate, indicative values from our standard formula.'} Samples are for tasting and experience; your final product can be lab-tested independently.
							</p>
							{p.variants && (
								<>
									<div className='opt-label' id='vl'>
										{p.variantLabel}
									</div>
									<div className='pills' role='radiogroup' aria-labelledby='vl'>
										{p.variants.map((v) => (
											<button type='button' className='pill' role='radio' aria-checked={v === sel.variant} key={v} onClick={() => setSel({ ...sel, variant: v })}>
												{v}
											</button>
										))}
									</div>
								</>
							)}
							<div className='opt-label' id='fl'>
								{p.flavourLabel || 'Flavour'}
							</div>
							<div className='pills' role='radiogroup' aria-labelledby='fl'>
								{p.flavours.map((f) => (
									<button type='button' className='pill' role='radio' aria-checked={f === sel.flavour} key={f} onClick={() => setSel({ ...sel, flavour: f })}>
										{f}
									</button>
								))}
							</div>
							<div className='opt-label'>Packs</div>
							<div className='qty'>
								<button type='button' aria-label='One less' onClick={() => setSel({ ...sel, qty: Math.max(1, sel.qty - 1) })}>
									−
								</button>
								<output aria-live='polite'>{sel.qty}</output>
								<button type='button' aria-label='One more' onClick={() => setSel({ ...sel, qty: Math.min(MAX_PER_ITEM, sel.qty + 1) })}>
									+
								</button>
							</div>
							<span className='note' style={{ marginLeft: 10 }}>
								Up to {MAX_PER_ITEM} per product
							</span>
						</div>
					</div>
				)}
			</div>
			<div className='dlg-foot'>
				<span className='price' style={{ marginRight: 'auto' }}>
					{p && sel ? inr(p.price * sel.qty) : ''}
				</span>
				<button
					className='btn btn-ghost'
					type='button'
					onClick={() => {
						add()
						openDrawer()
					}}>
					Add to cart
				</button>
				<button
					className='btn btn-primary'
					type='button'
					onClick={() => {
						add()
						openCheckout(1)
					}}>
					Buy now
				</button>
			</div>
		</Dialog>
	)
}
