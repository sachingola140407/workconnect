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

-- 2. No fake users or mock professionals are seeded per production requirement.

