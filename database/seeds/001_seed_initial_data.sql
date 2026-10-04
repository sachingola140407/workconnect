-- WorkConnect Seed Data
-- Default password for all seed accounts is: Password@123
-- Hash: $2a$10$zLKN2DHN.rg.dQNMFA27LOpnb6Sa6RlGsMCYhPakP8WKsc2TnwA6y

-- 1. Insert Services
INSERT INTO services (id, name, category, description, icon) VALUES
('11111111-1111-1111-1111-111111111101', 'Electrician', 'Electrical', 'Expert electrical repair, house wiring, switchboards, and fixture installations', 'Zap'),
('11111111-1111-1111-1111-111111111102', 'Plumber', 'Plumbing', 'Pipe leakage fixing, drain cleaning, tap replacement, and water pump repair', 'Wrench'),
('11111111-1111-1111-1111-111111111103', 'AC Repairer', 'Appliances', 'AC cooling servicing, gas filling, compressor repair, and seasonal maintenance', 'Wind'),
('11111111-1111-1111-1111-111111111104', 'Carpenter', 'Carpentry', 'Furniture repair, custom woodwork, modular kitchen fittings, and door hinges', 'Hammer'),
('11111111-1111-1111-1111-111111111105', 'Painter', 'Painting', 'Interior & exterior wall painting, waterproof coating, and texture finishing', 'Paintbrush'),
('11111111-1111-1111-1111-111111111106', 'Cleaner', 'Cleaning', 'Home deep cleaning, sofa/carpet shampooing, kitchen & bathroom sanitation', 'Sparkles'),
('11111111-1111-1111-1111-111111111107', 'Appliance Repairer', 'Appliances', 'Repair of washing machines, refrigerators, microwaves, and chimneys', 'Cpu'),
('11111111-1111-1111-1111-111111111108', 'Mechanic', 'Automotive', 'Quick two-wheeler and four-wheeler roadside assistance, oil change, and tuning', 'Car')
ON CONFLICT (id) DO NOTHING;

-- 2. Insert Users (Admin, Customers, Professionals)
-- Admin
INSERT INTO users (id, name, email, phone, password_hash, role) VALUES
('22222222-2222-2222-2222-222222222201', 'System Administrator', 'admin@workconnect.com', '+91 9876543210', '$2a$10$zLKN2DHN.rg.dQNMFA27LOpnb6Sa6RlGsMCYhPakP8WKsc2TnwA6y', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Customers
INSERT INTO users (id, name, email, phone, password_hash, role) VALUES
('22222222-2222-2222-2222-222222222202', 'Arun Verma', 'customer@workconnect.com', '+91 9876500001', '$2a$10$zLKN2DHN.rg.dQNMFA27LOpnb6Sa6RlGsMCYhPakP8WKsc2TnwA6y', 'customer'),
('22222222-2222-2222-2222-222222222203', 'Priya Sharma', 'priya@workconnect.com', '+91 9876500002', '$2a$10$zLKN2DHN.rg.dQNMFA27LOpnb6Sa6RlGsMCYhPakP8WKsc2TnwA6y', 'customer')
ON CONFLICT (email) DO NOTHING;

-- Professionals
INSERT INTO users (id, name, email, phone, password_hash, role) VALUES
('22222222-2222-2222-2222-222222222204', 'Rahul Kumar', 'rahul.electrician@workconnect.com', '+91 9876500101', '$2a$10$zLKN2DHN.rg.dQNMFA27LOpnb6Sa6RlGsMCYhPakP8WKsc2TnwA6y', 'professional'),
('22222222-2222-2222-2222-222222222205', 'Aman Singh', 'aman.plumber@workconnect.com', '+91 9876500102', '$2a$10$zLKN2DHN.rg.dQNMFA27LOpnb6Sa6RlGsMCYhPakP8WKsc2TnwA6y', 'professional'),
('22222222-2222-2222-2222-222222222206', 'Ravi Sharma', 'ravi.ac@workconnect.com', '+91 9876500103', '$2a$10$zLKN2DHN.rg.dQNMFA27LOpnb6Sa6RlGsMCYhPakP8WKsc2TnwA6y', 'professional'),
('22222222-2222-2222-2222-222222222207', 'Neha Gupta', 'neha.cleaner@workconnect.com', '+91 9876500104', '$2a$10$zLKN2DHN.rg.dQNMFA27LOpnb6Sa6RlGsMCYhPakP8WKsc2TnwA6y', 'professional'),
('22222222-2222-2222-2222-222222222208', 'Vikram Patel', 'vikram.carpenter@workconnect.com', '+91 9876500105', '$2a$10$zLKN2DHN.rg.dQNMFA27LOpnb6Sa6RlGsMCYhPakP8WKsc2TnwA6y', 'professional')
ON CONFLICT (email) DO NOTHING;

-- 3. Insert Professional Profiles with PostGIS Geography points (longitude latitude)
INSERT INTO professionals (id, user_id, bio, experience, rating, review_count, price, location, is_available, is_verified, address) VALUES
('33333333-3333-3333-3333-333333333301', '22222222-2222-2222-2222-222222222204', 'Certified master electrician with 7+ years of experience in residential wiring and fuse box overhauls.', 7, 4.80, 18, 350.00, ST_SetSRID(ST_MakePoint(77.2090, 28.6139), 4326)::geography, TRUE, TRUE, 'Connaught Place, New Delhi'),
('33333333-3333-3333-3333-333333333302', '22222222-2222-2222-2222-222222222205', 'Experienced plumber specializing in leakage detection, high-pressure line fixing, and bathroom fittings.', 5, 4.60, 14, 300.00, ST_SetSRID(ST_MakePoint(77.2150, 28.6200), 4326)::geography, TRUE, TRUE, 'Barakhamba, New Delhi'),
('33333333-3333-3333-3333-333333333303', '22222222-2222-2222-2222-222222222206', 'HVAC & split AC technician. Fast diagnosis, PCB repair, and cooling performance optimization.', 8, 4.90, 29, 500.00, ST_SetSRID(ST_MakePoint(77.2280, 28.6150), 4326)::geography, TRUE, TRUE, 'India Gate Area, New Delhi'),
('33333333-3333-3333-3333-333333333304', '22222222-2222-2222-2222-222222222207', 'Professional home organizer & deep cleaning expert. Uses non-toxic eco-friendly sanitation solutions.', 4, 4.70, 21, 250.00, ST_SetSRID(ST_MakePoint(77.1950, 28.6050), 4326)::geography, TRUE, TRUE, 'Chanakyapuri, New Delhi'),
('33333333-3333-3333-3333-333333333305', '22222222-2222-2222-2222-222222222208', 'Custom woodwork, hinge repairs, modular shelf assemblies, and door lock installations.', 6, 4.50, 11, 400.00, ST_SetSRID(ST_MakePoint(77.2400, 28.6300), 4326)::geography, TRUE, TRUE, 'Pragati Maidan, New Delhi')
ON CONFLICT (id) DO NOTHING;

-- 4. Map Professional Services
INSERT INTO professional_services (professional_id, service_id) VALUES
('33333333-3333-3333-3333-333333333301', '11111111-1111-1111-1111-111111111101'), -- Rahul -> Electrician
('33333333-3333-3333-3333-333333333302', '11111111-1111-1111-1111-111111111102'), -- Aman -> Plumber
('33333333-3333-3333-3333-333333333303', '11111111-1111-1111-1111-111111111103'), -- Ravi -> AC Repairer
('33333333-3333-3333-3333-333333333304', '11111111-1111-1111-1111-111111111106'), -- Neha -> Cleaner
('33333333-3333-3333-3333-333333333305', '11111111-1111-1111-1111-111111111104')  -- Vikram -> Carpenter
ON CONFLICT (professional_id, service_id) DO NOTHING;
