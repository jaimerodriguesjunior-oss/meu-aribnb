-- Add paid_amount to bookings
ALTER TABLE bookings ADD COLUMN paid_amount numeric(10,2) DEFAULT 0;

-- Link transactions to bookings
ALTER TABLE transactions ADD COLUMN booking_id uuid REFERENCES bookings(id) ON DELETE SET NULL;
