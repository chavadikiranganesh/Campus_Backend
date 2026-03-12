import { API_BASE } from '../api'

interface PaymentButtonProps {
  amount: number // Amount in rupees (will be converted to paise internally)
  description: string
  itemName: string
  userEmail?: string
  userName?: string
  onSuccess?: (paymentId: string) => void
  onFailure?: (error: string) => void
}

declare global {
  interface Window {
    Razorpay: any
  }
}

export const PaymentButton: React.FC<PaymentButtonProps> = ({
  amount,
  description,
  itemName,
  userEmail = 'student@campus-utility.com',
  userName = 'Campus Student',
  onSuccess,
  onFailure,
}) => {
  const handlePayment = async () => {
    try {
      // Step 1: Create order from backend
      const response = await fetch(`${API_BASE}/api/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount, // Amount in rupees
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create payment order')
      }

      const order = await response.json()

      // Step 2: Configure Razorpay options
      const options = {
        key: 'rzp_live_SQP0pFwwv3ZO6R', // Your Razorpay Key ID
        amount: order.amount, // Amount in paise
        currency: order.currency,
        name: 'Campus Utility',
        description: description,
        order_id: order.id,
        handler: (response: any) => {
          console.log('Payment successful:', response)
          if (onSuccess) {
            onSuccess(response.razorpay_payment_id)
          }
          alert(`Payment successful! Payment ID: ${response.razorpay_payment_id}`)
        },
        prefill: {
          name: userName,
          email: userEmail,
        },
        theme: {
          color: '#3399cc',
        },
        modal: {
          ondismiss: () => {
            if (onFailure) {
              onFailure('Payment cancelled by user')
            }
            alert('Payment cancelled')
          },
        },
      }

      // Step 3: Initialize and open Razorpay checkout
      const paymentObject = new window.Razorpay(options)
      paymentObject.open()
    } catch (error) {
      console.error('Payment error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Payment failed'
      if (onFailure) {
        onFailure(errorMessage)
      }
      alert(`Error: ${errorMessage}`)
    }
  }

  return (
    <button
      onClick={handlePayment}
      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
    >
      Pay ₹{amount} - {itemName}
    </button>
  )
}
