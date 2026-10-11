-- Migration 005: Add reference services matching service catalog
-- 1. Insert Additional Reference Services
INSERT INTO services (id, name, category, description, icon) VALUES
('11111111-1111-1111-1111-111111111109', 'Pest Control', 'Cleaning', 'Comprehensive pest eradication, termite protection, and sanitization', 'Bug'),
('11111111-1111-1111-1111-111111111110', 'TV Repair', 'Appliances', 'LED/LCD TV panel diagnostics, motherboard repair, and sound fixing', 'Tv'),
('11111111-1111-1111-1111-111111111111', 'RO Repair', 'Appliances', 'RO water purifier membrane replacement, filter servicing, and pump repair', 'Droplets'),
('11111111-1111-1111-1111-111111111112', 'Geyser Repair', 'Appliances', 'Instant & storage water geyser element replacement and thermostat repair', 'Flame'),
('11111111-1111-1111-1111-111111111113', 'Laptop Repair', 'Electronics', 'Laptop motherboard repair, screen replacement, OS installation, and battery service', 'Laptop'),
('11111111-1111-1111-1111-111111111114', 'Home Shifting', 'Logistics', 'Safe residential relocation, packaging, loading, and furniture shifting', 'Truck')
ON CONFLICT (id) DO NOTHING;
