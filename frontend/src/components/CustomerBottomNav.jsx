import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, ClipboardList, Headphones, User } from 'lucide-react';

export default function CustomerBottomNav({ activeTab, onTabChange }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleTabClick = (tab) => {
    if (onTabChange) {
      onTabChange(tab);
      return;
    }

    if (tab === 'home') {
      navigate('/');
    } else if (tab === 'orders') {
      navigate('/orders');
    } else if (tab === 'support') {
      navigate('/support');
    } else if (tab === 'profile') {
      navigate('/profile');
    }
  };

  const getIsActive = (tab) => {
    if (activeTab === tab) return true;
    const path = location.pathname;
    const search = location.search;

    if (tab === 'home') {
      return path === '/' || path === '/services';
    }
    if (tab === 'orders') {
      return path === '/orders' || (path === '/customer' && (!search || search.includes('tab=orders')));
    }
    if (tab === 'support') {
      return path === '/support' || (path === '/customer' && search.includes('tab=support'));
    }
    if (tab === 'profile') {
      return path === '/profile' || (path === '/customer' && search.includes('tab=profile'));
    }
    return false;
  };

  return (
    <nav className="sabfix-bottom-nav" aria-label="Customer navigation">
      <button
        type="button"
        className={`bottom-nav-item ${getIsActive('home') ? 'active' : ''}`}
        onClick={() => handleTabClick('home')}
      >
        <Home size={22} />
        <span>Home</span>
      </button>

      <button
        type="button"
        className={`bottom-nav-item ${getIsActive('orders') ? 'active' : ''}`}
        onClick={() => handleTabClick('orders')}
      >
        <ClipboardList size={22} />
        <span>Orders</span>
      </button>

      <button
        type="button"
        className={`bottom-nav-item ${getIsActive('support') ? 'active' : ''}`}
        onClick={() => handleTabClick('support')}
      >
        <Headphones size={22} />
        <span>Support</span>
      </button>

      <button
        type="button"
        className={`bottom-nav-item ${getIsActive('profile') ? 'active' : ''}`}
        onClick={() => handleTabClick('profile')}
      >
        <User size={22} />
        <span>Profile</span>
      </button>
    </nav>
  );
}
