import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Camera,
  Zap,
  Briefcase,
  Clock,
  IndianRupee,
  MapPin,
  ChevronDown,
  ChevronRight,
  FileText,
  CreditCard,
  Plus,
  CheckCircle,
} from 'lucide-react';
import MobileStatusBar from '../components/MobileStatusBar';
import { useAuth } from '../context/AuthContext';
import { useLocationContext } from '../context/LocationContext';
import LocationPickerMap from '../components/LocationPickerMap';
import { userAPI } from '../services/api';

export default function CompleteProfilePage() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const { userLocation } = useLocationContext();
  const [category, setCategory] = useState('Electrician');
  const [experience, setExperience] = useState('3+ Years');
  const [hourlyCharge, setHourlyCharge] = useState('500');
  const [serviceAreas, setServiceAreas] = useState(userLocation?.address || 'Agra, Greater Noida, Noida');
  const [proCoords, setProCoords] = useState({
    lat: userLocation?.latitude || 27.1767,
    lng: userLocation?.longitude || 78.0081,
  });
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [aadhaarUploaded, setAadhaarUploaded] = useState(true);
  const [idProofUploaded, setIdProofUploaded] = useState(true);
  const [certUploaded, setCertUploaded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const expYears = parseInt(experience, 10) || 3;
      const priceNum = parseFloat(hourlyCharge) || 500;
      await userAPI.updateProfessionalProfile({
        bio: `Verified master ${category} with ${experience} experience serving ${serviceAreas}.`,
        experience: expYears,
        price: priceNum,
        address: serviceAreas,
        latitude: proCoords?.lat,
        longitude: proCoords?.lng,
      });
      navigate('/professional');
    } catch (err) {
      // Even if backend call fails or offline, continue to professional dashboard
      navigate('/professional');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="sabfix-app-wrapper">
      <div className="sabfix-mobile-shell" style={{ paddingBottom: '2.5rem' }}>
        <MobileStatusBar />

        {/* Top Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '1rem 1.25rem 0.5rem',
            gap: '12px',
          }}
        >
          <button
            type="button"
            onClick={() => navigate(-1)}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: '#ffffff',
              border: '1px solid #eae5dd',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-main)',
            }}
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-main)', margin: 0 }}>
              Complete Your Profile
            </h1>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
              Let customers know about you
            </p>
          </div>
        </div>

        {/* Profile Avatar Upload */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            padding: '1rem 0 1.25rem',
          }}
        >
          <div style={{ position: 'relative' }}>
            <div
              style={{
                width: '84px',
                height: '84px',
                borderRadius: '50%',
                overflow: 'hidden',
                border: '3px solid #ff6a00',
                backgroundColor: '#fff4ea',
                boxShadow: '0 4px 12px rgba(255, 106, 0, 0.15)',
              }}
            >
              <img
                src="/pro-arrived-avatar.png"
                alt="Profile photo"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <button
              type="button"
              onClick={() => alert('Photo upload simulated')}
              style={{
                position: 'absolute',
                bottom: '0',
                right: '0',
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: '#1e2430',
                color: '#ffffff',
                border: '2px solid #ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <Camera size={14} />
            </button>
          </div>
        </div>

        {/* Profile Setup Form */}
        <form onSubmit={handleSave} style={{ padding: '0 1.25rem', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Service Category */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #eae5dd',
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  backgroundColor: '#fff4ea',
                  color: '#ff6a00',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Zap size={18} />
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-light)', display: 'block', fontWeight: 600 }}>
                  Service Category
                </span>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{
                    border: 'none',
                    outline: 'none',
                    fontWeight: 700,
                    fontSize: '0.92rem',
                    color: 'var(--text-main)',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                  }}
                >
                  <option value="Electrician">Electrician</option>
                  <option value="Plumber">Plumber</option>
                  <option value="AC Repairer">AC Repair</option>
                  <option value="Carpenter">Carpenter</option>
                  <option value="Painter">Painter</option>
                  <option value="Cleaner">Cleaner</option>
                  <option value="Appliance Repairer">Appliance Repair</option>
                  <option value="Mechanic">Mechanic</option>
                </select>
              </div>
            </div>
            <ChevronDown size={18} color="var(--text-light)" />
          </div>

          {/* Experience */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #eae5dd',
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  backgroundColor: '#f1f5f9',
                  color: '#475569',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Clock size={18} />
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-light)', display: 'block', fontWeight: 600 }}>
                  Experience
                </span>
                <select
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  style={{
                    border: 'none',
                    outline: 'none',
                    fontWeight: 700,
                    fontSize: '0.92rem',
                    color: 'var(--text-main)',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                  }}
                >
                  <option value="1+ Years">1+ Years</option>
                  <option value="2+ Years">2+ Years</option>
                  <option value="3+ Years">3+ Years</option>
                  <option value="5+ Years">5+ Years</option>
                  <option value="10+ Years">10+ Years</option>
                </select>
              </div>
            </div>
            <ChevronDown size={18} color="var(--text-light)" />
          </div>

          {/* Hourly Charge */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #eae5dd',
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: '#ecfdf5',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IndianRupee size={18} />
            </div>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-light)', display: 'block', fontWeight: 600 }}>
                Hourly Charge (₹)
              </span>
              <input
                type="number"
                value={hourlyCharge}
                onChange={(e) => setHourlyCharge(e.target.value)}
                style={{
                  border: 'none',
                  outline: 'none',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  color: 'var(--text-main)',
                  width: '100%',
                  background: 'transparent',
                }}
              />
            </div>
          </div>

          {/* Service Areas */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #eae5dd',
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  backgroundColor: '#fff4ea',
                  color: '#ff6a00',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <MapPin size={18} />
              </div>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-light)', display: 'block', fontWeight: 600 }}>
                  Service Areas
                </span>
                <input
                  type="text"
                  value={serviceAreas}
                  onChange={(e) => setServiceAreas(e.target.value)}
                  style={{
                    border: 'none',
                    outline: 'none',
                    fontWeight: 700,
                    fontSize: '0.92rem',
                    color: 'var(--text-main)',
                    width: '100%',
                    background: 'transparent',
                  }}
                />
              </div>
              <button
                type="button"
                onClick={() => setShowMapPicker(!showMapPicker)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary, #ff6a00)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '4px',
                }}
                title={showMapPicker ? 'Hide Map Picker' : 'Set Exact Location on Map'}
              >
                <ChevronRight size={18} color={showMapPicker ? '#ff6a00' : 'var(--text-light)'} style={{ transform: showMapPicker ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
              </button>
            </div>
            {showMapPicker && (
              <div
                style={{
                  marginTop: '0.65rem',
                  padding: '0.65rem',
                  background: '#ffffff',
                  borderRadius: '16px',
                  border: '1px solid #bfdbfe',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
                }}
              >
                <LocationPickerMap
                  initialLat={proCoords.lat}
                  initialLng={proCoords.lng}
                  initialAddress={serviceAreas}
                  height="240px"
                  title="Pin Operating Base Location"
                  helpText="Drag pin or search to set your service area base"
                  onLocationSelect={(loc) => {
                    setProCoords({ lat: loc.latitude, lng: loc.longitude });
                    if (loc.address) setServiceAreas(loc.address);
                  }}
                />
              </div>
            )}
          </div>

          {/* Upload Documents Section */}
          <div style={{ marginTop: '0.5rem' }}>
            <h3 style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '10px' }}>
              Upload Documents
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              {/* Aadhaar Card */}
              <div
                onClick={() => setAadhaarUploaded(!aadhaarUploaded)}
                style={{
                  backgroundColor: aadhaarUploaded ? '#fff4ea' : '#ffffff',
                  border: `1.5px solid ${aadhaarUploaded ? '#ff6a00' : '#eae5dd'}`,
                  borderRadius: '14px',
                  padding: '12px 8px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                <CreditCard size={22} color={aadhaarUploaded ? '#ff6a00' : '#64748b'} />
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Aadhaar
                </span>
                {aadhaarUploaded && <CheckCircle size={14} color="#16a34a" fill="#16a34a" color2="white" />}
              </div>

              {/* ID Proof */}
              <div
                onClick={() => setIdProofUploaded(!idProofUploaded)}
                style={{
                  backgroundColor: idProofUploaded ? '#fff4ea' : '#ffffff',
                  border: `1.5px solid ${idProofUploaded ? '#ff6a00' : '#eae5dd'}`,
                  borderRadius: '14px',
                  padding: '12px 8px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                <FileText size={22} color={idProofUploaded ? '#ff6a00' : '#64748b'} />
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  ID Proof
                </span>
                {idProofUploaded && <CheckCircle size={14} color="#16a34a" fill="#16a34a" />}
              </div>

              {/* Certifications */}
              <div
                onClick={() => setCertUploaded(!certUploaded)}
                style={{
                  backgroundColor: certUploaded ? '#fff4ea' : '#ffffff',
                  border: `1.5px dashed ${certUploaded ? '#ff6a00' : '#cbd5e1'}`,
                  borderRadius: '14px',
                  padding: '12px 8px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                <Plus size={22} color={certUploaded ? '#ff6a00' : '#64748b'} />
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Certifications
                </span>
                {certUploaded && <CheckCircle size={14} color="#16a34a" fill="#16a34a" />}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: '100%',
              backgroundColor: 'var(--primary)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '14px',
              padding: '14px',
              fontSize: '1rem',
              fontWeight: 800,
              cursor: 'pointer',
              marginTop: '1rem',
              boxShadow: '0 4px 14px rgba(255, 106, 0, 0.35)',
              transition: 'background-color 0.15s ease',
            }}
          >
            {isSubmitting ? 'Saving Profile...' : 'Save & Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}
