import { useEffect, useRef, type ReactNode } from 'react'

/* Native <dialog> shown with showModal(). Clicking the backdrop or any [data-close] element closes it. */
export default function Dialog({ open, onClose, labelledBy, className, children }: { open: boolean; onClose: () => void; labelledBy: string; className?: string; children: ReactNode }) {
	const ref = useRef<HTMLDialogElement>(null)
	useEffect(() => {
		const d = ref.current!
		if (open && !d.open) d.showModal()
		if (!open && d.open) d.close()
	}, [open])
	return (
		<dialog
			ref={ref}
			className={className}
			aria-labelledby={labelledBy}
			onClose={onClose}
			onClick={(e) => {
				if (e.target === ref.current || (e.target as HTMLElement).closest('[data-close]')) onClose()
			}}>
			<div className='dlg'>{children}</div>
		</dialog>
	)
}

export const CloseX = () => (
	<button className='x' data-close aria-label='Close' type='button'>
		×
	</button>
)

export const Tick = () => (
	<div className='tick'>
		<svg viewBox='0 0 40 40' aria-hidden='true'>
			<path d='M10 21l7 7 14-15' />
		</svg>
	</div>
)
