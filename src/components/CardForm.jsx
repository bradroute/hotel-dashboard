import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { motion, AnimatePresence } from 'framer-motion';

const formVariants = {
  initial: { opacity: 0, y: 24, scale: 0.97 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.24, ease: [0.4, 0, 0.2, 1] } },
  exit:    { opacity: 0, y: 10, scale: 0.97, transition: { duration: 0.16 } }
};
const errorVariants = {
  initial: { opacity: 0, y: 4 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.18 } },
  exit:    { opacity: 0, y: 2, transition: { duration: 0.12 } }
};

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
    <motion.form
      onSubmit={handleSubmit}
      className="mt-4 p-4 bg-white rounded shadow"
      variants={formVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <CardElement options={{ hidePostalCode: true }} />
      <AnimatePresence>
        {errorMessage && (
          <motion.p
            className="text-red-600 mt-2"
            variants={errorVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {errorMessage}
          </motion.p>
        )}
      </AnimatePresence>
      <button
        type="submit"
        disabled={!stripe || isSubmitting}
        className="mt-4 w-full bg-operon-blue text-white py-2 rounded disabled:opacity-50"
      >
        {isSubmitting ? 'Saving…' : 'Save Card'}
      </button>
    </motion.form>
  );
}
