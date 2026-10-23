import Dialog, { CloseX } from './Dialog'
import { useShop } from './ShopContext'

export default function TermsDialog() {
	const { termsOpen, setTermsOpen } = useShop()
	return (
		<Dialog open={termsOpen} onClose={() => setTermsOpen(false)} labelledBy='tTitle'>
			<div className='dlg-head'>
				<h3 id='tTitle'>Sample order terms</h3>
				<CloseX />
			</div>
			<div className='dlg-body terms'>
				<ol>
					<li>Samples are for evaluation of taste, texture and quality only and may not be resold.</li>
					<li>Sample prices include GST. Shipping within India is free.</li>
					<li>Orders are dispatched within 2–4 working days of payment. Delivery time depends on your pincode and courier.</li>
					<li>Packaging and labels on samples are generic. Your logo, label design and final pack are made only after a bulk order is confirmed.</li>
					<li>Bulk production may vary slightly in colour and taste from the sample because of natural variation in raw materials.</li>
					<li>Sample payments are non-refundable once dispatched. If a pack arrives damaged, share a photo within 48 hours of delivery and we’ll replace it.</li>
					<li>Nutrition values shown are approximate. Final label values are confirmed by lab testing for your batch.</li>
					<li>Bulk orders start from 50–100 kg per product and are quoted separately.</li>
					<li>Your contact and address details are used only to process this order and contact you about it.</li>
				</ol>
			</div>
			<div className='dlg-foot'>
				<button className='btn btn-primary' data-close type='button'>
					Got it
				</button>
			</div>
		</Dialog>
	)
}
