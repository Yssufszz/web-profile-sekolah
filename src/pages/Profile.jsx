import React, { useState, useEffect } from 'react'
import Hero from '../components/UI/Hero'
import Loading from '../components/UI/Loading'
import { getSchoolProfile } from '../services/api'

const Profile = () => {
  const [schoolProfile, setSchoolProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSchoolProfile()
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

  if (loading) {
    return <Loading text="Memuat profil sekolah..." />
  }

  if (!schoolProfile) {
    return (
      <div className="container py-5">
        <div className="alert alert-warning text-center">
          <h4>Profil sekolah belum tersedia</h4>
          <p>Silakan hubungi administrator untuk informasi lebih lanjut.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="profile-page">
      <Hero
        title="Profil Sekolah"
        subtitle={schoolProfile.name}
        backgroundImage={schoolProfile.header_image_url}
      />

      <section className="py-5">
        <div className="container">
          <div className="row">
            <div className="col-lg-8 mx-auto">
              {/* About Section */}
              <div className="mb-5">
                <h2 className="fw-bold mb-4">Tentang Sekolah</h2>
                <p className="lead">{schoolProfile.description}</p>
              </div>

              {/* Vision Mission */}
              <div className="row mb-5">
                <div className="col-md-6 mb-4">
                  <div className="card h-100 border-0 shadow-sm">
                    <div className="card-body">
                      <h4 className="text-primary mb-3">
                        <i className="bi bi-eye me-2"></i>
                        Visi
                      </h4>
                      <p>{schoolProfile.vision}</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 mb-4">
                  <div className="card h-100 border-0 shadow-sm">
                    <div className="card-body">
                      <h4 className="text-primary mb-3">
                        <i className="bi bi-bullseye me-2"></i>
                        Misi
                      </h4>
                      <p>{schoolProfile.mission}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* School Info */}
              <div className="row mb-5">
                <div className="col-12">
                  <h3 className="fw-bold mb-4">Informasi Sekolah</h3>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <div className="d-flex align-items-center">
                        <i className="bi bi-calendar-event text-primary me-3"></i>
                        <div>
                          <strong>Tahun Berdiri:</strong><br />
                          {schoolProfile.established_year}
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6 mb-3">
                      <div className="d-flex align-items-center">
                        <i className="bi bi-award text-primary me-3"></i>
                        <div>
                          <strong>Akreditasi:</strong><br />
                          {schoolProfile.accreditation}
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6 mb-3">
                      <div className="d-flex align-items-center">
                        <i className="bi bi-geo-alt text-primary me-3"></i>
                        <div>
                          <strong>Alamat:</strong><br />
                          {schoolProfile.address}
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6 mb-3">
                      <div className="d-flex align-items-center">
                        <i className="bi bi-telephone text-primary me-3"></i>
                        <div>
                          <strong>Telepon:</strong><br />
                          {schoolProfile.phone}
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6 mb-3">
                      <div className="d-flex align-items-center">
                        <i className="bi bi-envelope text-primary me-3"></i>
                        <div>
                          <strong>Email:</strong><br />
                          <a href={`mailto:${schoolProfile.email}`} className="text-decoration-none">
                            {schoolProfile.email}
                          </a>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6 mb-3">
                      <div className="d-flex align-items-center">
                        <i className="bi bi-globe text-primary me-3"></i>
                        <div>
                          <strong>Website:</strong><br />
                          <a href={schoolProfile.website} target="_blank" rel="noopener noreferrer" className="text-decoration-none">
                            {schoolProfile.website}
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Profile