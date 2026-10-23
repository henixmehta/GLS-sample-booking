import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ShopProvider } from './components/ShopContext'
import SampleBooking from './pages/SampleBooking'
import './styles.css'

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<BrowserRouter>
			<ShopProvider>
				<Routes>
					{/* Deployed on its own domain, so the page lives at the root */}
					<Route path='/' element={<SampleBooking />} />
					<Route path='*' element={<Navigate to={{ pathname: '/', hash: location.hash }} replace />} />
				</Routes>
			</ShopProvider>
		</BrowserRouter>
	</StrictMode>
)
