// src/components/CardForm.jsx
import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

export default function CardForm({ userId, customerId }) {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      // 1) fetch client secret from your backend
      const resp = await fetch('/api/create-setup-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId }),
      });
      const { clientSecret } = await resp.json();

      // 2) confirm card setup
      const { setupIntent, error: confirmError } = await stripe.confirmCardSetup(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });

      if (confirmError) {
        setErrorMessage(confirmError.message || 'Payment method error');
      } else {
        // 3) persist default payment method
        await fetch('/api/set-default-payment-method', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            paymentMethodId: setupIntent.payment_method,
          }),
        });

        alert('🎉 Card saved successfully!');
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('Unexpected error, please try again');
    }

    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 p-4 bg-white rounded shadow">
      <CardElement options={{ hidePostalCode: true }} />
      {errorMessage && <p className="text-red-600 mt-2">{errorMessage}</p>}
      <button
        type="submit"
        disabled={!stripe || isSubmitting}
        className="mt-4 w-full bg-operon-blue text-white py-2 rounded disabled:opacity-50"
      >
        {isSubmitting ? 'Saving…' : 'Save Card'}
      </button>
    </form>
  );
}
