// src/pages/PPDB.jsx
import React, { useState, useEffect } from 'react'
import Hero from '../components/UI/Hero'
import Loading from '../components/UI/Loading'
import { 
  getActivePPDBPeriod, 
  getActiveSkills, 
  submitPPDBRegistration,
  uploadFile 
} from '../services/api'
import { STORAGE_BUCKETS } from '../utils/constants'
import { generateRegistrationNumber, validateEmail, validatePhone } from '../utils/helpers'

const PPDB = () => {
  const [ppdbPeriod, setPpdbPeriod] = useState(null)
  const [skills, setSkills] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    student_name: '',
    student_email: '',
    student_phone: '',
    parent_name: '',
    parent_phone: '',
    parent_email: '',
    birth_date: '',
    birth_place: '',
    gender: '',
    address: '',
    previous_school: '',
    chosen_skill_id: ''
  })
  const [documents, setDocuments] = useState({
    ktp: null,
    kk: null,
    ijazah: null,
    foto: null
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    fetchPPDBData()
  }, [])

  const fetchPPDBData = async () => {
    try {
      const [period, skillsData] = await Promise.all([
        getActivePPDBPeriod(),
        getActiveSkills()
      ])
      setPpdbPeriod(period)
      setSkills(skillsData)
      
      // Debug: log the period data
      console.log('PPDB Period:', period)
      if (period) {
        console.log('Registration Start:', period.registration_start)
        console.log('Registration End:', period.registration_end)
        console.log('Current Date:', new Date().toISOString())
      }
    } catch (error) {
      console.error('Error fetching PPDB data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleFileChange = (e) => {
    const { name, files } = e.target
    if (files[0]) {
      setDocuments(prev => ({ ...prev, [name]: files[0] }))
      if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: '' }))
      }
    }
  }

  const validateForm = () => {
    const newErrors = {}

    // Required fields validation
    const requiredFields = [
      'student_name', 'student_email', 'student_phone', 'parent_name', 
      'parent_phone', 'birth_date', 'birth_place', 'gender', 'address', 
      'previous_school', 'chosen_skill_id'
    ]

    requiredFields.forEach(field => {
      if (!formData[field]) {
        newErrors[field] = 'Field ini wajib diisi'
      }
    })

    // Email validation
    if (formData.student_email && !validateEmail(formData.student_email)) {
      newErrors.student_email = 'Format email tidak valid'
    }
    if (formData.parent_email && !validateEmail(formData.parent_email)) {
      newErrors.parent_email = 'Format email tidak valid'
    }

    // Phone validation
    if (formData.student_phone && !validatePhone(formData.student_phone)) {
      newErrors.student_phone = 'Format nomor telepon tidak valid'
    }
    if (formData.parent_phone && !validatePhone(formData.parent_phone)) {
      newErrors.parent_phone = 'Format nomor telepon tidak valid'
    }

    // Document validation
    const requiredDocs = ['ktp', 'kk', 'ijazah', 'foto']
    requiredDocs.forEach(doc => {
      if (!documents[doc]) {
        newErrors[doc] = 'Dokumen ini wajib diunggah'
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setSubmitting(true)
    
    try {
      // Upload documents
      const documentUrls = {}
      const registrationNumber = generateRegistrationNumber()
      
      for (const [key, file] of Object.entries(documents)) {
        if (file) {
          const fileName = `${registrationNumber}/${key}_${Date.now()}.${file.name.split('.').pop()}`
          const uploadResult = await uploadFile(STORAGE_BUCKETS.PPDB_DOCUMENTS, fileName, file)
          documentUrls[`${key}_url`] = uploadResult.path
        }
      }

      // Submit registration
      const registrationData = {
        period_id: ppdbPeriod.id,
        registration_number: registrationNumber,
        ...formData,
        documents: documentUrls
      }

      await submitPPDBRegistration(registrationData)
      setSuccess(true)
      setShowForm(false)
      
      // Reset form
      setFormData({
        student_name: '', student_email: '', student_phone: '',
        parent_name: '', parent_phone: '', parent_email: '',
        birth_date: '', birth_place: '', gender: '', address: '',
        previous_school: '', chosen_skill_id: ''
      })
      setDocuments({ ktp: null, kk: null, ijazah: null, foto: null })
      
    } catch (error) {
      console.error('Error submitting registration:', error)
      alert('Terjadi kesalahan saat mendaftar. Silakan coba lagi.')
    } finally {
      setSubmitting(false)
    }
  }

  // Helper function to check registration status
  const getRegistrationStatus = () => {
    if (!ppdbPeriod) return { isOpen: false, message: 'Tidak ada periode aktif' }
    
    const now = new Date()
    const startDate = new Date(ppdbPeriod.registration_start)
    const endDate = new Date(ppdbPeriod.registration_end)
    
    // Set time to compare dates properly
    now.setHours(0, 0, 0, 0)
    startDate.setHours(0, 0, 0, 0)
    endDate.setHours(23, 59, 59, 999)
    
    console.log('Date comparison:')
    console.log('Now:', now.toISOString())
    console.log('Start:', startDate.toISOString())
    console.log('End:', endDate.toISOString())
    console.log('Is after start?', now >= startDate)
    console.log('Is before end?', now <= endDate)
    
    if (now < startDate) {
      return { 
        isOpen: false, 
        message: `Pendaftaran akan dibuka pada ${startDate.toLocaleDateString('id-ID')}` 
      }
    }
    
    if (now > endDate) {
      return { 
        isOpen: false, 
        message: `Pendaftaran telah ditutup pada ${endDate.toLocaleDateString('id-ID')}` 
      }
    }
    
    return { isOpen: true, message: 'Pendaftaran sedang dibuka' }
  }

  if (loading) {
    return <Loading text="Memuat informasi PPDB..." />
  }

  if (!ppdbPeriod) {
    return (
      <div>
        <Hero
          title="PPDB Online"
          subtitle="Penerimaan Peserta Didik Baru"
        />
        <div className="container py-5">
          <div className="alert alert-info text-center">
            <h4>Pendaftaran Belum Dibuka</h4>
            <p>Saat ini belum ada periode pendaftaran yang aktif. Silakan pantau pengumuman resmi untuk informasi pembukaan pendaftaran.</p>
          </div>
        </div>
      </div>
    )
  }

  const registrationStatus = getRegistrationStatus()

  return (
    <div className="ppdb-page">
      <Hero
        title="PPDB Online"
        subtitle={`Tahun Ajaran ${ppdbPeriod.academic_year}`}
      />

      <section className="py-5">
        <div className="container">
          {success && (
            <div className="alert alert-success text-center mb-5">
              <h4>Pendaftaran Berhasil!</h4>
              <p>Terima kasih telah mendaftar. Silakan pantau email untuk informasi selanjutnya.</p>
            </div>
          )}

          <div className="row">
            <div className="col-lg-8 mx-auto">
              {/* Registration Info */}
              <div className="card mb-5">
                <div className="card-body">
                  <h3 className="card-title text-center mb-4">Informasi Pendaftaran</h3>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <strong>Periode Pendaftaran:</strong><br />
                      {new Date(ppdbPeriod.registration_start).toLocaleDateString('id-ID')} - 
                      {new Date(ppdbPeriod.registration_end).toLocaleDateString('id-ID')}
                    </div>
                    <div className="col-md-6 mb-3">
                      <strong>Pengumuman:</strong><br />
                      {ppdbPeriod.announcement_date ? 
                        new Date(ppdbPeriod.announcement_date).toLocaleDateString('id-ID') : 
                        'Akan diumumkan'
                      }
                    </div>
                    <div className="col-md-6 mb-3">
                      <strong>Kuota:</strong><br />
                      {ppdbPeriod.max_students} siswa
                    </div>
                    <div className="col-md-6 mb-3">
                      <strong>Biaya Pendaftaran:</strong><br />
                      Rp {ppdbPeriod.registration_fee?.toLocaleString('id-ID') || '0'}
                    </div>
                  </div>
                  
                  {/* Registration Status Info */}
                  <div className="mt-4">
                    <div className={`alert ${registrationStatus.isOpen ? 'alert-success' : 'alert-warning'}`}>
                      <strong>Status: </strong>{registrationStatus.message}
                    </div>
                  </div>

                  {/* Requirements */}
                  {ppdbPeriod.requirements && ppdbPeriod.requirements.length > 0 && (
                    <div className="mt-4">
                      <h5>Persyaratan:</h5>
                      <ul>
                        {ppdbPeriod.requirements.map((req, index) => (
                          <li key={index}>{req}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Documents Needed */}
                  {ppdbPeriod.documents_needed && ppdbPeriod.documents_needed.length > 0 && (
                    <div className="mt-4">
                      <h5>Dokumen yang Diperlukan:</h5>
                      <ul>
                        {ppdbPeriod.documents_needed.map((doc, index) => (
                          <li key={index}>{doc}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Registration Button */}
              <div className="text-center mb-5">
                {registrationStatus.isOpen ? (
                  !showForm ? (
                    <button 
                      className="btn btn-primary btn-lg"
                      onClick={() => setShowForm(true)}
                    >
                      Mulai Pendaftaran
                    </button>
                  ) : (
                    <button 
                      className="btn btn-secondary btn-lg"
                      onClick={() => setShowForm(false)}
                    >
                      Batal Mendaftar
                    </button>
                  )
                ) : (
                  <div className="alert alert-warning">
                    <h5>Pendaftaran Tutup</h5>
                    <p className="mb-0">{registrationStatus.message}</p>
                  </div>
                )}
              </div>

              {/* Registration Form */}
              {showForm && registrationStatus.isOpen && (
                <div className="card">
                  <div className="card-body">
                    <h4 className="card-title mb-4">Formulir Pendaftaran</h4>
                    <form onSubmit={handleSubmit}>
                      {/* Student Information */}
                      <div className="row mb-4">
                        <div className="col-12">
                          <h5 className="text-primary border-bottom pb-2 mb-3">Data Siswa</h5>
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Nama Lengkap *</label>
                          <input
                            type="text"
                            className={`form-control ${errors.student_name ? 'is-invalid' : ''}`}
                            name="student_name"
                            value={formData.student_name}
                            onChange={handleInputChange}
                            placeholder="Masukkan nama lengkap"
                          />
                          {errors.student_name && (
                            <div className="invalid-feedback">{errors.student_name}</div>
                          )}
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Email Siswa *</label>
                          <input
                            type="email"
                            className={`form-control ${errors.student_email ? 'is-invalid' : ''}`}
                            name="student_email"
                            value={formData.student_email}
                            onChange={handleInputChange}
                            placeholder="example@email.com"
                          />
                          {errors.student_email && (
                            <div className="invalid-feedback">{errors.student_email}</div>
                          )}
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label">No. HP Siswa *</label>
                          <input
                            type="tel"
                            className={`form-control ${errors.student_phone ? 'is-invalid' : ''}`}
                            name="student_phone"
                            value={formData.student_phone}
                            onChange={handleInputChange}
                            placeholder="08xxxxxxxxxx"
                          />
                          {errors.student_phone && (
                            <div className="invalid-feedback">{errors.student_phone}</div>
                          )}
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Jenis Kelamin *</label>
                          <select
                            className={`form-select ${errors.gender ? 'is-invalid' : ''}`}
                            name="gender"
                            value={formData.gender}
                            onChange={handleInputChange}
                          >
                            <option value="">Pilih jenis kelamin</option>
                            <option value="L">Laki-laki</option>
                            <option value="P">Perempuan</option>
                          </select>
                          {errors.gender && (
                            <div className="invalid-feedback">{errors.gender}</div>
                          )}
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Tanggal Lahir *</label>
                          <input
                            type="date"
                            className={`form-control ${errors.birth_date ? 'is-invalid' : ''}`}
                            name="birth_date"
                            value={formData.birth_date}
                            onChange={handleInputChange}
                          />
                          {errors.birth_date && (
                            <div className="invalid-feedback">{errors.birth_date}</div>
                          )}
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Tempat Lahir *</label>
                          <input
                            type="text"
                            className={`form-control ${errors.birth_place ? 'is-invalid' : ''}`}
                            name="birth_place"
                            value={formData.birth_place}
                            onChange={handleInputChange}
                            placeholder="Kota tempat lahir"
                          />
                          {errors.birth_place && (
                            <div className="invalid-feedback">{errors.birth_place}</div>
                          )}
                        </div>
                        <div className="col-12 mb-3">
                          <label className="form-label">Alamat Lengkap *</label>
                          <textarea
                            className={`form-control ${errors.address ? 'is-invalid' : ''}`}
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            rows="3"
                            placeholder="Masukkan alamat lengkap"
                          />
                          {errors.address && (
                            <div className="invalid-feedback">{errors.address}</div>
                          )}
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Sekolah Asal *</label>
                          <input
                            type="text"
                            className={`form-control ${errors.previous_school ? 'is-invalid' : ''}`}
                            name="previous_school"
                            value={formData.previous_school}
                            onChange={handleInputChange}
                            placeholder="Nama sekolah asal"
                          />
                          {errors.previous_school && (
                            <div className="invalid-feedback">{errors.previous_school}</div>
                          )}
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Kompetensi Keahlian *</label>
                          <select
                            className={`form-select ${errors.chosen_skill_id ? 'is-invalid' : ''}`}
                            name="chosen_skill_id"
                            value={formData.chosen_skill_id}
                            onChange={handleInputChange}
                          >
                            <option value="">Pilih kompetensi keahlian</option>
                            {skills.map(skill => (
                              <option key={skill.id} value={skill.id}>
                                {skill.name}
                              </option>
                            ))}
                          </select>
                          {errors.chosen_skill_id && (
                            <div className="invalid-feedback">{errors.chosen_skill_id}</div>
                          )}
                        </div>
                      </div>

                      {/* Parent Information */}
                      <div className="row mb-4">
                        <div className="col-12">
                          <h5 className="text-primary border-bottom pb-2 mb-3">Data Orang Tua/Wali</h5>
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Nama Orang Tua/Wali *</label>
                          <input
                            type="text"
                            className={`form-control ${errors.parent_name ? 'is-invalid' : ''}`}
                            name="parent_name"
                            value={formData.parent_name}
                            onChange={handleInputChange}
                            placeholder="Nama lengkap orang tua/wali"
                          />
                          {errors.parent_name && (
                            <div className="invalid-feedback">{errors.parent_name}</div>
                          )}
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label">No. HP Orang Tua/Wali *</label>
                          <input
                            type="tel"
                            className={`form-control ${errors.parent_phone ? 'is-invalid' : ''}`}
                            name="parent_phone"
                            value={formData.parent_phone}
                            onChange={handleInputChange}
                            placeholder="08xxxxxxxxxx"
                          />
                          {errors.parent_phone && (
                            <div className="invalid-feedback">{errors.parent_phone}</div>
                          )}
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Email Orang Tua/Wali</label>
                          <input
                            type="email"
                            className={`form-control ${errors.parent_email ? 'is-invalid' : ''}`}
                            name="parent_email"
                            value={formData.parent_email}
                            onChange={handleInputChange}
                            placeholder="example@email.com (opsional)"
                          />
                          {errors.parent_email && (
                            <div className="invalid-feedback">{errors.parent_email}</div>
                          )}
                        </div>
                      </div>

                      {/* Document Upload */}
                      <div className="row mb-4">
                        <div className="col-12">
                          <h5 className="text-primary border-bottom pb-2 mb-3">Upload Dokumen</h5>
                          <p className="text-muted mb-3">
                            <small>Format file yang didukung: JPG, PNG, PDF. Maksimal ukuran file 2MB per dokumen.</small>
                          </p>
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Fotokopi KTP Orang Tua *</label>
                          <input
                            type="file"
                            className={`form-control ${errors.ktp ? 'is-invalid' : ''}`}
                            name="ktp"
                            accept=".jpg,.jpeg,.png,.pdf"
                            onChange={handleFileChange}
                          />
                          {errors.ktp && (
                            <div className="invalid-feedback">{errors.ktp}</div>
                          )}
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Fotokopi Kartu Keluarga *</label>
                          <input
                            type="file"
                            className={`form-control ${errors.kk ? 'is-invalid' : ''}`}
                            name="kk"
                            accept=".jpg,.jpeg,.png,.pdf"
                            onChange={handleFileChange}
                          />
                          {errors.kk && (
                            <div className="invalid-feedback">{errors.kk}</div>
                          )}
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Ijazah/SKHUN *</label>
                          <input
                            type="file"
                            className={`form-control ${errors.ijazah ? 'is-invalid' : ''}`}
                            name="ijazah"
                            accept=".jpg,.jpeg,.png,.pdf"
                            onChange={handleFileChange}
                          />
                          {errors.ijazah && (
                            <div className="invalid-feedback">{errors.ijazah}</div>
                          )}
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Pas Foto 3x4 *</label>
                          <input
                            type="file"
                            className={`form-control ${errors.foto ? 'is-invalid' : ''}`}
                            name="foto"
                            accept=".jpg,.jpeg,.png"
                            onChange={handleFileChange}
                          />
                          {errors.foto && (
                            <div className="invalid-feedback">{errors.foto}</div>
                          )}
                        </div>
                      </div>

                      {/* Submit Button */}
                      <div className="text-center">
                        <button
                          type="submit"
                          className="btn btn-primary btn-lg px-5"
                          disabled={submitting}
                        >
                          {submitting ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                              Memproses Pendaftaran...
                            </>
                          ) : (
                            'Daftar Sekarang'
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default PPDB