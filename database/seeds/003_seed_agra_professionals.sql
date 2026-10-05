-- Seed Professionals in Agra (Matching reference layout with multiple Plumbers and top trades)
-- Agra coordinates center ~ 27.1767 N, 78.0081 E

-- 1. Insert Users in Agra
INSERT INTO users (id, name, email, phone, password_hash, role) VALUES
('44444444-4444-4444-4444-444444444401', 'Rajesh Joshi', 'rajesh.agra@fixigo.com', '+91 9876500201', '$2a$10$zLKN2DHN.rg.dQNMFA27LOpnb6Sa6RlGsMCYhPakP8WKsc2TnwA6y', 'professional'),
('44444444-4444-4444-4444-444444444402', 'Aman Singh', 'aman.agra@fixigo.com', '+91 9876500202', '$2a$10$zLKN2DHN.rg.dQNMFA27LOpnb6Sa6RlGsMCYhPakP8WKsc2TnwA6y', 'professional'),
('44444444-4444-4444-4444-444444444403', 'Vikas Sharma', 'vikas.agra@fixigo.com', '+91 9876500203', '$2a$10$zLKN2DHN.rg.dQNMFA27LOpnb6Sa6RlGsMCYhPakP8WKsc2TnwA6y', 'professional'),
('44444444-4444-4444-4444-444444444404', 'Rohit Verma', 'rohit.agra@fixigo.com', '+91 9876500204', '$2a$10$zLKN2DHN.rg.dQNMFA27LOpnb6Sa6RlGsMCYhPakP8WKsc2TnwA6y', 'professional'),
('44444444-4444-4444-4444-444444444405', 'Sandeep Yadav', 'sandeep.agra@fixigo.com', '+91 9876500205', '$2a$10$zLKN2DHN.rg.dQNMFA27LOpnb6Sa6RlGsMCYhPakP8WKsc2TnwA6y', 'professional'),
('44444444-4444-4444-4444-444444444406', 'Amit Saxena', 'amit.agra@fixigo.com', '+91 9876500206', '$2a$10$zLKN2DHN.rg.dQNMFA27LOpnb6Sa6RlGsMCYhPakP8WKsc2TnwA6y', 'professional'),
('44444444-4444-4444-4444-444444444407', 'Ravi Sharma', 'ravi.agra@fixigo.com', '+91 9876500207', '$2a$10$zLKN2DHN.rg.dQNMFA27LOpnb6Sa6RlGsMCYhPakP8WKsc2TnwA6y', 'professional'),
('44444444-4444-4444-4444-444444444408', 'Vikram Patel', 'vikram.agra@fixigo.com', '+91 9876500208', '$2a$10$zLKN2DHN.rg.dQNMFA27LOpnb6Sa6RlGsMCYhPakP8WKsc2TnwA6y', 'professional'),
('44444444-4444-4444-4444-444444444409', 'Neha Gupta', 'neha.agra@fixigo.com', '+91 9876500209', '$2a$10$zLKN2DHN.rg.dQNMFA27LOpnb6Sa6RlGsMCYhPakP8WKsc2TnwA6y', 'professional'),
('44444444-4444-4444-4444-444444444410', 'Deepak Yadav', 'deepak.agra@fixigo.com', '+91 9876500210', '$2a$10$zLKN2DHN.rg.dQNMFA27LOpnb6Sa6RlGsMCYhPakP8WKsc2TnwA6y', 'professional')
ON CONFLICT (email) DO NOTHING;

-- 2. Insert Professionals in Agra with PostGIS Geography Point(lon lat)
INSERT INTO professionals (id, user_id, bio, experience, rating, review_count, price, visiting_charge, location, is_available, is_verified, address) VALUES
('55555555-5555-5555-5555-555555555501', '44444444-4444-4444-4444-444444444401', 'Senior master plumber with 12 years expertise in concealed pipe leak detection, CP fitting, water tank lines, and pumps.', 12, 5.00, 58, 300.00, 99.00, ST_SetSRID(ST_MakePoint(78.0069, 27.2038), 4326)::geography, TRUE, TRUE, 'Sanjay Place, Agra'),
('55555555-5555-5555-5555-555555555502', '44444444-4444-4444-4444-444444444402', 'Specialist in bathroom fixtures, drain blockage clearing, tap repairs, and instant leak fixing.', 6, 4.60, 14, 280.00, 99.00, ST_SetSRID(ST_MakePoint(78.0165, 27.2155), 4326)::geography, TRUE, TRUE, 'Kamla Nagar, Agra'),
('55555555-5555-5555-5555-555555555503', '44444444-4444-4444-4444-444444444403', 'High-pressure water pump specialist, pipeline replacement, and modern sanitary installations.', 8, 4.70, 20, 320.00, 99.00, ST_SetSRID(ST_MakePoint(77.9620, 27.1850), 4326)::geography, TRUE, TRUE, 'Bodla, Agra'),
('55555555-5555-5555-5555-555555555504', '44444444-4444-4444-4444-444444444404', 'Quick turnaround residential plumbing, flush tank maintenance, kitchen sink drainage, and pipe overhauls.', 5, 4.40, 9, 260.00, 99.00, ST_SetSRID(ST_MakePoint(77.9850, 27.1750), 4326)::geography, TRUE, TRUE, 'Shahganj, Agra'),
('55555555-5555-5555-5555-555555555505', '44444444-4444-4444-4444-444444444405', 'Certified plumber for commercial and residential fittings, geyser water connections, and underground leakage.', 7, 4.50, 16, 290.00, 99.00, ST_SetSRID(ST_MakePoint(78.0120, 27.1580), 4326)::geography, TRUE, TRUE, 'Sadar Bazaar, Agra'),
('55555555-5555-5555-5555-555555555506', '44444444-4444-4444-4444-444444444406', 'Licensed master electrician, MCB tripping resolution, inverter wiring, and smart lighting installation.', 9, 4.85, 34, 350.00, 99.00, ST_SetSRID(ST_MakePoint(78.0142, 27.2272), 4326)::geography, TRUE, TRUE, 'Dayalbagh, Agra'),
('55555555-5555-5555-5555-555555555507', '44444444-4444-4444-4444-444444444407', 'AC cooling servicing, split & window AC installation, gas top-up, and compressor maintenance.', 8, 4.90, 41, 450.00, 149.00, ST_SetSRID(ST_MakePoint(78.0420, 27.1610), 4326)::geography, TRUE, TRUE, 'Tajganj, Agra'),
('55555555-5555-5555-5555-555555555508', '44444444-4444-4444-4444-444444444408', 'Expert carpenter for modular kitchens, furniture repair, custom cabinetry, and door lock fitting.', 6, 4.65, 22, 380.00, 120.00, ST_SetSRID(ST_MakePoint(77.9980, 27.2120), 4326)::geography, TRUE, TRUE, 'Khandari, Agra'),
('55555555-5555-5555-5555-555555555509', '44444444-4444-4444-4444-444444444409', 'Deep home cleaning, sofa sanitation, kitchen degreasing, and eco-friendly bathroom sterilization.', 5, 4.80, 19, 299.00, 99.00, ST_SetSRID(ST_MakePoint(78.0450, 27.1560), 4326)::geography, TRUE, TRUE, 'Fatehabad Road, Agra'),
('55555555-5555-5555-5555-555555555510', '44444444-4444-4444-4444-444444444410', 'Two-wheeler and four-wheeler emergency mechanical breakdown, jump-start, and rapid roadside assistance.', 10, 4.85, 30, 400.00, 149.00, ST_SetSRID(ST_MakePoint(77.9480, 27.2210), 4326)::geography, TRUE, TRUE, 'Sikandra, Agra')
ON CONFLICT (id) DO UPDATE SET
  bio = EXCLUDED.bio,
  experience = EXCLUDED.experience,
  rating = EXCLUDED.rating,
  price = EXCLUDED.price,
  visiting_charge = EXCLUDED.visiting_charge,
  location = EXCLUDED.location,
  address = EXCLUDED.address;

-- 3. Map Services for Agra Professionals
INSERT INTO professional_services (professional_id, service_id) VALUES
('55555555-5555-5555-5555-555555555501', '11111111-1111-1111-1111-111111111102'), -- Rajesh -> Plumber
('55555555-5555-5555-5555-555555555502', '11111111-1111-1111-1111-111111111102'), -- Aman -> Plumber
('55555555-5555-5555-5555-555555555503', '11111111-1111-1111-1111-111111111102'), -- Vikas -> Plumber
('55555555-5555-5555-5555-555555555504', '11111111-1111-1111-1111-111111111102'), -- Rohit -> Plumber
('55555555-5555-5555-5555-555555555505', '11111111-1111-1111-1111-111111111102'), -- Sandeep -> Plumber
('55555555-5555-5555-5555-555555555506', '11111111-1111-1111-1111-111111111101'), -- Amit -> Electrician
('55555555-5555-5555-5555-555555555507', '11111111-1111-1111-1111-111111111103'), -- Ravi -> AC Repairer
('55555555-5555-5555-5555-555555555508', '11111111-1111-1111-1111-111111111104'), -- Vikram -> Carpenter
('55555555-5555-5555-5555-555555555509', '11111111-1111-1111-1111-111111111106'), -- Neha -> Cleaner
('55555555-5555-5555-5555-555555555510', '11111111-1111-1111-1111-111111111108')  -- Deepak -> Mechanic
ON CONFLICT (professional_id, service_id) DO NOTHING;
