// src/admin/ProfileAdmin.jsx
import React, { useState, useEffect, useRef } from 'react'
import { 
  Save, 
  Upload, 
  Image, 
  School, 
  MapPin, 
  Phone, 
  Mail, 
  Globe,
  Calendar,
  Award,
  Eye,
  RefreshCw,
  X
} from 'lucide-react'
import { getSchoolProfileAdmin, updateSchoolProfile, uploadToStorage, getStorageUrl } from '../services/apiAdmin'
import { toast } from 'react-hot-toast'

const ProfileAdmin = () => {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)
  const [activeTab, setActiveTab] = useState('basic')
  const [formData, setFormData] = useState({})
  const [uploading, setUploading] = useState(false)
  
  const logoInputRef = useRef(null)
  const headerInputRef = useRef(null)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      setLoading(true)
      const data = await getSchoolProfileAdmin()
      const profileData = data || {
        name: '',
        description: '',
        vision: '',
        mission: '',
        address: '',
        phone: '',
        email: '',
        website: '',
        logo_url: '',
        header_image_url: '',
        established_year: new Date().getFullYear(),
        accreditation: ''
      }
      setProfile(profileData)
      setFormData(profileData)
    } catch (error) {
      console.error('Error loading profile:', error)
      toast.error('Gagal memuat profil sekolah')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleImageUpload = async (file, type) => {
    try {
      setUploading(true)
      const fileName = `${type}_${Date.now()}.${file.name.split('.').pop()}`
      const filePath = `school/${fileName}`
      
      await uploadToStorage('school-images', filePath, file)
      const imageUrl = getStorageUrl('school-images', filePath)
      
      setFormData(prev => ({
        ...prev,
        [type]: imageUrl
      }))
      
      toast.success('Gambar berhasil diupload')
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error('Gagal mengupload gambar')
    } finally {
      setUploading(false)
    }
  }

  const handleFileChange = (e, type) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('File harus berupa gambar')
      return
    }

    // Validate file size (2MB for logo, 5MB for header)
    const maxSize = type === 'logo_url' ? 2 : 5
    if (file.size > maxSize * 1024 * 1024) {
      toast.error(`Ukuran file maksimal ${maxSize}MB`)
      return
    }

    handleImageUpload(file, type)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      const updatedProfile = await updateSchoolProfile(formData)
      setProfile(updatedProfile)
      toast.success('Profil sekolah berhasil disimpan')
    } catch (error) {
      console.error('Error saving profile:', error)
      toast.error('Gagal menyimpan profil sekolah')
    } finally {
      setSaving(false)
    }
  }

  const removeImage = (type) => {
    setFormData(prev => ({
      ...prev,
      [type]: ''
    }))
    if (type === 'logo_url' && logoInputRef.current) {
      logoInputRef.current.value = ''
    }
    if (type === 'header_image_url' && headerInputRef.current) {
      headerInputRef.current.value = ''
    }
  }

  const tabs = [
    { id: 'basic', label: 'Informasi Dasar', icon: School },
    { id: 'contact', label: 'Kontak', icon: Phone },
    { id: 'vision', label: 'Visi & Misi', icon: Award },
    { id: 'images', label: 'Gambar', icon: Image }
  ]

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ height: '16rem' }}>
        <div className="spinner-border text-primary me-2" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <span className="text-muted">Memuat profil sekolah...</span>
      </div>
    )
  }

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h2 text-dark mb-1">Profil Sekolah</h1>
          <p className="text-muted mb-0">Kelola informasi dan profil sekolah</p>
        </div>
        <div className="d-flex gap-2">
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className="btn btn-outline-primary d-flex align-items-center"
          >
            <Eye size={16} className="me-2" />
            {previewMode ? 'Edit Mode' : 'Preview'}
          </button>
          <button
            onClick={loadProfile}
            disabled={loading}
            className="btn btn-outline-secondary d-flex align-items-center"
          >
            <RefreshCw size={16} className="me-2" />
            Refresh
          </button>
        </div>
      </div>

      {previewMode ? (
        /* Preview Mode */
        <div className="card">
          <div className="card-body p-4">
            <div className="container">
              {/* Header Images */}
              {formData.header_image_url && (
                <div className="position-relative mb-4" style={{ height: '16rem' }}>
                  <img
                    src={formData.header_image_url}
                    alt="Header"
                    className="w-100 h-100 object-fit-cover rounded"
                  />
                </div>
              )}

              {/* School Info */}
              <div className="row mb-4">
                <div className="col-auto">
                  {formData.logo_url && (
                    <img
                      src={formData.logo_url}
                      alt="Logo"
                      className="rounded border"
                      style={{ width: '6rem', height: '6rem', objectFit: 'contain' }}
                    />
                  )}
                </div>
                <div className="col">
                  <h1 className="h2 text-dark mb-2">
                    {formData.name || 'Nama Sekolah'}
                  </h1>
                  {formData.description && (
                    <p className="text-muted mb-3">{formData.description}</p>
                  )}
                  <div className="d-flex gap-4 small text-muted">
                    {formData.established_year && (
                      <span className="d-flex align-items-center">
                        <Calendar size={16} className="me-1" />
                        Berdiri {formData.established_year}
                      </span>
                    )}
                    {formData.accreditation && (
                      <span className="d-flex align-items-center">
                        <Award size={16} className="me-1" />
                        Akreditasi {formData.accreditation}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="row">
                <div className="col-md-6 mb-4">
                  <h3 className="h5 text-dark mb-3">Kontak</h3>
                  <div className="vstack gap-3">
                    {formData.address && (
                      <div className="d-flex">
                        <MapPin size={20} className="text-muted me-3 mt-1 flex-shrink-0" />
                        <span className="text-muted">{formData.address}</span>
                      </div>
                    )}
                    {formData.phone && (
                      <div className="d-flex align-items-center">
                        <Phone size={20} className="text-muted me-3" />
                        <span className="text-muted">{formData.phone}</span>
                      </div>
                    )}
                    {formData.email && (
                      <div className="d-flex align-items-center">
                        <Mail size={20} className="text-muted me-3" />
                        <span className="text-muted">{formData.email}</span>
                      </div>
                    )}
                    {formData.website && (
                      <div className="d-flex align-items-center">
                        <Globe size={20} className="text-muted me-3" />
                        <a
                          href={formData.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary text-decoration-none"
                        >
                          {formData.website}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                <div className="col-md-6">
                  <h3 className="h5 text-dark mb-3">Visi & Misi</h3>
                  {formData.vision && (
                    <div className="mb-3">
                      <h4 className="h6 text-dark mb-2">Visi</h4>
                      <p className="text-muted">{formData.vision}</p>
                    </div>
                  )}
                  {formData.mission && (
                    <div>
                      <h4 className="h6 text-dark mb-2">Misi</h4>
                      <div className="text-muted" style={{ whiteSpace: 'pre-line' }}>
                        {formData.mission}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Edit Mode */
        <div className="card">
          {/* Tabs */}
          <div className="card-header p-0">
            <ul className="nav nav-tabs card-header-tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <li key={tab.id} className="nav-item">
                    <button
                      onClick={() => setActiveTab(tab.id)}
                      className={`nav-link d-flex align-items-center ${
                        activeTab === tab.id ? 'active' : ''
                      }`}
                    >
                      <Icon size={16} className="me-2" />
                      {tab.label}
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* Tab Content */}
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              {activeTab === 'basic' && (
                <div>
                  <h4 className="h5 mb-3">Informasi Dasar</h4>
                  <p className="text-muted mb-4">Informasi dasar tentang sekolah</p>
                  
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="name" className="form-label">
                        Nama Sekolah <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="name"
                        name="name"
                        value={formData.name || ''}
                        onChange={handleInputChange}
                        placeholder="Masukkan nama sekolah"
                        maxLength={255}
                        required
                      />
                    </div>
                    
                    <div className="col-md-6 mb-3">
                      <label htmlFor="established_year" className="form-label">
                        Tahun Berdiri <span className="text-danger">*</span>
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        id="established_year"
                        name="established_year"
                        value={formData.established_year || ''}
                        onChange={handleInputChange}
                        min={1900}
                        max={new Date().getFullYear()}
                        required
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="accreditation" className="form-label">Akreditasi</label>
                      <select
                        className="form-select"
                        id="accreditation"
                        name="accreditation"
                        value={formData.accreditation || ''}
                        onChange={handleInputChange}
                      >
                        <option value="">Pilih Akreditasi</option>
                        <option value="A">A (Sangat Baik)</option>
                        <option value="B">B (Baik)</option>
                        <option value="C">C (Cukup)</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="description" className="form-label">Deskripsi</label>
                    <textarea
                      className="form-control"
                      id="description"
                      name="description"
                      rows={4}
                      value={formData.description || ''}
                      onChange={handleInputChange}
                      placeholder="Deskripsi singkat tentang sekolah"
                      maxLength={1000}
                    />
                  </div>
                </div>
              )}

              {activeTab === 'contact' && (
                <div>
                  <h4 className="h5 mb-3">Informasi Kontak</h4>
                  <p className="text-muted mb-4">Informasi kontak dan alamat sekolah</p>
                  
                  <div className="mb-3">
                    <label htmlFor="address" className="form-label">
                      Alamat <span className="text-danger">*</span>
                    </label>
                    <textarea
                      className="form-control"
                      id="address"
                      name="address"
                      rows={3}
                      value={formData.address || ''}
                      onChange={handleInputChange}
                      placeholder="Alamat lengkap sekolah"
                      required
                    />
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="phone" className="form-label">Nomor Telepon</label>
                      <input
                        type="tel"
                        className="form-control"
                        id="phone"
                        name="phone"
                        value={formData.phone || ''}
                        onChange={handleInputChange}
                        placeholder="(021) 1234567 atau 08123456789"
                      />
                    </div>
                    
                    <div className="col-md-6 mb-3">
                      <label htmlFor="email" className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-control"
                        id="email"
                        name="email"
                        value={formData.email || ''}
                        onChange={handleInputChange}
                        placeholder="info@sekolah.sch.id"
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="website" className="form-label">Website</label>
                    <input
                      type="url"
                      className="form-control"
                      id="website"
                      name="website"
                      value={formData.website || ''}
                      onChange={handleInputChange}
                      placeholder="https://www.sekolah.sch.id"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'vision' && (
                <div>
                  <h4 className="h5 mb-3">Visi & Misi</h4>
                  <p className="text-muted mb-4">Visi dan misi sekolah</p>
                  
                  <div className="mb-3">
                    <label htmlFor="vision" className="form-label">Visi</label>
                    <textarea
                      className="form-control"
                      id="vision"
                      name="vision"
                      rows={3}
                      value={formData.vision || ''}
                      onChange={handleInputChange}
                      placeholder="Visi sekolah"
                      maxLength={500}
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="mission" className="form-label">Misi</label>
                    <textarea
                      className="form-control"
                      id="mission"
                      name="mission"
                      rows={5}
                      value={formData.mission || ''}
                      onChange={handleInputChange}
                      placeholder="Misi sekolah (pisahkan dengan enter untuk setiap poin)"
                      maxLength={1000}
                    />
                  </div>
                </div>
              )}

              {activeTab === 'images' && (
                <div>
                  <h4 className="h5 mb-4">Gambar</h4>
                  
                  {/* Logo Section */}
                  <div className="mb-5">
                    <h5 className="h6 mb-3">Logo Sekolah</h5>
                    <div className="row">
                      {formData.logo_url && (
                        <div className="col-auto mb-3">
                          <div className="position-relative">
                            <img
                              src={formData.logo_url}
                              alt="Current logo"
                              className="rounded border"
                              style={{ width: '8rem', height: '8rem', objectFit: 'contain' }}
                            />
                            <button
                              type="button"
                              onClick={() => removeImage('logo_url')}
                              className="btn btn-sm btn-danger position-absolute top-0 end-0 rounded-circle p-1"
                              style={{ transform: 'translate(50%, -50%)' }}
                            >
                              <X size={12} />
                            </button>
                          </div>
                        </div>
                      )}
                      <div className="col">
                        <div className="border border-2 border-dashed rounded p-4 text-center">
                          <Upload size={32} className="text-muted mb-2" />
                          <h6 className="mb-2">Upload Logo</h6>
                          <p className="text-muted small mb-3">
                            Format: JPG, PNG. Maksimal 2MB. Disarankan rasio 1:1
                          </p>
                          <input
                            type="file"
                            ref={logoInputRef}
                            className="form-control"
                            accept="image/*"
                            onChange={(e) => handleFileChange(e, 'logo_url')}
                            disabled={uploading}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Header Image Section */}
                  <div className="mb-4">
                    <h5 className="h6 mb-3">Header Image</h5>
                    {formData.header_image_url && (
                      <div className="position-relative mb-3">
                        <img
                          src={formData.header_image_url}
                          alt="Current header"
                          className="w-100 rounded border"
                          style={{ height: '12rem', objectFit: 'cover' }}
                        />
                        <button
                          type="button"
                          onClick={() => removeImage('header_image_url')}
                          className="btn btn-sm btn-danger position-absolute top-0 end-0 m-2"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )}
                    <div className="border border-2 border-dashed rounded p-4 text-center">
                      <Upload size={32} className="text-muted mb-2" />
                      <h6 className="mb-2">Upload Header Image</h6>
                      <p className="text-muted small mb-3">
                        Format: JPG, PNG. Maksimal 5MB. Disarankan rasio 16:9
                      </p>
                      <input
                        type="file"
                        ref={headerInputRef}
                        className="form-control"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'header_image_url')}
                        disabled={uploading}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="d-flex justify-content-end mt-4 pt-3 border-top">
                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="btn btn-primary d-flex align-items-center"
                >
                  {(saving || uploading) && (
                    <div className="spinner-border spinner-border-sm me-2" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  )}
                  <Save size={16} className="me-2" />
                  {activeTab === 'basic' && 'Simpan Informasi Dasar'}
                  {activeTab === 'contact' && 'Simpan Kontak'}
                  {activeTab === 'vision' && 'Simpan Visi & Misi'}
                  {activeTab === 'images' && 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProfileAdmin