-- Migration 002: Add visiting_charge to professionals and bookings, plus ensure tracking fields
ALTER TABLE professionals ADD COLUMN IF NOT EXISTS visiting_charge NUMERIC(10, 2) DEFAULT 99.00;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS visiting_charge NUMERIC(10, 2) DEFAULT 99.00;

-- Set distinct visiting charges for seed professionals
UPDATE professionals SET visiting_charge = 99.00 WHERE user_id = '22222222-2222-2222-2222-222222222204'; -- Electrician Rahul
UPDATE professionals SET visiting_charge = 149.00 WHERE user_id = '22222222-2222-2222-2222-222222222205'; -- Plumber Aman
UPDATE professionals SET visiting_charge = 199.00 WHERE user_id = '22222222-2222-2222-2222-222222222206'; -- AC Ravi
UPDATE professionals SET visiting_charge = 99.00 WHERE user_id = '22222222-2222-2222-2222-222222222207'; -- Cleaner Neha
UPDATE professionals SET visiting_charge = 149.00 WHERE user_id = '22222222-2222-2222-2222-222222222208'; -- Carpenter Vikram
UPDATE professionals SET visiting_charge = 149.00 WHERE user_id = '22222222-2222-2222-2222-222222222209'; -- Painter Mohit
UPDATE professionals SET visiting_charge = 199.00 WHERE user_id = '22222222-2222-2222-2222-222222222210'; -- Mechanic Deepak
UPDATE professionals SET visiting_charge = 149.00 WHERE user_id = '22222222-2222-2222-2222-222222222211'; -- Appliance Sunil
UPDATE professionals SET visiting_charge = 99.00 WHERE user_id = '22222222-2222-2222-2222-222222222212'; -- Plumber Rajesh
UPDATE professionals SET visiting_charge = 99.00 WHERE user_id = '22222222-2222-2222-2222-222222222213'; -- Electrician Amit

-- Update any existing bookings without customer_location to default near Connaught Place
UPDATE bookings 
SET customer_location = ST_SetSRID(ST_MakePoint(77.2167, 28.6315), 4326)::geography,
    visiting_charge = 99.00
WHERE customer_location IS NULL;
