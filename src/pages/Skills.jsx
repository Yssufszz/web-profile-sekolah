import React, { useState, useEffect } from 'react'
import Hero from '../components/UI/Hero'
import Card from '../components/UI/Card'
import Loading from '../components/UI/Loading'
import { getActiveSkills } from '../services/api'

const Skills = () => {
  const [skills, setSkills] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedSkill, setSelectedSkill] = useState(null)

  useEffect(() => {
    fetchSkills()
  }, [])

  const fetchSkills = async () => {
    try {
      setLoading(true)
      const data = await getActiveSkills()
      setSkills(data)
    } catch (err) {
      console.error('Error fetching skills:', err)
      setError('Gagal memuat data kompetensi keahlian')
    } finally {
      setLoading(false)
    }
  }

  const handleSkillClick = (skill) => {
    setSelectedSkill(skill)
  }

  const closeModal = () => {
    setSelectedSkill(null)
  }

  if (loading) {
    return <Loading text="Memuat kompetensi keahlian..." />
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger text-center">
          <h4>Terjadi Kesalahan</h4>
          <p>{error}</p>
          <button 
            className="btn btn-primary mt-3" 
            onClick={fetchSkills}
          >
            Coba Lagi
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <Hero
        title="Kompetensi Keahlian"
        subtitle="Program keahlian yang tersedia di sekolah kami untuk mempersiapkan siswa menjadi tenaga kerja yang kompeten dan siap menghadapi dunia industri"
        backgroundImage="hero-skills.jpg"
      />

      <section className="py-5">
        <div className="container">
          {skills.length === 0 ? (
            <div className="text-center py-5">
              <div className="mb-4">
                <i className="fas fa-graduation-cap fa-4x text-muted"></i>
              </div>
              <h4 className="text-muted">Belum Ada Program Keahlian</h4>
              <p className="text-muted">
                Program kompetensi keahlian akan segera tersedia.
              </p>
            </div>
          ) : (
            <>
              <div className="row mb-5">
                <div className="col-lg-8 mx-auto text-center">
                  <h2 className="fw-bold mb-3">Program Kompetensi Keahlian</h2>
                  <p className="lead text-muted">
                    Pilih program keahlian yang sesuai dengan minat dan bakat Anda. 
                    Setiap program dirancang untuk memberikan keterampilan praktis 
                    yang dibutuhkan di dunia kerja.
                  </p>
                </div>
              </div>

              <div className="row g-4">
                {skills.map((skill) => (
                  <div key={skill.id} className="col-md-6 col-lg-4">
                    <Card
                      image={skill.image_url}
                      title={skill.name}
                      description={skill.description}
                      onClick={() => handleSkillClick(skill)}
                      className="h-100"
                      footer={
                        <div className="d-flex justify-content-between align-items-center">
                          <small className="text-muted">
                            <i className="fas fa-clock me-1"></i>
                            Durasi Program
                          </small>
                          <span className="badge bg-primary">
                            {skill.duration_years ? `${skill.duration_years} Tahun` : '3 Tahun'}
                          </span>
                        </div>
                      }
                    />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Modal Detail Skill */}
      {selectedSkill && (
        <div 
          className="modal fade show" 
          style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={closeModal}
        >
          <div 
            className="modal-dialog modal-lg modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">{selectedSkill.name}</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={closeModal}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                {selectedSkill.image_url && (
                  <img 
                    src={selectedSkill.image_url}
                    alt={selectedSkill.name}
                    className="img-fluid rounded mb-4 w-100"
                    style={{ height: '300px', objectFit: 'cover' }}
                  />
                )}
                
                <div className="row">
                  <div className="col-md-8">
                    <h6 className="fw-bold mb-3">Deskripsi Program</h6>
                    <p className="text-muted mb-4">
                      {selectedSkill.description || 'Deskripsi program akan segera tersedia.'}
                    </p>

                    {selectedSkill.subjects && selectedSkill.subjects.length > 0 && (
                      <>
                        <h6 className="fw-bold mb-3">Mata Pelajaran</h6>
                        <div className="mb-4">
                          {selectedSkill.subjects.map((subject, index) => (
                            <span key={index} className="badge bg-light text-dark me-2 mb-2">
                              {subject}
                            </span>
                          ))}
                        </div>
                      </>
                    )}

                    {selectedSkill.career_prospects && selectedSkill.career_prospects.length > 0 && (
                      <>
                        <h6 className="fw-bold mb-3">Prospek Karier</h6>
                        <ul className="list-unstyled">
                          {selectedSkill.career_prospects.map((prospect, index) => (
                            <li key={index} className="text-muted mb-2">
                              <i className="fas fa-check-circle text-success me-2"></i>
                              {prospect}
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                  
                  <div className="col-md-4">
                    <div className="bg-light rounded p-3">
                      <h6 className="fw-bold mb-3">Informasi Program</h6>
                      
                      <div className="mb-3">
                        <small className="text-muted d-block">Durasi Program</small>
                        <span className="fw-semibold">
                          {selectedSkill.duration_years ? `${selectedSkill.duration_years} Tahun` : '3 Tahun'}
                        </span>
                      </div>

                      {selectedSkill.facilities && selectedSkill.facilities.length > 0 && (
                        <div className="mb-3">
                          <small className="text-muted d-block mb-2">Fasilitas</small>
                          {selectedSkill.facilities.map((facility, index) => (
                            <div key={index} className="mb-1">
                              <small className="text-muted">
                                <i className="fas fa-cog text-primary me-1"></i>
                                {facility}
                              </small>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={closeModal}
                >
                  Tutup
                </button>
                <a 
                  href="/ppdb" 
                  className="btn btn-primary"
                >
                  Daftar Sekarang
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Skills