// src/components/Layout/Footer.jsx
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getSchoolProfile, getContacts } from '../../services/api'
import { ROUTES } from '../../utils/constants'

const Footer = () => {
  const [schoolProfile, setSchoolProfile] = useState(null)
  const [contacts, setContacts] = useState([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [profile, contactsData] = await Promise.all([
        getSchoolProfile(),
        getContacts()
      ])
      setSchoolProfile(profile)
      setContacts(contactsData)
    } catch (error) {
      console.error('Error fetching footer data:', error)
    }
  }

  const getContactsByType = (type) => {
    return contacts.filter(contact => contact.type === type)
  }

  return (
    <footer className="footer-section py-5">
      <div className="container">
        <div className="row">
          <div className="col-lg-4 mb-4">
            <h5 className="text-white mb-3">
              {schoolProfile?.name || 'Sekolah Kami'}
            </h5>
            <p className="text-light mb-3">
              {schoolProfile?.description || 'Mencerdaskan generasi bangsa dengan pendidikan berkualitas'}
            </p>
            <div className="d-flex gap-2">
              {getContactsByType('social').map((social) => (
                <a 
                  key={social.id}
                  href={social.value} 
                  className="btn btn-outline-light btn-sm"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className={social.icon || 'bi bi-link'}></i>
                </a>
              ))}
            </div>
          </div>

          <div className="col-lg-2 mb-4">
            <h6 className="text-white mb-3">Menu Utama</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to={ROUTES.HOME} className="text-light text-decoration-none">
                  Home
                </Link>
              </li>
              <li className="mb-2">
                <Link to={ROUTES.PROFILE} className="text-light text-decoration-none">
                  Profil
                </Link>
              </li>
              <li className="mb-2">
                <Link to={ROUTES.SKILLS} className="text-light text-decoration-none">
                  Kompetensi Keahlian
                </Link>
              </li>
              <li className="mb-2">
                <Link to={ROUTES.CONTACT} className="text-light text-decoration-none">
                  Kontak
                </Link>
              </li>
            </ul>
          </div>

          <div className="col-lg-3 mb-4">
            <h6 className="text-white mb-3">Informasi</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to={ROUTES.PPDB} className="text-light text-decoration-none">
                  PPDB Online
                </Link>
              </li>
              <li className="mb-2">
                <span className="text-light">Berita & Pengumuman</span>
              </li>
              <li className="mb-2">
                <span className="text-light">Galeri</span>
              </li>
            </ul>
          </div>

          <div className="col-lg-3 mb-4">
            <h6 className="text-white mb-3">Kontak Kami</h6>
            <div className="text-light">
              {getContactsByType('location').map((location) => (
                <div key={location.id} className="mb-2">
                  <i className="bi bi-geo-alt me-2"></i>
                  <small>{location.value}</small>
                </div>
              ))}
              {getContactsByType('phone').map((phone) => (
                <div key={phone.id} className="mb-2">
                  <i className="bi bi-telephone me-2"></i>
                  <small>{phone.value}</small>
                </div>
              ))}
              {getContactsByType('email').map((email) => (
                <div key={email.id} className="mb-2">
                  <i className="bi bi-envelope me-2"></i>
                  <small>{email.value}</small>
                </div>
              ))}
            </div>
          </div>
        </div>

        <hr className="my-4 border-light" />
        
        <div className="row align-items-center">
          <div className="col-md-6">
            <p className="text-light mb-0">
              © {new Date().getFullYear()} {schoolProfile?.name || 'Sekolah Kami'}. 
              All rights reserved.
            </p>
          </div>
          <div className="col-md-6 text-md-end">
            <p className="text-light mb-0 small">
              Powered by React & Supabase
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer