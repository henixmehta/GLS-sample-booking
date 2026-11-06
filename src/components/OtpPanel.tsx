import { useEffect, useRef, useState, type ClipboardEvent, type KeyboardEvent, type ReactNode } from 'react'
import { verifyOtp } from '../lib/api'

export interface OtpSession { verification_id: string; otp?: string }

/* Reusable OTP UI. Renders the dialog body and footer; the parent places them in its dialog.
   `devOtp` is only returned by the API in development and fills the "Preview mode" box. */
export default function OtpPanel({
	mobile,
	email,
	session,
	onBack,
	onOk,
	onResend,
	children,
}: {
	mobile: string
	email?: string
	session: OtpSession
	onBack: () => void
	onOk: () => Promise<void> | void
	onResend: () => Promise<void>
	children: (body: ReactNode, foot: ReactNode) => ReactNode
}) {
	const [digits, setDigits] = useState<string[]>(Array(6).fill(''))
	const [err, setErr] = useState('')
	const [left, setLeft] = useState(30)
	const [busy, setBusy] = useState(false)
	const boxes = useRef<(HTMLInputElement | null)[]>([])
	const verified = useRef('')

	useEffect(() => {
		setDigits(Array(6).fill(''))
		setErr('')
		setLeft(30)
		boxes.current[0]?.focus()
	}, [session.verification_id])

	useEffect(() => {
		if (left <= 0) return
		const t = setTimeout(() => setLeft((l) => l - 1), 1000)
		return () => clearTimeout(t)
	}, [left])

	const setAt = (i: number, v: string) => setDigits((d) => d.map((x, j) => (j === i ? v : x)))

	async function verify() {
		const code = digits.join('')
		if (code.length < 6) return setErr('Enter all 6 digits.')
		setBusy(true)
		try {
			if (verified.current !== session.verification_id) await verifyOtp(session.verification_id, code)
			verified.current = session.verification_id
		} catch {
			setBusy(false)
			setErr('That code doesn’t match. Check the digits or resend a new code.')
			setDigits(Array(6).fill(''))
			boxes.current[0]?.focus()
			return
		}
		try {
			await onOk()
		} catch (ex: any) {
			setErr(ex.message)
		} finally {
			setBusy(false)
		}
	}

	const onKey = (i: number) => (e: KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Backspace' && !digits[i] && i > 0) boxes.current[i - 1]?.focus()
		if (e.key === 'Enter') verify()
	}
	const onPaste = (e: ClipboardEvent<HTMLInputElement>) => {
		const t = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, 6)
		if (!t.length) return
		e.preventDefault()
		setDigits((d) => d.map((x, j) => t[j] ?? x))
		boxes.current[Math.min(t.length, 5)]?.focus()
	}

	const body = (
		<>
			<p style={{ textAlign: 'center' }}>
				Enter the 6-digit code sent to{' '}
				<b>
					{email || `+91 ${mobile.slice(0, 5)} ${mobile.slice(5)}`}
				</b>
			</p>
			<div className='otp-boxes' role='group' aria-label='One-time password'>
				{digits.map((d, i) => (
					<input
						key={i}
						ref={(el) => (boxes.current[i] = el)}
						inputMode='numeric'
						maxLength={1}
						aria-label={`Digit ${i + 1}`}
						autoComplete={i ? 'off' : 'one-time-code'}
						value={d}
						onChange={(e) => {
							const v = e.target.value.replace(/\D/g, '').slice(-1)
							setAt(i, v)
							if (v && i < 5) boxes.current[i + 1]?.focus()
						}}
						onKeyDown={onKey(i)}
						onPaste={onPaste}
					/>
				))}
			</div>
			{session.otp && (
				<div className='demo'>
					Preview mode: your OTP is <b>{session.otp}</b>. On the live site the code goes to your email and this box disappears.
				</div>
			)}
			<p className='err' role='alert' style={{ textAlign: 'center', marginTop: 10 }}>
				{err}
			</p>
			<p className='note' style={{ textAlign: 'center', marginTop: 8 }}>
				<span className='rs'>
					{left > 0 ? (
						`Resend code in ${left} s`
					) : (
						<a
							href='#'
							onClick={async (e) => {
								e.preventDefault()
								try {
									await onResend()
								} catch (ex: any) {
									setErr(ex.message)
								}
							}}>
							Resend code
						</a>
					)}
				</span>{' '}
				&nbsp;|&nbsp;{' '}
				<a
					href='#'
					onClick={(e) => {
						e.preventDefault()
						onBack()
					}}>
					Change details
				</a>
			</p>
		</>
	)
	const foot = (
		<button className='btn btn-primary btn-block' type='button' disabled={busy} onClick={verify}>
			{busy ? <span className='spinner' /> : null}
			Verify OTP
		</button>
	)
	return <>{children(body, foot)}</>
}
