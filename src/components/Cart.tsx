import { useCart } from '../context/CartContext'
import { useNavigate } from 'react-router-dom'

export function Cart() {
  const { cart, removeFromCart, updateQuantity, getTotalPrice, clearCart } = useCart()
  const navigate = useNavigate()

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
        <p className="text-lg font-semibold text-slate-900 dark:text-slate-50">Your cart is empty</p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Add items from Resources or Marketplace</p>
      </div>
    )
  }

  const totalPrice = getTotalPrice()

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Shopping Cart</h2>

      <div className="space-y-3">
        {cart.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800/50"
          >
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-slate-900 dark:text-slate-50 truncate">
                {item.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {item.course} • {item.category} • Seller: {item.owner}
              </p>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                ₹{item.price} each
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 border border-slate-200 rounded-lg dark:border-slate-600">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="px-2 py-1 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
                >
                  -
                </button>
                <span className="w-6 text-center font-semibold text-slate-900 dark:text-slate-50">
                  {item.quantity}
                </span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="px-2 py-1 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
                >
                  +
                </button>
              </div>

              <div className="text-right min-w-[80px]">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                  ₹{item.price * item.quantity}
                </p>
              </div>

              <button
                onClick={() => removeFromCart(item.id)}
                className="px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg dark:text-red-400 dark:hover:bg-red-900/20"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg font-semibold text-slate-900 dark:text-slate-50">
            Total Amount:
          </span>
          <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            ₹{totalPrice}
          </span>
        </div>

        <div className="space-y-2">
          <button
            onClick={() => navigate('/checkout')}
            className="w-full px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Proceed to Checkout
          </button>
          <button
            onClick={clearCart}
            className="w-full px-4 py-2 text-sm font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            Clear Cart
          </button>
        </div>
      </div>
    </div>
  )
}
