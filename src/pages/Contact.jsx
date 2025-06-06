import React, { useState, useEffect } from 'react'
import Hero from '../components/UI/Hero'
import Loading from '../components/UI/Loading'
import { getContacts } from '../services/api'

const Contact = () => {
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchContacts()
  }, [])

  const fetchContacts = async () => {
    try {
      setLoading(true)
      const data = await getContacts()
      setContacts(data)
    } catch (err) {
      console.error('Error fetching contacts:', err)
      setError('Gagal memuat informasi kontak')
    } finally {
      setLoading(false)
    }
  }

  const getContactsByType = (type) => {
    return contacts.filter(contact => contact.type === type)
  }

  const getIconClass = (icon, type) => {
    if (icon) return icon
    
    // Default icons based on type
    switch (type) {
      case 'phone':
        return 'bi bi-telephone'
      case 'email':
        return 'bi bi-envelope'
      case 'location':
        return 'bi bi-geo-alt'
      case 'social':
        return 'bi bi-share'
      default:
        return 'bi bi-info-circle'
    }
  }

  const handleContactClick = (contact) => {
    switch (contact.type) {
      case 'phone':
        window.open(`tel:${contact.value}`, '_self')
        break
      case 'email':
        window.open(`mailto:${contact.value}`, '_self')
        break
      case 'social':
        if (contact.value.startsWith('http')) {
          window.open(contact.value, '_blank')
        }
        break
      case 'location':
        if (contact.value.includes('maps.google.com') || contact.value.includes('goo.gl')) {
          window.open(contact.value, '_blank')
        }
        break
      default:
        break
    }
  }

  if (loading) return <Loading text="Memuat informasi kontak..." />

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger text-center">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </div>
      </div>
    )
  }

  const phoneContacts = getContactsByType('phone')
  const emailContacts = getContactsByType('email')
  const locationContacts = getContactsByType('location')
  const socialContacts = getContactsByType('social')

  return (
    <>
      <Hero 
        title="Hubungi Kami"
        subtitle="Jangan ragu untuk menghubungi kami jika ada pertanyaan atau informasi yang dibutuhkan"
      />
      
      <div className="container py-5">
        <div className="row g-4">
          {/* Phone Contacts */}
          {phoneContacts.length > 0 && (
            <div className="col-lg-6">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body p-4">
                  <div className="d-flex align-items-center mb-3">
                    <div className="bg-primary text-white rounded-circle p-2 me-3">
                      <i className="bi bi-telephone fs-5"></i>
                    </div>
                    <h4 className="card-title mb-0">Telepon</h4>
                  </div>
                  <div className="contact-list">
                    {phoneContacts.map((contact) => (
                      <div 
                        key={contact.id} 
                        className="contact-item p-3 mb-2 bg-light rounded cursor-pointer hover-shadow"
                        onClick={() => handleContactClick(contact)}
                        style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#e9ecef'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                      >
                        <div className="d-flex align-items-center">
                          <i className={`${getIconClass(contact.icon, contact.type)} text-primary me-3`}></i>
                          <div>
                            <h6 className="mb-1">{contact.label}</h6>
                            <p className="mb-0 text-muted">{contact.value}</p>
                          </div>
                          {contact.is_primary && (
                            <span className="badge bg-primary ms-auto">Utama</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Email Contacts */}
          {emailContacts.length > 0 && (
            <div className="col-lg-6">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body p-4">
                  <div className="d-flex align-items-center mb-3">
                    <div className="bg-success text-white rounded-circle p-2 me-3">
                      <i className="bi bi-envelope fs-5"></i>
                    </div>
                    <h4 className="card-title mb-0">Email</h4>
                  </div>
                  <div className="contact-list">
                    {emailContacts.map((contact) => (
                      <div 
                        key={contact.id} 
                        className="contact-item p-3 mb-2 bg-light rounded cursor-pointer hover-shadow"
                        onClick={() => handleContactClick(contact)}
                        style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#e9ecef'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                      >
                        <div className="d-flex align-items-center">
                          <i className={`${getIconClass(contact.icon, contact.type)} text-success me-3`}></i>
                          <div>
                            <h6 className="mb-1">{contact.label}</h6>
                            <p className="mb-0 text-muted">{contact.value}</p>
                          </div>
                          {contact.is_primary && (
                            <span className="badge bg-success ms-auto">Utama</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Location Contacts */}
          {locationContacts.length > 0 && (
            <div className="col-lg-6">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body p-4">
                  <div className="d-flex align-items-center mb-3">
                    <div className="bg-info text-white rounded-circle p-2 me-3">
                      <i className="bi bi-geo-alt fs-5"></i>
                    </div>
                    <h4 className="card-title mb-0">Lokasi</h4>
                  </div>
                  <div className="contact-list">
                    {locationContacts.map((contact) => (
                      <div 
                        key={contact.id} 
                        className="contact-item p-3 mb-2 bg-light rounded cursor-pointer hover-shadow"
                        onClick={() => handleContactClick(contact)}
                        style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#e9ecef'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                      >
                        <div className="d-flex align-items-start">
                          <i className={`${getIconClass(contact.icon, contact.type)} text-info me-3 mt-1`}></i>
                          <div>
                            <h6 className="mb-1">{contact.label}</h6>
                            <p className="mb-0 text-muted">{contact.value}</p>
                          </div>
                          {contact.is_primary && (
                            <span className="badge bg-info ms-auto">Utama</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Social Media Contacts */}
          {socialContacts.length > 0 && (
            <div className="col-lg-6">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body p-4">
                  <div className="d-flex align-items-center mb-3">
                    <div className="bg-warning text-white rounded-circle p-2 me-3">
                      <i className="bi bi-share fs-5"></i>
                    </div>
                    <h4 className="card-title mb-0">Media Sosial</h4>
                  </div>
                  <div className="contact-list">
                    {socialContacts.map((contact) => (
                      <div 
                        key={contact.id} 
                        className="contact-item p-3 mb-2 bg-light rounded cursor-pointer hover-shadow"
                        onClick={() => handleContactClick(contact)}
                        style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#e9ecef'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                      >
                        <div className="d-flex align-items-center">
                          <i className={`${getIconClass(contact.icon, contact.type)} text-warning me-3`}></i>
                          <div>
                            <h6 className="mb-1">{contact.label}</h6>
                            <p className="mb-0 text-muted">{contact.value}</p>
                          </div>
                          {contact.is_primary && (
                            <span className="badge bg-warning ms-auto">Utama</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Empty State */}
        {contacts.length === 0 && (
          <div className="text-center py-5">
            <i className="bi bi-inbox display-1 text-muted mb-3"></i>
            <h4 className="text-muted">Belum Ada Informasi Kontak</h4>
            <p className="text-muted">Informasi kontak akan ditampilkan di sini.</p>
          </div>
        )}

        {/* Additional Contact Form Section */}
        <div className="row mt-5">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4">
                <h4 className="card-title mb-4">
                  <i className="bi bi-chat-dots me-2 text-primary"></i>
                  Kirim Pesan
                </h4>
                <div className="alert alert-info">
                  <i className="bi bi-info-circle me-2"></i>
                  Untuk mengirim pesan atau pertanyaan, silakan hubungi kami melalui kontak di atas atau kunjungi langsung sekolah kami.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Contact