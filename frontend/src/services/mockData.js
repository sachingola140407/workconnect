// Resilient Fixigo Data Engine
// Guarantees zero downtime on Vercel deployments, providing full PostGIS-style distance calculation,
// service cataloging, and professional matching even when backend database is disconnected.

export const FALLBACK_SERVICES = [
  { id: '11111111-1111-1111-1111-111111111101', name: 'Electrician', category: 'Electrical', description: 'Expert electrical repair, house wiring, switchboards, and fixture installations', icon: 'Zap', available_pros: 3 },
  { id: '11111111-1111-1111-1111-111111111102', name: 'Plumber', category: 'Plumbing', description: 'Pipe leakage fixing, drain cleaning, tap replacement, and water pump repair', icon: 'Wrench', available_pros: 5 },
  { id: '11111111-1111-1111-1111-111111111103', name: 'AC Repairer', category: 'Appliances', description: 'AC cooling servicing, gas filling, compressor repair, and seasonal maintenance', icon: 'Wind', available_pros: 2 },
  { id: '11111111-1111-1111-1111-111111111104', name: 'Carpenter', category: 'Carpentry', description: 'Furniture repair, custom woodwork, modular kitchen fittings, and door hinges', icon: 'Hammer', available_pros: 2 },
  { id: '11111111-1111-1111-1111-111111111105', name: 'Painter', category: 'Painting', description: 'Interior & exterior wall painting, waterproof coating, and texture finishing', icon: 'Paintbrush', available_pros: 1 },
  { id: '11111111-1111-1111-1111-111111111106', name: 'Cleaner', category: 'Cleaning', description: 'Home deep cleaning, sofa/carpet shampooing, kitchen & bathroom sanitation', icon: 'Sparkles', available_pros: 2 },
  { id: '11111111-1111-1111-1111-111111111107', name: 'Appliance Repairer', category: 'Appliances', description: 'Repair of washing machines, refrigerators, microwaves, and chimneys', icon: 'Cpu', available_pros: 1 },
  { id: '11111111-1111-1111-1111-111111111108', name: 'Mechanic', category: 'Automotive', description: 'Quick two-wheeler and four-wheeler roadside assistance, oil change, and tuning', icon: 'Car', available_pros: 2 },
];

export const FALLBACK_PROFESSIONALS = [
  // --- AGRA PROFESSIONALS ---
  {
    id: '55555555-5555-5555-5555-555555555501',
    user_id: '44444444-4444-4444-4444-444444444401',
    name: 'Rajesh Joshi',
    email: 'rajesh.agra@fixigo.com',
    phone: '+91 9876500201',
    bio: 'Senior master plumber with 12 years expertise in concealed pipe leak detection, CP fitting, water tank lines, and pumps.',
    experience: 12,
    rating: 5.0,
    review_count: 58,
    price: 300,
    visiting_charge: 99,
    is_available: true,
    is_verified: true,
    address: 'Sanjay Place, Agra',
    latitude: 27.2038,
    longitude: 78.0069,
    services: [{ id: '11111111-1111-1111-1111-111111111102', name: 'Plumber', category: 'Plumbing', icon: 'Wrench' }],
  },
  {
    id: '55555555-5555-5555-5555-555555555502',
    user_id: '44444444-4444-4444-4444-444444444402',
    name: 'Aman Singh',
    email: 'aman.agra@fixigo.com',
    phone: '+91 9876500202',
    bio: 'Specialist in bathroom fixtures, drain blockage clearing, tap repairs, and instant leak fixing.',
    experience: 6,
    rating: 4.6,
    review_count: 14,
    price: 280,
    visiting_charge: 99,
    is_available: true,
    is_verified: true,
    address: 'Kamla Nagar, Agra',
    latitude: 27.2155,
    longitude: 78.0165,
    services: [{ id: '11111111-1111-1111-1111-111111111102', name: 'Plumber', category: 'Plumbing', icon: 'Wrench' }],
  },
  {
    id: '55555555-5555-5555-5555-555555555503',
    user_id: '44444444-4444-4444-4444-444444444403',
    name: 'Vikas Sharma',
    email: 'vikas.agra@fixigo.com',
    phone: '+91 9876500203',
    bio: 'High-pressure water pump specialist, pipeline replacement, and modern sanitary installations.',
    experience: 8,
    rating: 4.7,
    review_count: 20,
    price: 320,
    visiting_charge: 99,
    is_available: true,
    is_verified: true,
    address: 'Bodla, Agra',
    latitude: 27.1850,
    longitude: 77.9620,
    services: [{ id: '11111111-1111-1111-1111-111111111102', name: 'Plumber', category: 'Plumbing', icon: 'Wrench' }],
  },
  {
    id: '55555555-5555-5555-5555-555555555504',
    user_id: '44444444-4444-4444-4444-444444444404',
    name: 'Rohit Verma',
    email: 'rohit.agra@fixigo.com',
    phone: '+91 9876500204',
    bio: 'Quick turnaround residential plumbing, flush tank maintenance, kitchen sink drainage, and pipe overhauls.',
    experience: 5,
    rating: 4.4,
    review_count: 9,
    price: 260,
    visiting_charge: 99,
    is_available: true,
    is_verified: true,
    address: 'Shahganj, Agra',
    latitude: 27.1750,
    longitude: 77.9850,
    services: [{ id: '11111111-1111-1111-1111-111111111102', name: 'Plumber', category: 'Plumbing', icon: 'Wrench' }],
  },
  {
    id: '55555555-5555-5555-5555-555555555505',
    user_id: '44444444-4444-4444-4444-444444444405',
    name: 'Sandeep Yadav',
    email: 'sandeep.agra@fixigo.com',
    phone: '+91 9876500205',
    bio: 'Certified plumber for commercial and residential fittings, geyser water connections, and underground leakage.',
    experience: 7,
    rating: 4.5,
    review_count: 16,
    price: 290,
    visiting_charge: 99,
    is_available: true,
    is_verified: true,
    address: 'Sadar Bazaar, Agra',
    latitude: 27.1580,
    longitude: 78.0120,
    services: [{ id: '11111111-1111-1111-1111-111111111102', name: 'Plumber', category: 'Plumbing', icon: 'Wrench' }],
  },
  {
    id: '55555555-5555-5555-5555-555555555506',
    user_id: '44444444-4444-4444-4444-444444444406',
    name: 'Amit Saxena',
    email: 'amit.agra@fixigo.com',
    phone: '+91 9876500206',
    bio: 'Licensed master electrician, MCB tripping resolution, inverter wiring, and smart lighting installation.',
    experience: 9,
    rating: 4.85,
    review_count: 34,
    price: 350,
    visiting_charge: 99,
    is_available: true,
    is_verified: true,
    address: 'Dayalbagh, Agra',
    latitude: 27.2272,
    longitude: 78.0142,
    services: [{ id: '11111111-1111-1111-1111-111111111101', name: 'Electrician', category: 'Electrical', icon: 'Zap' }],
  },
  {
    id: '55555555-5555-5555-5555-555555555507',
    user_id: '44444444-4444-4444-4444-444444444407',
    name: 'Ravi Sharma',
    email: 'ravi.agra@fixigo.com',
    phone: '+91 9876500207',
    bio: 'AC cooling servicing, split & window AC installation, gas top-up, and compressor maintenance.',
    experience: 8,
    rating: 4.9,
    review_count: 41,
    price: 450,
    visiting_charge: 149,
    is_available: true,
    is_verified: true,
    address: 'Tajganj, Agra',
    latitude: 27.1610,
    longitude: 78.0420,
    services: [{ id: '11111111-1111-1111-1111-111111111103', name: 'AC Repairer', category: 'Appliances', icon: 'Wind' }],
  },
  {
    id: '55555555-5555-5555-5555-555555555508',
    user_id: '44444444-4444-4444-4444-444444444408',
    name: 'Vikram Patel',
    email: 'vikram.agra@fixigo.com',
    phone: '+91 9876500208',
    bio: 'Expert carpenter for modular kitchens, furniture repair, custom cabinetry, and door lock fitting.',
    experience: 6,
    rating: 4.65,
    review_count: 22,
    price: 380,
    visiting_charge: 120,
    is_available: true,
    is_verified: true,
    address: 'Khandari, Agra',
    latitude: 27.2120,
    longitude: 77.9980,
    services: [{ id: '11111111-1111-1111-1111-111111111104', name: 'Carpenter', category: 'Carpentry', icon: 'Hammer' }],
  },
  {
    id: '55555555-5555-5555-5555-555555555509',
    user_id: '44444444-4444-4444-4444-444444444409',
    name: 'Neha Gupta',
    email: 'neha.agra@fixigo.com',
    phone: '+91 9876500209',
    bio: 'Deep home cleaning, sofa sanitation, kitchen degreasing, and eco-friendly bathroom sterilization.',
    experience: 5,
    rating: 4.8,
    review_count: 19,
    price: 299,
    visiting_charge: 99,
    is_available: true,
    is_verified: true,
    address: 'Fatehabad Road, Agra',
    latitude: 27.1560,
    longitude: 78.0450,
    services: [{ id: '11111111-1111-1111-1111-111111111106', name: 'Cleaner', category: 'Cleaning', icon: 'Sparkles' }],
  },
  {
    id: '55555555-5555-5555-5555-555555555510',
    user_id: '44444444-4444-4444-4444-444444444410',
    name: 'Deepak Yadav',
    email: 'deepak.agra@fixigo.com',
    phone: '+91 9876500210',
    bio: 'Two-wheeler and four-wheeler emergency mechanical breakdown, jump-start, and rapid roadside assistance.',
    experience: 10,
    rating: 4.85,
    review_count: 30,
    price: 400,
    visiting_charge: 149,
    is_available: true,
    is_verified: true,
    address: 'Sikandra, Agra',
    latitude: 27.2210,
    longitude: 77.9480,
    services: [{ id: '11111111-1111-1111-1111-111111111108', name: 'Mechanic', category: 'Automotive', icon: 'Car' }],
  },

  // --- DELHI NCR PROFESSIONALS ---
  {
    id: '33333333-3333-3333-3333-333333333301',
    user_id: '22222222-2222-2222-2222-222222222204',
    name: 'Rahul Kumar',
    email: 'rahul.electrician@workconnect.com',
    phone: '+91 9876500101',
    bio: 'Certified master electrician with 7+ years of experience in residential wiring and fuse box overhauls.',
    experience: 7,
    rating: 4.8,
    review_count: 18,
    price: 350,
    visiting_charge: 99,
    is_available: true,
    is_verified: true,
    address: 'Connaught Place, New Delhi',
    latitude: 28.6139,
    longitude: 77.2090,
    services: [{ id: '11111111-1111-1111-1111-111111111101', name: 'Electrician', category: 'Electrical', icon: 'Zap' }],
  },
  {
    id: '33333333-3333-3333-3333-333333333302',
    user_id: '22222222-2222-2222-2222-222222222205',
    name: 'Aman Singh',
    email: 'aman.plumber@workconnect.com',
    phone: '+91 9876500102',
    bio: 'Experienced plumber specializing in leakage detection, high-pressure line fixing, and bathroom fittings.',
    experience: 5,
    rating: 4.6,
    review_count: 14,
    price: 300,
    visiting_charge: 149,
    is_available: true,
    is_verified: true,
    address: 'Barakhamba, New Delhi',
    latitude: 28.6200,
    longitude: 77.2150,
    services: [{ id: '11111111-1111-1111-1111-111111111102', name: 'Plumber', category: 'Plumbing', icon: 'Wrench' }],
  },
  {
    id: '33333333-3333-3333-3333-333333333303',
    user_id: '22222222-2222-2222-2222-222222222206',
    name: 'Ravi Sharma',
    email: 'ravi.ac@workconnect.com',
    phone: '+91 9876500103',
    bio: 'HVAC & split AC technician. Fast diagnosis, PCB repair, and cooling performance optimization.',
    experience: 8,
    rating: 4.9,
    review_count: 29,
    price: 500,
    visiting_charge: 199,
    is_available: true,
    is_verified: true,
    address: 'India Gate Area, New Delhi',
    latitude: 28.6150,
    longitude: 77.2280,
    services: [{ id: '11111111-1111-1111-1111-111111111103', name: 'AC Repairer', category: 'Appliances', icon: 'Wind' }],
  },
  {
    id: '33333333-3333-3333-3333-333333333304',
    user_id: '22222222-2222-2222-2222-222222222207',
    name: 'Neha Gupta',
    email: 'neha.cleaner@workconnect.com',
    phone: '+91 9876500104',
    bio: 'Professional home organizer & deep cleaning expert. Uses non-toxic eco-friendly sanitation solutions.',
    experience: 4,
    rating: 4.7,
    review_count: 21,
    price: 250,
    visiting_charge: 99,
    is_available: true,
    is_verified: true,
    address: 'Chanakyapuri, New Delhi',
    latitude: 28.6050,
    longitude: 77.1950,
    services: [{ id: '11111111-1111-1111-1111-111111111106', name: 'Cleaner', category: 'Cleaning', icon: 'Sparkles' }],
  },
  {
    id: '33333333-3333-3333-3333-333333333305',
    user_id: '22222222-2222-2222-2222-222222222208',
    name: 'Vikram Patel',
    email: 'vikram.carpenter@workconnect.com',
    phone: '+91 9876500105',
    bio: 'Custom woodwork, hinge repairs, modular shelf assemblies, and door lock installations.',
    experience: 6,
    rating: 4.5,
    review_count: 11,
    price: 400,
    visiting_charge: 149,
    is_available: true,
    is_verified: true,
    address: 'Pragati Maidan, New Delhi',
    latitude: 28.6300,
    longitude: 77.2400,
    services: [{ id: '11111111-1111-1111-1111-111111111104', name: 'Carpenter', category: 'Carpentry', icon: 'Hammer' }],
  },
  {
    id: '33333333-3333-3333-3333-333333333309',
    user_id: '22222222-2222-2222-2222-222222222212',
    name: 'Rajesh Joshi',
    email: 'rajesh.plumber@fixigo.com',
    phone: '+91 9876500109',
    bio: 'Senior master plumber with 12 years expertise in concealed pipe leak detection, CP fitting, water tank lines, and pumps.',
    experience: 12,
    rating: 4.95,
    review_count: 58,
    price: 380,
    visiting_charge: 99,
    is_available: true,
    is_verified: true,
    address: 'Connaught Place, New Delhi',
    latitude: 28.6120,
    longitude: 77.2050,
    services: [{ id: '11111111-1111-1111-1111-111111111102', name: 'Plumber', category: 'Plumbing', icon: 'Wrench' }],
  },
  {
    id: '33333333-3333-3333-3333-333333333310',
    user_id: '22222222-2222-2222-2222-222222222213',
    name: 'Amit Saxena',
    email: 'amit.electrician@fixigo.com',
    phone: '+91 9876500110',
    bio: 'Residential & commercial electrician, circuit breakers, heavy load wiring, inverter setup, and emergency short circuits.',
    experience: 5,
    rating: 4.65,
    review_count: 16,
    price: 280,
    visiting_charge: 99,
    is_available: true,
    is_verified: true,
    address: 'Pahar Ganj, New Delhi',
    latitude: 28.6210,
    longitude: 77.2180,
    services: [{ id: '11111111-1111-1111-1111-111111111101', name: 'Electrician', category: 'Electrical', icon: 'Zap' }],
  },
];

// Haversine spatial distance calculation in Kilometers
export function calculateHaversineKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// Client-side search and ranking engine
export function matchFallbackProfessionals(params = {}) {
  const {
    service,
    serviceId,
    search,
    isAvailable,
    lat,
    lng,
    sortBy = 'best_match',
  } = params;

  let results = [...FALLBACK_PROFESSIONALS];

  // 1. Service filter (case-insensitive substring match)
  if (service && service !== 'all') {
    const sTerm = service.toLowerCase().trim();
    results = results.filter((p) =>
      p.services.some(
        (s) =>
          s.name.toLowerCase().includes(sTerm) ||
          s.category.toLowerCase().includes(sTerm) ||
          sTerm.includes(s.name.toLowerCase())
      )
    );
  }

  // 2. Text Search filter
  if (search) {
    const q = search.toLowerCase().trim();
    results = results.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.bio.toLowerCase().includes(q) ||
        p.address.toLowerCase().includes(q)
    );
  }

  // 3. Availability filter
  if (isAvailable === true || isAvailable === 'true') {
    results = results.filter((p) => p.is_available);
  }

  // 4. Calculate Distance from user location
  const userLat = lat ? parseFloat(lat) : null;
  const userLng = lng ? parseFloat(lng) : null;

  results = results.map((p) => {
    let distance_km = null;
    if (userLat !== null && userLng !== null && p.latitude && p.longitude) {
      distance_km = calculateHaversineKm(userLat, userLng, p.latitude, p.longitude);
    }
    return {
      ...p,
      distance_km,
      isBestMatch: false,
    };
  });

  // 5. Sort & Rank
  if (userLat !== null && userLng !== null) {
    // If distance sort or default, prioritize closest professionals
    results.sort((a, b) => {
      const distA = a.distance_km !== null ? a.distance_km : 9999;
      const distB = b.distance_km !== null ? b.distance_km : 9999;

      if (sortBy === 'distance') {
        return distA - distB;
      }
      if (sortBy === 'rating') {
        return b.rating - a.rating;
      }
      if (sortBy === 'price_asc') {
        return a.price - b.price;
      }
      if (sortBy === 'experience') {
        return b.experience - a.experience;
      }

      // Default: Best Match = distance priority, then rating, then experience
      if (Math.abs(distA - distB) < 15) {
        return b.rating - a.rating || distA - distB;
      }
      return distA - distB;
    });
  } else {
    // No coords provided: sort by rating & experience
    results.sort((a, b) => b.rating - a.rating || b.experience - a.experience);
  }

  // Mark #1 as Best Match
  if (results.length > 0) {
    results[0].isBestMatch = true;
  }

  return {
    total: results.length,
    filter: {
      service: service || 'all',
      hasLocation: !!(userLat && userLng),
      sortBy,
    },
    professionals: results,
  };
}
