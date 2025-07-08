// src/utils/stripe.js
import { loadStripe } from '@stripe/stripe-js';

console.log('💳 STRIPE KEY:', process.env.REACT_APP_STRIPE_PK);

export const stripePromise = loadStripe(
  process.env.REACT_APP_STRIPE_PK
);
