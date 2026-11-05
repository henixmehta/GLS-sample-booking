/**
 * Client-side image compression utility
 * Automatically scales down large photos (max 1600px) and compresses to lightweight JPEG (~100-300 KB)
 * Supports all common formats (PNG, JPG, JPEG, WEBP, GIF, BMP, HEIC/browsers).
 */

export interface CompressionResult {
	file: File
	previewUrl: string
	originalSize: number
	compressedSize: number
	width: number
	height: number
}

export async function compressImage(
	file: File,
	maxDimension = 1600,
	quality = 0.82
): Promise<CompressionResult> {
	return new Promise((resolve) => {
		// If not an image or SVG, return original
		if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') {
			const previewUrl = URL.createObjectURL(file)
			return resolve({
				file,
				previewUrl,
				originalSize: file.size,
				compressedSize: file.size,
				width: 0,
				height: 0,
			})
		}

		const objectUrl = URL.createObjectURL(file)
		const img = new Image()

		img.onload = () => {
			URL.revokeObjectURL(objectUrl)

			let { width, height } = img

			// Calculate scaled dimensions preserving aspect ratio
			if (width > maxDimension || height > maxDimension) {
				if (width > height) {
					height = Math.round((height * maxDimension) / width)
					width = maxDimension
				} else {
					width = Math.round((width * maxDimension) / height)
					height = maxDimension
				}
			}

			const canvas = document.createElement('canvas')
			canvas.width = width
			canvas.height = height

			const ctx = canvas.getContext('2d')
			if (!ctx) {
				// Canvas not supported, fallback to original
				return resolve({
					file,
					previewUrl: URL.createObjectURL(file),
					originalSize: file.size,
					compressedSize: file.size,
					width: img.width,
					height: img.height,
				})
			}

			// Fill white background for transparency (e.g. PNG to JPEG)
			ctx.fillStyle = '#ffffff'
			ctx.fillRect(0, 0, width, height)
			ctx.drawImage(img, 0, 0, width, height)

			canvas.toBlob(
				(blob) => {
					if (!blob) {
						return resolve({
							file,
							previewUrl: URL.createObjectURL(file),
							originalSize: file.size,
							compressedSize: file.size,
							width,
							height,
						})
					}

					const cleanName = file.name.replace(/\.[^/.]+$/, '') + '.jpg'
					const compressedFile = new File([blob], cleanName, {
						type: 'image/jpeg',
						lastModified: Date.now(),
					})

					let previewUrl = ''
					try {
						// Create a compact thumbnail data URL (max 280px) that survives localStorage and page reloads
						const thumbCanvas = document.createElement('canvas')
						const maxThumb = 280
						const scale = Math.min(1, maxThumb / Math.max(width, height))
						thumbCanvas.width = Math.max(1, Math.round(width * scale))
						thumbCanvas.height = Math.max(1, Math.round(height * scale))
						const tctx = thumbCanvas.getContext('2d')
						if (tctx) {
							tctx.fillStyle = '#ffffff'
							tctx.fillRect(0, 0, thumbCanvas.width, thumbCanvas.height)
							tctx.drawImage(canvas, 0, 0, thumbCanvas.width, thumbCanvas.height)
							previewUrl = thumbCanvas.toDataURL('image/jpeg', 0.8)
						}
					} catch {
						/* canvas fallback */
					}
					if (!previewUrl) {
						previewUrl = URL.createObjectURL(blob)
					}

					resolve({
						file: compressedFile,
						previewUrl,
						originalSize: file.size,
						compressedSize: blob.size,
						width,
						height,
					})
				},
				'image/jpeg',
				quality
			)
		}

		img.onerror = () => {
			URL.revokeObjectURL(objectUrl)
			// Return original if image load fails
			resolve({
				file,
				previewUrl: URL.createObjectURL(file),
				originalSize: file.size,
				compressedSize: file.size,
				width: 0,
				height: 0,
			})
		}

		img.src = objectUrl
	})
}

export function formatBytes(bytes: number, decimals = 1): string {
	if (bytes <= 0) return '0 B'
	const k = 1024
	const dm = decimals < 0 ? 0 : decimals
	const sizes = ['B', 'KB', 'MB', 'GB']
	const i = Math.floor(Math.log(bytes) / Math.log(k))
	return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

