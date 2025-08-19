-- Add payment_intent_id column to orders table for tracking Stripe payments
ALTER TABLE orders ADD COLUMN payment_intent_id TEXT;

-- Add index for faster lookups
CREATE INDEX idx_orders_payment_intent_id ON orders(payment_intent_id);

-- Add constraint to ensure payment_intent_id is unique when not null
ALTER TABLE orders ADD CONSTRAINT unique_payment_intent_id UNIQUE (payment_intent_id);