import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './style.css'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { ThemeProvider } from './context/ThemeContext'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <ThemeProvider>
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  </ThemeProvider>,
)

