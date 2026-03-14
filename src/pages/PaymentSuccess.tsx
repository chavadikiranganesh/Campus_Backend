import { useNavigate } from 'react-router-dom'

export function PaymentSuccess() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Payment Successful!</h1>
          <p className="text-slate-600">Your order has been placed successfully.</p>
        </div>

        <div className="mb-6">
          <div className="bg-slate-50 rounded-lg p-4">
            <h3 className="font-semibold text-slate-900 mb-2">Order Details</h3>
            <p className="text-sm text-slate-600">Order ID: #{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
            <p className="text-sm text-slate-600">Payment Method: Razorpay</p>
            <p className="text-sm text-slate-600">Estimated Delivery: 3-5 business days</p>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
          >
            Continue Shopping
          </button>
          <button
            onClick={() => navigate('/profile')}
            className="w-full bg-slate-200 text-slate-900 py-2 rounded-md hover:bg-slate-300"
          >
            View Order History
          </button>
        </div>
      </div>
    </div>
  )
}
