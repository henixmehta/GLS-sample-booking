import { useState, useRef, type ChangeEvent, type DragEvent } from 'react'
import { CATEGORIES } from '../data/catalog'
import { uploadCustomAttachment } from '../lib/api'
import { compressImage, formatBytes, type CompressionResult } from '../lib/compressImage'
import { customBeakerSvg, inr, rand } from '../lib/helpers'
import Dialog, { CloseX } from './Dialog'
import { useShop } from './ShopContext'

const FLAVOUR_SUGGESTIONS = [
	'Belgian Chocolate',
	'Alphonso Mango',
	'Vanilla Bean',
	'Strawberry Cream',
	'Cafe Mocha',
	'Watermelon Mint',
	'Cookies & Cream',
	'Unflavoured / Raw',
]

const PACK_SUGGESTIONS = [
	'50 g Sample Pouch',
	'100 g Tub / Jar',
	'Single-serve Sachet (5–10 g)',
	'250 g Trial Pack',
]

interface UploadedPhoto {
	file: File
	previewUrl: string
	originalSize: number
	compressedSize: number
}

export default function CustomDemandModal() {
	const { customModalOpen, setCustomModalOpen, addCustom, toast } = useShop()

	const [name, setName] = useState('')
	const [category, setCategory] = useState(CATEGORIES[0]?.name || 'Whey Protein')
	const [customCategoryName, setCustomCategoryName] = useState('')
	const [flavour, setFlavour] = useState('')
	const [pack, setPack] = useState('50 g Sample Pouch')
	const [notes, setNotes] = useState('')

	// Attachment 1: Packaging Reference (Front & Back) - max 2 photos, non-mandatory
	const [packagingPhotos, setPackagingPhotos] = useState<UploadedPhoto[]>([])
	const [isCompPackaging, setIsCompPackaging] = useState<boolean>(false)
	const [isDragPackaging, setIsDragPackaging] = useState<boolean>(false)
	const packagingInputRef = useRef<HTMLInputElement>(null)

	// Attachment 2: Ingredients / Formulation Reference - max 2 photos, non-mandatory
	const [ingredientsPhotos, setIngredientsPhotos] = useState<UploadedPhoto[]>([])
	const [isCompIngredients, setIsCompIngredients] = useState<boolean>(false)
	const [isDragIngredients, setIsDragIngredients] = useState<boolean>(false)
	const ingredientsInputRef = useRef<HTMLInputElement>(null)

	const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
	const [err, setErr] = useState<string>('')

	const resetForm = () => {
		setName('')
		setCategory(CATEGORIES[0]?.name || 'Whey Protein')
		setCustomCategoryName('')
		setFlavour('')
		setPack('50 g Sample Pouch')
		setNotes('')

		setPackagingPhotos([])
		setIsCompPackaging(false)
		setIsDragPackaging(false)
		if (packagingInputRef.current) packagingInputRef.current.value = ''

		setIngredientsPhotos([])
		setIsCompIngredients(false)
		setIsDragIngredients(false)
		if (ingredientsInputRef.current) ingredientsInputRef.current.value = ''

		setIsSubmitting(false)
		setErr('')
	}

	const handleClose = () => {
		setCustomModalOpen(false)
		resetForm()
	}

	const processFiles = async (files: FileList | File[], type: 'pkg' | 'ing') => {
		if (!files || files.length === 0) return
		const currentList = type === 'pkg' ? packagingPhotos : ingredientsPhotos
		const availableSlots = 2 - currentList.length
		if (availableSlots <= 0) return

		const filesToProcess = Array.from(files).slice(0, availableSlots)
		if (type === 'pkg') setIsCompPackaging(true)
		else setIsCompIngredients(true)
		setErr('')

		try {
			const processed: UploadedPhoto[] = []
			for (const f of filesToProcess) {
				try {
					const res: CompressionResult = await compressImage(f, 1600, 0.82)
					processed.push({
						file: res.file,
						previewUrl: res.previewUrl,
						originalSize: res.originalSize,
						compressedSize: res.compressedSize,
					})
				} catch (e) {
					console.error('Compression error:', e)
					processed.push({
						file: f,
						previewUrl: URL.createObjectURL(f),
						originalSize: f.size,
						compressedSize: f.size,
					})
				}
			}

			if (type === 'pkg') {
				setPackagingPhotos((prev) => [...prev, ...processed].slice(0, 2))
			} else {
				setIngredientsPhotos((prev) => [...prev, ...processed].slice(0, 2))
			}
		} finally {
			if (type === 'pkg') setIsCompPackaging(false)
			else setIsCompIngredients(false)
		}
	}

	const removePackagingPhoto = (idx: number) => {
		setPackagingPhotos((prev) => prev.filter((_, i) => i !== idx))
		if (packagingInputRef.current) packagingInputRef.current.value = ''
	}

	const removeIngredientsPhoto = (idx: number) => {
		setIngredientsPhotos((prev) => prev.filter((_, i) => i !== idx))
		if (ingredientsInputRef.current) ingredientsInputRef.current.value = ''
	}

	const handleSubmit = async () => {
		const cleanName = name.trim()
		if (!cleanName) {
			setErr('Please enter a product name or target description.')
			return
		}

		if (category === 'Other / Innovative Formulation' && !customCategoryName.trim()) {
			setErr('Please specify your custom category / innovative formulation.')
			return
		}

		setIsSubmitting(true)
		setErr('')

		try {
			// Upload packaging photos (up to 2, if any attached)
			const pkgUrls: string[] = []
			for (const p of packagingPhotos) {
				try {
					const url = await uploadCustomAttachment(p.file, p.file.name)
					if (url) pkgUrls.push(url)
				} catch (uploadErr: any) {
					console.warn('Packaging upload failed, proceeding with local reference:', uploadErr)
					pkgUrls.push(p.previewUrl)
				}
			}

			// Upload ingredients photos (up to 2, if any attached)
			const ingUrls: string[] = []
			for (const p of ingredientsPhotos) {
				try {
					const url = await uploadCustomAttachment(p.file, p.file.name)
					if (url) ingUrls.push(url)
				} catch (uploadErr: any) {
					console.warn('Ingredients upload failed, proceeding with local reference:', uploadErr)
					ingUrls.push(p.previewUrl)
				}
			}

			const finalCategory = category === 'Other / Innovative Formulation' ? customCategoryName.trim() : category.trim()

			addCustom({
				kind: 'custom',
				customId: rand(8),
				name: cleanName,
				category: finalCategory,
				customCategory: category === 'Other / Innovative Formulation' ? customCategoryName.trim() : undefined,
				flavour: flavour.trim() || 'Custom Formulation',
				pack: pack.trim() || '50 g Sample Pouch',
				notes: notes.trim(),
				attachment: pkgUrls[0] || '',
				attachments: pkgUrls,
				ingredientsAttachment: ingUrls[0] || '',
				ingredientsAttachments: ingUrls,
				previewUrl: packagingPhotos[0]?.previewUrl || ingredientsPhotos[0]?.previewUrl || '',
				previewUrls: packagingPhotos.map((p) => p.previewUrl),
				ingredientsPreviewUrl: ingredientsPhotos[0]?.previewUrl || '',
				ingredientsPreviewUrls: ingredientsPhotos.map((p) => p.previewUrl),
				price: 249,
				qty: 1,
			})

			toast(`"${cleanName}" custom sample added to your cart!`)
			handleClose()
		} catch (e: any) {
			setErr(e?.message || 'Failed to add custom product. Please try again.')
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<Dialog
			open={customModalOpen}
			onClose={handleClose}
			labelledBy='customDemandTitle'
			className='custom-modal'
		>
			<div className='dlg-head' style={{ borderBottom: '1px solid var(--line)', padding: '16px 22px' }}>
				<div>
					<div
						style={{
							display: 'inline-flex',
							alignItems: 'center',
							gap: '6px',
							fontSize: '11px',
							fontWeight: 800,
							letterSpacing: '0.06em',
							textTransform: 'uppercase',
							color: 'var(--lime-deep)',
							background: 'var(--surface-2)',
							border: '1px solid var(--line)',
							padding: '3px 9px',
							borderRadius: '999px',
							marginBottom: '4px',
						}}
					>
						✨ Custom Formulation &amp; Demand
					</div>
					<h3 id='customDemandTitle' style={{ margin: 0, fontSize: '20px', fontWeight: 800 }}>
						Demand a Customised Product Sample
					</h3>
				</div>
				<CloseX />
			</div>

			<div className='dlg-body' style={{ maxHeight: '72vh', overflowY: 'auto', padding: '20px 22px' }}>
				<p style={{ margin: '0 0 16px', fontSize: '13.5px', color: 'var(--ink-soft)', lineHeight: 1.5 }}>
					Need a specific flavor, formulation, or reference standard not listed in our catalog? Fill in your
					specifications below and upload photos or target references. Our lab will prepare and dispatch your
					tailored sample for testing.
				</p>

				{err && (
					<div
						style={{
							background: '#fef2f2',
							border: '1px solid #fecaca',
							color: '#b91c1c',
							borderRadius: '10px',
							padding: '10px 14px',
							fontSize: '13px',
							fontWeight: 600,
							marginBottom: '16px',
						}}
					>
						{err}
					</div>
				)}

				<div style={{ display: 'grid', gap: '16px' }}>
					{/* Dual Attachment Sections in the Same Line with Divider (Max 2 photos each, non-mandatory) */}
					<div className='custom-att-grid'>
						{/* Left Section: Packaging Front & Back Reference (max 2) */}
						<div className='custom-att-col'>
							<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
								<span className='custom-att-badge custom-att-badge-pkg'>
									📦 Front &amp; Back Reference
								</span>
								<span style={{ fontSize: '10px', color: 'var(--ink-soft)' }}>
									{packagingPhotos.length}/2 photos
								</span>
							</div>
							<div style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--ink)' }}>
								Packaging Reference Photos
							</div>
							<div style={{ fontSize: '11px', color: 'var(--ink-soft)', marginTop: '-4px' }}>
								Attach front &amp; back photos (optional, max 2)
							</div>

							{/* Display uploaded packaging photos */}
							{packagingPhotos.map((p, idx) => (
								<div
									key={idx}
									style={{
										display: 'flex',
										alignItems: 'center',
										gap: '8px',
										background: '#fff',
										padding: '6px 10px',
										borderRadius: '10px',
										border: '1px solid var(--line)',
									}}
								>
									<div
										style={{
											width: '44px',
											height: '44px',
											borderRadius: '6px',
											overflow: 'hidden',
											flexShrink: 0,
											background: '#f8fafc',
											display: 'grid',
											placeItems: 'center',
										}}
									>
										<img
											src={p.previewUrl}
											alt={`Packaging photo ${idx + 1}`}
											style={{ width: '100%', height: '100%', objectFit: 'contain' }}
											onError={(e) => {
												e.currentTarget.onerror = null
												e.currentTarget.src = customBeakerSvg
											}}
										/>
									</div>
									<div style={{ flex: 1, minWidth: 0 }}>
										<div
											style={{
												fontSize: '11.5px',
												fontWeight: 700,
												color: 'var(--ink)',
												whiteSpace: 'nowrap',
												overflow: 'hidden',
												textOverflow: 'ellipsis',
											}}
										>
											Photo {idx + 1}: {p.file.name}
										</div>
										<div style={{ fontSize: '10px', color: 'var(--ink-soft)' }}>
											{formatBytes(p.originalSize)} → <b>{formatBytes(p.compressedSize)}</b>
										</div>
									</div>
									<button
										type='button'
										onClick={() => removePackagingPhoto(idx)}
										style={{
											border: 'none',
											background: '#fee2e2',
											color: '#b91c1c',
											borderRadius: '6px',
											padding: '4px 8px',
											fontSize: '11px',
											fontWeight: 700,
											cursor: 'pointer',
										}}
									>
										Remove
									</button>
								</div>
							))}

							{/* Upload area or Add 2nd photo trigger if under limit */}
							{packagingPhotos.length === 0 ? (
								<div
									className={`custom-att-dropzone ${isDragPackaging ? 'dragging' : ''}`}
									onClick={() => packagingInputRef.current?.click()}
									onDragOver={(e: DragEvent<HTMLDivElement>) => {
										e.preventDefault()
										setIsDragPackaging(true)
									}}
									onDragLeave={() => setIsDragPackaging(false)}
									onDrop={(e: DragEvent<HTMLDivElement>) => {
										e.preventDefault()
										setIsDragPackaging(false)
										if (e.dataTransfer.files) processFiles(e.dataTransfer.files, 'pkg')
									}}
								>
									<svg
										width='26'
										height='26'
										viewBox='0 0 24 24'
										fill='none'
										stroke='var(--lime-deep)'
										strokeWidth='1.9'
										strokeLinecap='round'
										strokeLinejoin='round'
									>
										<path d='M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z' />
										<polyline points='3.27 6.96 12 12.01 20.73 6.96' />
										<line x1='12' y1='22.08' x2='12' y2='12' />
									</svg>
									<div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ink)', marginTop: '4px' }}>
										{isCompPackaging ? 'Compressing...' : 'Upload Front / Back Photo'}
									</div>
									<div style={{ fontSize: '10.5px', color: 'var(--ink-soft)' }}>
										Click or drag (up to 2 photos)
									</div>
								</div>
							) : packagingPhotos.length === 1 ? (
								<div
									className='custom-att-add-more'
									onClick={() => packagingInputRef.current?.click()}
								>
									<span>+ Add 2nd Packaging Photo (1/2 attached)</span>
								</div>
							) : (
								<div
									style={{
										fontSize: '11px',
										color: 'var(--forest)',
										fontWeight: 700,
										padding: '4px 8px',
										background: '#e5f2cf',
										borderRadius: '6px',
										textAlign: 'center',
									}}
								>
									✓ 2 of 2 photos attached
								</div>
							)}

							<input
								ref={packagingInputRef}
								type='file'
								accept='image/*'
								multiple
								style={{ display: 'none' }}
								onChange={(e: ChangeEvent<HTMLInputElement>) => {
									if (e.target.files) processFiles(e.target.files, 'pkg')
								}}
							/>
						</div>

						{/* Center Divider Line */}
						<div className='custom-att-divider' />

						{/* Right Section: Ingredients / Formulation Reference (max 2) */}
						<div className='custom-att-col'>
							<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
								<span className='custom-att-badge custom-att-badge-ing'>
									🧪 Ingredients Reference
								</span>
								<span style={{ fontSize: '10px', color: 'var(--ink-soft)' }}>
									{ingredientsPhotos.length}/2 photos
								</span>
							</div>
							<div style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--ink)' }}>
								Ingredients / Formula Photos
							</div>
							<div style={{ fontSize: '11px', color: 'var(--ink-soft)', marginTop: '-4px' }}>
								Ingredients label or table (optional, max 2)
							</div>

							{/* Display uploaded ingredients photos */}
							{ingredientsPhotos.map((p, idx) => (
								<div
									key={idx}
									style={{
										display: 'flex',
										alignItems: 'center',
										gap: '8px',
										background: '#fff',
										padding: '6px 10px',
										borderRadius: '10px',
										border: '1px solid var(--line)',
									}}
								>
									<div
										style={{
											width: '44px',
											height: '44px',
											borderRadius: '6px',
											overflow: 'hidden',
											flexShrink: 0,
											background: '#f8fafc',
											display: 'grid',
											placeItems: 'center',
										}}
									>
										<img
											src={p.previewUrl}
											alt={`Ingredients photo ${idx + 1}`}
											style={{ width: '100%', height: '100%', objectFit: 'contain' }}
											onError={(e) => {
												e.currentTarget.onerror = null
												e.currentTarget.src = customBeakerSvg
											}}
										/>
									</div>
									<div style={{ flex: 1, minWidth: 0 }}>
										<div
											style={{
												fontSize: '11.5px',
												fontWeight: 700,
												color: 'var(--ink)',
												whiteSpace: 'nowrap',
												overflow: 'hidden',
												textOverflow: 'ellipsis',
											}}
										>
											Photo {idx + 1}: {p.file.name}
										</div>
										<div style={{ fontSize: '10px', color: 'var(--ink-soft)' }}>
											{formatBytes(p.originalSize)} → <b>{formatBytes(p.compressedSize)}</b>
										</div>
									</div>
									<button
										type='button'
										onClick={() => removeIngredientsPhoto(idx)}
										style={{
											border: 'none',
											background: '#fee2e2',
											color: '#b91c1c',
											borderRadius: '6px',
											padding: '4px 8px',
											fontSize: '11px',
											fontWeight: 700,
											cursor: 'pointer',
										}}
									>
										Remove
									</button>
								</div>
							))}

							{/* Upload area or Add 2nd photo trigger if under limit */}
							{ingredientsPhotos.length === 0 ? (
								<div
									className={`custom-att-dropzone ${isDragIngredients ? 'dragging' : ''}`}
									onClick={() => ingredientsInputRef.current?.click()}
									onDragOver={(e: DragEvent<HTMLDivElement>) => {
										e.preventDefault()
										setIsDragIngredients(true)
									}}
									onDragLeave={() => setIsDragIngredients(false)}
									onDrop={(e: DragEvent<HTMLDivElement>) => {
										e.preventDefault()
										setIsDragIngredients(false)
										if (e.dataTransfer.files) processFiles(e.dataTransfer.files, 'ing')
									}}
								>
									<svg
										width='26'
										height='26'
										viewBox='0 0 24 24'
										fill='none'
										stroke='#0284c7'
										strokeWidth='1.9'
										strokeLinecap='round'
										strokeLinejoin='round'
									>
										<path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' />
										<polyline points='14 2 14 8 20 8' />
										<line x1='16' y1='13' x2='8' y2='13' />
										<line x1='16' y1='17' x2='8' y2='17' />
										<polyline points='10 9 9 9 8 9' />
									</svg>
									<div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ink)', marginTop: '4px' }}>
										{isCompIngredients ? 'Compressing...' : 'Upload Ingredients Photo'}
									</div>
									<div style={{ fontSize: '10.5px', color: 'var(--ink-soft)' }}>
										Click or drag (up to 2 photos)
									</div>
								</div>
							) : ingredientsPhotos.length === 1 ? (
								<div
									className='custom-att-add-more'
									onClick={() => ingredientsInputRef.current?.click()}
								>
									<span>+ Add 2nd Ingredients Photo (1/2 attached)</span>
								</div>
							) : (
								<div
									style={{
										fontSize: '11px',
										color: '#0369a1',
										fontWeight: 700,
										padding: '4px 8px',
										background: '#e0f2fe',
										borderRadius: '6px',
										textAlign: 'center',
									}}
								>
									✓ 2 of 2 photos attached
								</div>
							)}

							<input
								ref={ingredientsInputRef}
								type='file'
								accept='image/*'
								multiple
								style={{ display: 'none' }}
								onChange={(e: ChangeEvent<HTMLInputElement>) => {
									if (e.target.files) processFiles(e.target.files, 'ing')
								}}
							/>
						</div>
					</div>

					{/* Product Name */}
					<div>
						<label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--ink-soft)', marginBottom: '5px' }}>
							Product Name / Target Title <span style={{ color: 'var(--danger)' }}>*</span>
						</label>
						<input
							type='text'
							placeholder='e.g., Triple Chocolate Whey Isolate 90% or Electrolyte Hydration Mix'
							value={name}
							onChange={(e) => setName(e.target.value)}
							required
							style={{ width: '100%' }}
						/>
					</div>

					{/* Category with Other / Innovative Formulation option */}
					<div>
						<label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--ink-soft)', marginBottom: '5px' }}>
							Product Category
						</label>
						<select
							value={category}
							onChange={(e) => {
								const val = e.target.value
								setCategory(val)
								if (val !== 'Other / Innovative Formulation') {
									setCustomCategoryName('')
								}
							}}
							style={{ width: '100%', cursor: 'pointer' }}
						>
							{CATEGORIES.map((cat) => (
								<option key={cat.id} value={cat.name}>
									{cat.name}
								</option>
							))}
							<option value='Other / Innovative Formulation'>Other / Innovative Formulation</option>
						</select>

						{/* Mandatory custom category input when Other / Innovative Formulation is selected */}
						{category === 'Other / Innovative Formulation' && (
							<div style={{ marginTop: '10px' }}>
								<label style={{ display: 'block', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--lime-deep)', marginBottom: '4px' }}>
									Specify Category / Innovative Formulation <span style={{ color: 'var(--danger)' }}>*</span>
								</label>
								<input
									type='text'
									placeholder='e.g., Effervescent Pre-Workout Tabs, Collagen Gummies, Plant Pea Protein...'
									value={customCategoryName}
									onChange={(e) => setCustomCategoryName(e.target.value)}
									required
									autoFocus
									style={{ width: '100%', border: '1.5px solid var(--lime-deep)' }}
								/>
								<div style={{ fontSize: '11px', color: 'var(--ink-soft)', marginTop: '4px' }}>
									* Mandatory: Specify the innovative formulation type or category for our lab team.
								</div>
							</div>
						)}
					</div>

					{/* Desired Flavour & Quick Pills */}
					<div>
						<label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--ink-soft)', marginBottom: '5px' }}>
							Desired Flavour / Taste Profile
						</label>
						<input
							type='text'
							placeholder='e.g., Belgian Chocolate, Alphonso Mango, Raw Unflavoured, etc.'
							value={flavour}
							onChange={(e) => setFlavour(e.target.value)}
							style={{ width: '100%', marginBottom: '8px' }}
						/>
						<div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
							{FLAVOUR_SUGGESTIONS.map((f) => (
								<button
									key={f}
									type='button'
									onClick={() => setFlavour(f)}
									style={{
										border: '1px solid ' + (flavour === f ? 'var(--lime-deep)' : 'var(--line)'),
										background: flavour === f ? 'var(--surface-2)' : '#fff',
										color: flavour === f ? 'var(--lime-deep)' : 'var(--ink)',
										fontSize: '11.5px',
										fontWeight: 600,
										borderRadius: '999px',
										padding: '4px 10px',
										cursor: 'pointer',
										transition: 'all 0.15s ease',
									}}
								>
									{f}
								</button>
							))}
						</div>
					</div>

					{/* Preferred Pack Size & Quick Pills */}
					<div>
						<label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--ink-soft)', marginBottom: '5px' }}>
							Preferred Pack / Sample Size
						</label>
						<input
							type='text'
							placeholder='e.g., 50 g Sample Pouch, 100 g Tub, etc.'
							value={pack}
							onChange={(e) => setPack(e.target.value)}
							style={{ width: '100%', marginBottom: '8px' }}
						/>
						<div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
							{PACK_SUGGESTIONS.map((p) => (
								<button
									key={p}
									type='button'
									onClick={() => setPack(p)}
									style={{
										border: '1px solid ' + (pack === p ? 'var(--lime-deep)' : 'var(--line)'),
										background: pack === p ? 'var(--surface-2)' : '#fff',
										color: pack === p ? 'var(--lime-deep)' : 'var(--ink)',
										fontSize: '11.5px',
										fontWeight: 600,
										borderRadius: '999px',
										padding: '4px 10px',
										cursor: 'pointer',
										transition: 'all 0.15s ease',
									}}
								>
									{p}
								</button>
							))}
						</div>
					</div>

					{/* Formulation Specs / Remarks */}
					<div>
						<label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--ink-soft)', marginBottom: '5px' }}>
							Target Formulation / Specifications / Special Demands
						</label>
						<textarea
							rows={3}
							placeholder='Describe required ingredients, target protein % per serving, sweetening preferences (e.g. Stevia only), dissolution texture, or reference benchmark brands...'
							value={notes}
							onChange={(e) => setNotes(e.target.value)}
							style={{ width: '100%', minHeight: '80px' }}
						/>
					</div>
				</div>
			</div>

			<div className='dlg-foot custom-modal-foot'>
				<div className='custom-modal-foot-meta'>
					<div className='custom-modal-foot-price'>
						<span>Price:</span>
						<b>{inr(249)}</b>
					</div>
					<div className='custom-modal-foot-sub'>
						Standard sample rate • Free shipping over {inr(499)}
					</div>
				</div>

				<div className='custom-modal-foot-actions'>
					<button
						type='button'
						className='btn btn-ghost'
						onClick={handleClose}
						disabled={isSubmitting}
					>
						Cancel
					</button>
					<button
						type='button'
						className='btn btn-primary'
						onClick={handleSubmit}
						disabled={isSubmitting || isCompPackaging || isCompIngredients}
					>
						{isSubmitting ? (
							<span>Adding...</span>
						) : (
							<>
								<span className='custom-btn-desktop'>Add Custom Sample — {inr(249)}</span>
								<span className='custom-btn-mobile'>Add Sample — {inr(249)}</span>
							</>
						)}
					</button>
				</div>
			</div>
		</Dialog>
	)
}
