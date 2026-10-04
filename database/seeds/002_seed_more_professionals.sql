-- Fixigo Additional Professionals Seed
-- Ensures multiple top-rated professionals for Plumber, Electrician, AC Repair, Painter, Carpenter, Cleaner, Mechanic, Appliance Repair

-- 1. Reset Rahul Kumar availability
UPDATE professionals SET is_available = TRUE WHERE user_id = '22222222-2222-2222-2222-222222222204';

-- 2. Insert Users
INSERT INTO users (id, name, email, phone, password_hash, role) VALUES
('22222222-2222-2222-2222-222222222209', 'Mohit Verma', 'mohit.painter@fixigo.com', '+91 9876500106', '$2a$10$zLKN2DHN.rg.dQNMFA27LOpnb6Sa6RlGsMCYhPakP8WKsc2TnwA6y', 'professional'),
('22222222-2222-2222-2222-222222222210', 'Deepak Yadav', 'deepak.mechanic@fixigo.com', '+91 9876500107', '$2a$10$zLKN2DHN.rg.dQNMFA27LOpnb6Sa6RlGsMCYhPakP8WKsc2TnwA6y', 'professional'),
('22222222-2222-2222-2222-222222222211', 'Sunil Rawat', 'sunil.appliance@fixigo.com', '+91 9876500108', '$2a$10$zLKN2DHN.rg.dQNMFA27LOpnb6Sa6RlGsMCYhPakP8WKsc2TnwA6y', 'professional'),
('22222222-2222-2222-2222-222222222212', 'Rajesh Joshi', 'rajesh.plumber@fixigo.com', '+91 9876500109', '$2a$10$zLKN2DHN.rg.dQNMFA27LOpnb6Sa6RlGsMCYhPakP8WKsc2TnwA6y', 'professional'),
('22222222-2222-2222-2222-222222222213', 'Amit Saxena', 'amit.electrician@fixigo.com', '+91 9876500110', '$2a$10$zLKN2DHN.rg.dQNMFA27LOpnb6Sa6RlGsMCYhPakP8WKsc2TnwA6y', 'professional')
ON CONFLICT (email) DO NOTHING;

-- 3. Insert Professionals with PostGIS Geography Point(lon lat)
INSERT INTO professionals (id, user_id, bio, experience, rating, review_count, price, location, is_available, is_verified, address) VALUES
('33333333-3333-3333-3333-333333333306', '22222222-2222-2222-2222-222222222209', 'Interior wall painting, texture finish, waterproof primer, and premium emulsion specialist with 6 years experience.', 6, 4.85, 23, 350.00, ST_SetSRID(ST_MakePoint(77.2100, 28.6250), 4326)::geography, TRUE, TRUE, 'Karol Bagh, New Delhi'),
('33333333-3333-3333-3333-333333333307', '22222222-2222-2222-2222-222222222210', 'Two-wheeler and four-wheeler roadside assistance, quick breakdown recovery, battery jumpstart, and engine oil overhaul.', 10, 4.90, 42, 400.00, ST_SetSRID(ST_MakePoint(77.2200, 28.6180), 4326)::geography, TRUE, TRUE, 'Lajpat Nagar, New Delhi'),
('33333333-3333-3333-3333-333333333308', '22222222-2222-2222-2222-222222222211', 'Certified home appliance technician for washing machines, refrigerators, microwaves, and RO water purifiers.', 7, 4.75, 19, 320.00, ST_SetSRID(ST_MakePoint(77.2300, 28.6290), 4326)::geography, TRUE, TRUE, 'Civil Lines, New Delhi'),
('33333333-3333-3333-3333-333333333309', '22222222-2222-2222-2222-222222222212', 'Senior master plumber with 12 years expertise in concealed pipe leak detection, CP fitting, water tank lines, and pumps.', 12, 4.95, 58, 380.00, ST_SetSRID(ST_MakePoint(77.2050, 28.6120), 4326)::geography, TRUE, TRUE, 'Connaught Place, New Delhi'),
('33333333-3333-3333-3333-333333333310', '22222222-2222-2222-2222-222222222213', 'Residential & commercial electrician, circuit breakers, heavy load wiring, inverter setup, and emergency short circuits.', 5, 4.65, 16, 280.00, ST_SetSRID(ST_MakePoint(77.2180, 28.6210), 4326)::geography, TRUE, TRUE, 'Pahar Ganj, New Delhi')
ON CONFLICT (id) DO NOTHING;

-- 4. Map Services
INSERT INTO professional_services (professional_id, service_id) VALUES
('33333333-3333-3333-3333-333333333306', '11111111-1111-1111-1111-111111111105'), -- Mohit -> Painter
('33333333-3333-3333-3333-333333333307', '11111111-1111-1111-1111-111111111108'), -- Deepak -> Mechanic
('33333333-3333-3333-3333-333333333308', '11111111-1111-1111-1111-111111111107'), -- Sunil -> Appliance Repairer
('33333333-3333-3333-3333-333333333309', '11111111-1111-1111-1111-111111111102'), -- Rajesh -> Plumber
('33333333-3333-3333-3333-333333333310', '11111111-1111-1111-1111-111111111101')  -- Amit -> Electrician
ON CONFLICT (professional_id, service_id) DO NOTHING;
