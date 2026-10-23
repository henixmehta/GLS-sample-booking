import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { defaultSel, isValidItem, mergeSel, updateItem, type CartItem, type Selection } from '../lib/helpers'

interface Shop {
	box: CartItem[]
	addSel: (sel: Selection) => void
	quickAdd: (pid: string) => void
	updateAt: (idx: number, patch: Partial<Selection>) => void
	drawerOpen: boolean
	openDrawer: () => void
	closeDrawer: () => void
	addCombo: (item: CartItem) => void
	removeAt: (idx: number) => void
	clearBox: () => void
	toast: (msg: string) => void
	toastMsg: string
	toastShown: boolean
	productId: string | null
	openProduct: (id: string) => void
	closeProduct: () => void
	comboOpen: boolean
	setComboOpen: (v: boolean) => void
	checkout: { open: boolean; step: number; nonce: number }
	openCheckout: (step: number) => void
	closeCheckout: () => void
	termsOpen: boolean
	setTermsOpen: (v: boolean) => void
}

const ShopCtx = createContext<Shop>(null!)
export const useShop = () => useContext(ShopCtx)

function loadBox(): CartItem[] {
	try {
		return (JSON.parse(localStorage.getItem('gls_box') || '[]') as CartItem[]).filter(isValidItem)
	} catch {
		return []
	}
}

export function ShopProvider({ children }: { children: ReactNode }) {
	const [box, setBox] = useState<CartItem[]>(loadBox)
	const [toastMsg, setToastMsg] = useState('')
	const [toastShown, setToastShown] = useState(false)
	const toastTimer = useRef<number>()
	const [productId, setProductId] = useState<string | null>(null)
	const [comboOpen, setComboOpen] = useState(false)
	const [checkout, setCheckout] = useState({ open: false, step: 0, nonce: 0 })
	const [termsOpen, setTermsOpen] = useState(false)
	const [drawerOpen, setDrawerOpen] = useState(false)

	useEffect(() => {
		try {
			localStorage.setItem('gls_box', JSON.stringify(box))
		} catch {
			/* storage unavailable */
		}
	}, [box])

	const toast = useCallback((msg: string) => {
		setToastMsg(msg)
		setToastShown(true)
		clearTimeout(toastTimer.current)
		toastTimer.current = window.setTimeout(() => setToastShown(false), 4200)
	}, [])

	const addSel = useCallback((sel: Selection) => setBox((b) => mergeSel(b, sel)), [])

	const value = useMemo<Shop>(
		() => ({
			box,
			addSel,
			quickAdd: (pid) => {
				addSel(defaultSel(pid))
				setDrawerOpen(true)
			},
			updateAt: (idx, patch) => setBox((b) => updateItem(b, idx, patch)),
			drawerOpen,
			openDrawer: () => setDrawerOpen(true),
			closeDrawer: () => setDrawerOpen(false),
			addCombo: (item) => setBox((b) => [...b, item]),
			removeAt: (idx) => setBox((b) => b.filter((_, k) => k !== idx)),
			clearBox: () => setBox([]),
			toast,
			toastMsg,
			toastShown,
			productId,
			openProduct: setProductId,
			closeProduct: () => setProductId(null),
			comboOpen,
			setComboOpen,
			checkout,
			openCheckout: (step) => setCheckout((c) => ({ open: true, step, nonce: c.nonce + 1 })),
			closeCheckout: () => setCheckout((c) => ({ ...c, open: false })),
			termsOpen,
			setTermsOpen,
		}),
		[box, addSel, drawerOpen, toast, toastMsg, toastShown, productId, comboOpen, checkout, termsOpen]
	)
	return <ShopCtx.Provider value={value}>{children}</ShopCtx.Provider>
}

export function Toast() {
	const { toastMsg, toastShown } = useShop()
	return (
		<div className={`toast${toastShown ? ' show' : ''}`} role='status' aria-live='polite'>
			{toastMsg}
		</div>
	)
}
