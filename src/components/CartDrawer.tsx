import { FREE_SHIP_MIN, MAX_PER_ITEM } from '../data/catalog'
import { byId, grandTotalOf, inr, isCombo, itemCount, itemImg, itemName, itemPrice, itemSub, pimg, relatedTo, shipNudge, shippingOf, subtotalOf } from '../lib/helpers'
import Dialog, { CloseX } from './Dialog'
import { useShop } from './ShopContext'

/* Flavour / ratio / texture chips for one cart line. A single option is shown as a fixed chip. */
function OptionChips({ id, label, options, value, onChange }: { id: string; label: string; options: string[]; value: string; onChange: (v: string) => void }) {
	return (
		<div className='ci-opt'>
			<span className='ci-opt-label' id={id}>
				{label}
			</span>
			{options.length > 1 ? (
				<div className='chips' role='radiogroup' aria-labelledby={id}>
					{options.map((o) => (
						<button key={o} type='button' className='chip-opt' role='radio' aria-checked={o === value} onClick={() => o !== value && onChange(o)}>
							{o}
						</button>
					))}
				</div>
			) : (
				<div className='chips'>
					<span className='chip-opt chip-fixed'>{value}</span>
				</div>
			)}
		</div>
	)
}

/* Right-side cart panel. Opens on "Add to cart" and from the header cart button.
   Order: cart lines, totals and checkout, then "You may also like". */
export default function CartDrawer() {
	const { box, drawerOpen, closeDrawer, removeAt, updateAt, quickAdd, openProduct, openCheckout } = useShop()
	const sub = subtotalOf(box)
	const count = box.reduce((a, i) => a + itemCount(i), 0)
	const related = relatedTo(box)

	return (
		<Dialog open={drawerOpen} onClose={closeDrawer} labelledBy='drawerTitle' className='drawer'>
			<div className='dlg-head'>
				<h3 id='drawerTitle'>
					Your cart{count ? <span className='drawer-count'>{count}</span> : null}
				</h3>
				<CloseX />
			</div>

			{/* Always shown, also on an empty cart and after free shipping is unlocked */}
			<div className={`drawer-ship${sub >= FREE_SHIP_MIN ? ' done' : ''}`}>
				<span>{shipNudge(box)}</span>
				<span className='ship-track'>
					<i style={{ width: Math.min(100, (sub / FREE_SHIP_MIN) * 100) + '%' }} />
				</span>
			</div>

			<div className='dlg-body drawer-body'>
				{box.length ? (
					box.map((i, idx) => {
						if (isCombo(i))
							return (
								<div className='ci-row' key={idx}>
									<img src={itemImg(i)} alt='' />
									<div className='ci-main'>
										<div className='ci-top'>
											<h4>{itemName(i)}</h4>
											<button className='ci-rm' type='button' aria-label={`Remove ${itemName(i)}`} onClick={() => removeAt(idx)}>
												×
											</button>
										</div>
										<div className='ci-sub'>{itemSub(i)}</div>
										<div className='ci-bottom'>
											<span />
											<b className='ci-amt'>{inr(itemPrice(i))}</b>
										</div>
									</div>
								</div>
							)
						const p = byId(i.pid)
						const key = `${i.pid}|${i.variant}|${i.flavour}`
						return (
							<div className='ci-row' key={key}>
								<button className='ci-img' type='button' aria-label={`Details of ${p.name}`} onClick={() => openProduct(p.id)}>
									<img src={pimg(p)} alt='' />
								</button>
								<div className='ci-main'>
									<div className='ci-top'>
										<div>
											<h4>{p.name}</h4>
											<div className='ci-sub'>{p.pack}</div>
										</div>
										<button className='ci-rm' type='button' aria-label={`Remove ${p.name}`} onClick={() => removeAt(idx)}>
											×
										</button>
									</div>
									{p.variants && <OptionChips id={`${key}-v`} label={p.variantLabel || 'Option'} options={p.variants} value={i.variant ?? ''} onChange={(v) => updateAt(idx, { variant: v })} />}
									<OptionChips id={`${key}-f`} label={p.flavourLabel || 'Flavour'} options={p.flavours} value={i.flavour} onChange={(f) => updateAt(idx, { flavour: f })} />
									<div className='ci-bottom'>
										<div className='qty qty-sm'>
											<button type='button' aria-label='One less' disabled={i.qty <= 1} onClick={() => updateAt(idx, { qty: i.qty - 1 })}>
												−
											</button>
											<output aria-live='polite'>{i.qty}</output>
											<button type='button' aria-label='One more' disabled={i.qty >= MAX_PER_ITEM} onClick={() => updateAt(idx, { qty: i.qty + 1 })}>
												+
											</button>
										</div>
										<b className='ci-amt'>{inr(itemPrice(i))}</b>
									</div>
								</div>
							</div>
						)
					})
				) : (
					<div className='empty'>
						<p>Your cart is empty.</p>
						<p>Pick a category to add your first sample.</p>
					</div>
				)}

				{box.length > 0 && (
					<div className='drawer-summary'>
						<div className='totals'>
							<div>
								<span>Samples</span>
								<span>{inr(sub)}</span>
							</div>
							<div>
								<span>Shipping</span>
								<span>{shippingOf(box) ? inr(shippingOf(box)) : 'Free'}</span>
							</div>
							<div className='grand'>
								<span>Total (incl. GST)</span>
								<span>{inr(grandTotalOf(box))}</span>
							</div>
						</div>
						<button
							className='btn btn-primary btn-block'
							type='button'
							onClick={() => {
								closeDrawer()
								openCheckout(1)
							}}>
							Checkout
						</button>
						<button className='btn btn-ghost btn-block' type='button' data-close>
							Continue shopping
						</button>
					</div>
				)}

				{related.length > 0 && (
					<div className='related'>
						<h4>You may also like</h4>
						<div className='related-grid'>
							{related.map((p) => (
								<div className='rel-card' key={p.id}>
									<button className='rel-img' type='button' aria-label={`Details of ${p.name}`} onClick={() => openProduct(p.id)}>
										<img src={pimg(p)} alt='' loading='lazy' />
									</button>
									<b className='rel-name'>{p.name}</b>
									<span className='rel-meta'>
										{p.flavours.length > 1 ? `${p.flavours.length} ${(p.flavourLabel || 'flavour').toLowerCase()}s` : p.flavours[0]}
									</span>
									<span className='rel-price'>{inr(p.price)}</span>
									<button className='btn btn-ghost rel-add' type='button' aria-label={`Add ${p.name} to cart`} onClick={() => quickAdd(p.id)}>
										+ Add
									</button>
								</div>
							))}
						</div>
					</div>
				)}
			</div>
		</Dialog>
	)
}
