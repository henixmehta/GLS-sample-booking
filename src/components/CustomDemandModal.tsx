import { useState, useRef, type ChangeEvent, type DragEvent } from 'react'
import { CATEGORIES } from '../data/catalog'
import { uploadCustomAttachment } from '../lib/api'
import { compressImage, formatBytes, type CompressionResult } from '../lib/compressImage'
import { inr, rand } from '../lib/helpers'
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

export default function CustomDemandModal() {
	const { customModalOpen, setCustomModalOpen, addCustom, toast } = useShop()

	const [name, setName] = useState('')
	const [category, setCategory] = useState(CATEGORIES[0]?.name || 'Whey Protein')
	const [flavour, setFlavour] = useState('')
	const [pack, setPack] = useState('50 g Sample Pouch')
	const [notes, setNotes] = useState('')

	// Attachment state
	const [selectedFile, setSelectedFile] = useState<File | null>(null)
	const [previewUrl, setPreviewUrl] = useState<string>('')
	const [originalSize, setOriginalSize] = useState<number>(0)
	const [compressedSize, setCompressedSize] = useState<number>(0)
	const [isCompressing, setIsCompressing] = useState<boolean>(false)
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
	const [isDragging, setIsDragging] = useState<boolean>(false)
	const [err, setErr] = useState<string>('')

	const fileInputRef = useRef<HTMLInputElement>(null)

	const resetForm = () => {
		setName('')
		setCategory(CATEGORIES[0]?.name || 'Whey Protein')
		setFlavour('')
		setPack('50 g Sample Pouch')
		setNotes('')
		setSelectedFile(null)
		setPreviewUrl('')
		setOriginalSize(0)
		setCompressedSize(0)
		setIsCompressing(false)
		setIsSubmitting(false)
		setErr('')
	}

	const handleClose = () => {
		setCustomModalOpen(false)
		resetForm()
	}

	const processFile = async (file: File) => {
		if (!file) return
		setIsCompressing(true)
		setErr('')
		try {
			const res: CompressionResult = await compressImage(file, 1600, 0.82)
			setSelectedFile(res.file)
			setPreviewUrl(res.previewUrl)
			setOriginalSize(res.originalSize)
			setCompressedSize(res.compressedSize)
		} catch (e) {
			console.error('Compression error:', e)
			setSelectedFile(file)
			setPreviewUrl(URL.createObjectURL(file))
			setOriginalSize(file.size)
			setCompressedSize(file.size)
		} finally {
			setIsCompressing(false)
		}
	}

	const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (file) processFile(file)
	}

	const handleDrop = (e: DragEvent<HTMLDivElement>) => {
		e.preventDefault()
		setIsDragging(false)
		const file = e.dataTransfer.files?.[0]
		if (file) processFile(file)
	}

	const handleRemoveImage = () => {
		setSelectedFile(null)
		setPreviewUrl('')
		setOriginalSize(0)
		setCompressedSize(0)
		if (fileInputRef.current) fileInputRef.current.value = ''
	}

	const handleSubmit = async () => {
		const cleanName = name.trim()
		if (!cleanName) {
			setErr('Please enter a product name or target description.')
			return
		}

		setIsSubmitting(true)
		setErr('')

		try {
			let attachmentUrl = ''
			if (selectedFile) {
				try {
					attachmentUrl = await uploadCustomAttachment(selectedFile, selectedFile.name)
				} catch (uploadErr: any) {
					console.warn('Attachment upload failed, proceeding with local reference:', uploadErr)
					attachmentUrl = previewUrl // fallback preview
				}
			}

			addCustom({
				kind: 'custom',
				customId: rand(8),
				name: cleanName,
				category: category.trim(),
				flavour: flavour.trim() || 'Custom Formulation',
				pack: pack.trim() || '50 g Sample Pouch',
				notes: notes.trim(),
				attachment: attachmentUrl,
				previewUrl: previewUrl,
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

	const savingsPercent =
		originalSize > 0 && compressedSize > 0 && originalSize > compressedSize
			? Math.round(((originalSize - compressedSize) / originalSize) * 100)
			: 0

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
							color: '#16a34a',
							background: '#f0fdf4',
							border: '1px solid #bbf7d0',
							padding: '3px 9px',
							borderRadius: '999px',
							marginBottom: '4px',
						}}
					>
						✨ Custom Formulation & Demand
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
					{/* Attachment Upload Card */}
					<div
						style={{
							background: 'var(--surface-2)',
							border: '1.5px dashed ' + (isDragging ? 'var(--lime-deep)' : 'var(--line)'),
							borderRadius: '14px',
							padding: '14px 16px',
							transition: 'all 0.15s ease',
						}}
						onDragOver={(e) => {
							e.preventDefault()
							setIsDragging(true)
						}}
						onDragLeave={() => setIsDragging(false)}
						onDrop={handleDrop}
					>
						<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
							<label style={{ fontSize: '12.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--ink-soft)' }}>
								Reference Image / Packaging Photo
							</label>
							<span style={{ fontSize: '11px', color: 'var(--ink-soft)' }}>Auto-compressed (PNG, JPG, WEBP, etc.)</span>
						</div>

						{previewUrl ? (
							<div style={{ display: 'flex', alignItems: 'center', gap: '14px', background: '#fff', padding: '10px', borderRadius: '10px', border: '1px solid var(--line)' }}>
								<div style={{ width: '64px', height: '64px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, background: '#f8fafc', display: 'grid', placeItems: 'center' }}>
									<img src={previewUrl} alt='Reference preview' style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
								</div>
								<div style={{ flex: 1, minWidth: 0 }}>
									<div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
										{selectedFile?.name || 'Uploaded photo'}
									</div>
									<div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px', flexWrap: 'wrap' }}>
										<span style={{ fontSize: '11.5px', color: 'var(--ink-soft)' }}>
											{formatBytes(originalSize)} → <b>{formatBytes(compressedSize)}</b>
										</span>
										{savingsPercent > 0 && (
											<span style={{ fontSize: '10px', fontWeight: 800, background: '#dcfce7', color: '#15803d', padding: '1px 6px', borderRadius: '4px' }}>
												-{savingsPercent}% Auto-Compressed
											</span>
										)}
									</div>
								</div>
								<button
									type='button'
									onClick={handleRemoveImage}
									style={{
										border: 'none',
										background: '#fee2e2',
										color: '#b91c1c',
										borderRadius: '8px',
										padding: '6px 12px',
										fontSize: '12px',
										fontWeight: 700,
										cursor: 'pointer',
									}}
								>
									Remove
								</button>
							</div>
						) : (
							<div
								onClick={() => fileInputRef.current?.click()}
								style={{
									cursor: 'pointer',
									textAlign: 'center',
									padding: '16px 12px',
									background: '#fff',
									borderRadius: '10px',
									border: '1px solid var(--line)',
									display: 'flex',
									flexDirection: 'column',
									alignItems: 'center',
									gap: '6px',
								}}
							>
								<svg width='32' height='32' viewBox='0 0 24 24' fill='none' stroke='var(--lime-deep)' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round'>
									<rect x='3' y='3' width='18' height='18' rx='2' ry='2' />
									<circle cx='8.5' cy='8.5' r='1.5' />
									<polyline points='21 15 16 10 5 21' />
								</svg>
								<div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ink)' }}>
									{isCompressing ? 'Compressing image...' : 'Click or drag reference image here'}
								</div>
								<div style={{ fontSize: '11.5px', color: 'var(--ink-soft)' }}>
									Supports any format (JPG, PNG, WEBP, HEIC) • Automatically optimized for instant loading
								</div>
							</div>
						)}

						<input
							ref={fileInputRef}
							type='file'
							accept='image/*'
							style={{ display: 'none' }}
							onChange={handleFileChange}
						/>
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

					{/* Category */}
					<div>
						<label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--ink-soft)', marginBottom: '5px' }}>
							Product Category
						</label>
						<select
							value={category}
							onChange={(e) => setCategory(e.target.value)}
							style={{ width: '100%', cursor: 'pointer' }}
						>
							{CATEGORIES.map((cat) => (
								<option key={cat.id} value={cat.name}>
									{cat.name}
								</option>
							))}
							<option value='Speciality / Innovative Formulation'>Other / Innovative Formulation</option>
						</select>
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
						disabled={isSubmitting || isCompressing}
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

