// src/components/Layout/Header.jsx - Modern Version with Animations
import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { getSchoolProfile } from '../../services/api'
import { ROUTES } from '../../utils/constants'

const Header = () => {
  const [schoolProfile, setSchoolProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const location = useLocation()

  useEffect(() => {
    fetchSchoolProfile()
    
    // Add scroll listener for navbar effect
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const fetchSchoolProfile = async () => {
    try {
      const profile = await getSchoolProfile()
      setSchoolProfile(profile)
    } catch (error) {
      console.error('Error fetching school profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const isActive = (path) => {
    return location.pathname === path ? 'active' : ''
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const handleLinkClick = () => {
    setIsMenuOpen(false)
  }

  return (
    <>
      <style>{`
        .modern-navbar {
          backdrop-filter: blur(10px);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .modern-navbar.scrolled {
          background: rgba(255, 255, 255, 0.95) !important;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }
        
        .modern-navbar .navbar-brand {
          font-weight: 700;
          transition: all 0.3s ease;
        }
        
        .modern-navbar .navbar-brand:hover {
          transform: translateY(-2px);
        }
        
        .hamburger {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          width: 24px;
          height: 18px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
        }
        
        .hamburger span {
          display: block;
          height: 2px;
          width: 100%;
          background: #007bff;
          border-radius: 2px;
          transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
          transform-origin: center;
        }
        
        .hamburger.active span:nth-child(1) {
          transform: rotate(45deg) translate(6px, 6px);
        }
        
        .hamburger.active span:nth-child(2) {
          opacity: 0;
          transform: scaleX(0);
        }
        
        .hamburger.active span:nth-child(3) {
          transform: rotate(-45deg) translate(6px, -6px);
        }
        
        .mobile-menu {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          transform: translateX(-100%);
          transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 9999;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }
        
        .mobile-menu.open {
          transform: translateX(0);
        }
        
        .mobile-menu .nav-link {
          color: white !important;
          font-size: 1.8rem;
          font-weight: 600;
          margin: 1rem 0;
          text-decoration: none;
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.3s ease;
        }
        
        .mobile-menu.open .nav-link {
          opacity: 1;
          transform: translateY(0);
        }
        
        .mobile-menu .nav-link:nth-child(1) { transition-delay: 0.1s; }
        .mobile-menu .nav-link:nth-child(2) { transition-delay: 0.2s; }
        .mobile-menu .nav-link:nth-child(3) { transition-delay: 0.3s; }
        .mobile-menu .nav-link:nth-child(4) { transition-delay: 0.4s; }
        .mobile-menu .nav-link:nth-child(5) { transition-delay: 0.5s; }
        .mobile-menu .nav-link:nth-child(6) { transition-delay: 0.6s; }
        
        .mobile-menu .nav-link:hover {
          transform: scale(1.1);
          text-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
        }
        
        .close-btn {
          position: absolute;
          top: 2rem;
          right: 2rem;
          background: none;
          border: none;
          color: white;
          font-size: 2rem;
          cursor: pointer;
          z-index: 10000;
        }
        
        .desktop-nav .nav-link {
          position: relative;
          font-weight: 500;
          transition: all 0.3s ease;
          color: #333 !important;
        }
        
        .desktop-nav .nav-link::after {
          content: '';
          position: absolute;
          bottom: -5px;
          left: 50%;
          width: 0;
          height: 2px;
          background: linear-gradient(45deg, #007bff, #0056b3);
          transition: all 0.3s ease;
          transform: translateX(-50%);
        }
        
        .desktop-nav .nav-link:hover::after,
        .desktop-nav .nav-link.active::after {
          width: 100%;
        }
        
        .desktop-nav .nav-link:hover {
          color: #007bff !important;
          transform: translateY(-2px);
        }
        
        @media (max-width: 991.98px) {
          .desktop-nav {
            display: none;
          }
        }
        
        @media (min-width: 992px) {
          .mobile-menu-btn {
            display: none;
          }
        }
      `}</style>
      
      <header>
        <nav className={`navbar navbar-expand-lg modern-navbar ${isScrolled ? 'scrolled' : ''}`} 
             style={{ background: isScrolled ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.98)' }}>
          <div className="container">
            <Link className="navbar-brand d-flex align-items-center" to={ROUTES.HOME}>
              {schoolProfile?.logo_url && (
                <img 
                  src={schoolProfile.logo_url} 
                  alt="Logo" 
                  height="40" 
                  className="me-2"
                  style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
                />
              )}
              <span className="text-primary">
                {loading ? 'Loading...' : (schoolProfile?.name || 'Sekolah Kami')}
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="desktop-nav">
              <ul className="navbar-nav ms-auto">
                <li className="nav-item">
                  <Link className={`nav-link ${isActive(ROUTES.HOME)}`} to={ROUTES.HOME}>
                    Home
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive(ROUTES.PROFILE)}`} to={ROUTES.PROFILE}>
                    Profil
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive(ROUTES.PPDB)}`} to={ROUTES.PPDB}>
                    PPDB Online
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive(ROUTES.SKILLS)}`} to={ROUTES.SKILLS}>
                    Kompetensi Keahlian
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive(ROUTES.CONTACT)}`} to={ROUTES.CONTACT}>
                    Kontak
                  </Link>
                </li>
                <li className="nav-item">
                  <Link 
                    className={`nav-link text-primary fw-bold ${isActive(ROUTES.LOGIN)}`} 
                    to={ROUTES.LOGIN}
                    style={{ 
                      background: 'linear-gradient(45deg, #007bff, #0056b3)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}
                  >
                    Admin Login
                  </Link>
                </li>
              </ul>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className={`hamburger mobile-menu-btn ${isMenuOpen ? 'active' : ''}`}
              onClick={toggleMenu}
              aria-label="Toggle navigation"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </nav>

        {/* Mobile Full Screen Menu */}
        <div className={`mobile-menu ${isMenuOpen ? 'open' : ''}`}>
          <button className="close-btn" onClick={toggleMenu}>
            ×
          </button>
          
          <Link className={`nav-link ${isActive(ROUTES.HOME)}`} to={ROUTES.HOME} onClick={handleLinkClick}>
            Home
          </Link>
          <Link className={`nav-link ${isActive(ROUTES.PROFILE)}`} to={ROUTES.PROFILE} onClick={handleLinkClick}>
            Profil
          </Link>
          <Link className={`nav-link ${isActive(ROUTES.PPDB)}`} to={ROUTES.PPDB} onClick={handleLinkClick}>
            PPDB Online
          </Link>
          <Link className={`nav-link ${isActive(ROUTES.SKILLS)}`} to={ROUTES.SKILLS} onClick={handleLinkClick}>
            Kompetensi Keahlian
          </Link>
          <Link className={`nav-link ${isActive(ROUTES.CONTACT)}`} to={ROUTES.CONTACT} onClick={handleLinkClick}>
            Kontak
          </Link>
          <Link className={`nav-link ${isActive(ROUTES.LOGIN)}`} to={ROUTES.LOGIN} onClick={handleLinkClick}>
            Admin Login
          </Link>
        </div>
      </header>
    </>
  )
}

export default Header