// src/admin/SkillsAdmin.jsx
import React, { useState, useEffect } from 'react'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  BookOpen,
  Clock,
  Users,
  Award,
  Building,
  CheckCircle,
  XCircle,
  AlertCircle,
  Upload,
  Image
} from 'lucide-react'
import DataTable from './components/DataTable'
import {
  getAllSkills,
  createSkill,
  updateSkill,
  deleteSkill,
  toggleSkillStatus,
  uploadToStorage,
  getStorageUrl
} from '../services/apiAdmin'

const SkillsAdmin = () => {
  const [skills, setSkills] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingSkill, setEditingSkill] = useState(null)
  const [formLoading, setFormLoading] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [imageUploading, setImageUploading] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image_url: '',
    duration_years: 3,
    subjects: [],
    facilities: [],
    career_prospects: [],
    is_active: true
  })

  useEffect(() => {
    fetchSkills()
  }, [])

  const fetchSkills = async () => {
    try {
      setLoading(true)
      const data = await getAllSkills()
      setSkills(data)
    } catch (error) {
      console.error('Error fetching skills:', error)
      alert('Gagal memuat data kompetensi keahlian')
    } finally {
      setLoading(false)
    }
  }

  const resetFormData = () => {
    setFormData({
      name: '',
      description: '',
      image_url: '',
      duration_years: 3,
      subjects: [],
      facilities: [],
      career_prospects: [],
      is_active: true
    })
  }

  const handleAdd = () => {
    setEditingSkill(null)
    resetFormData()
    setShowForm(true)
  }

  const handleEdit = (skill) => {
    setEditingSkill(skill)
    setFormData({
      name: skill.name || '',
      description: skill.description || '',
      image_url: skill.image_url || '',
      duration_years: skill.duration_years || 3,
      subjects: skill.subjects || [],
      facilities: skill.facilities || [],
      career_prospects: skill.career_prospects || [],
      is_active: skill.is_active || false
    })
    setShowForm(true)
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran file maksimal 2MB')
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('File harus berupa gambar')
      return
    }

    try {
      setImageUploading(true)
      const fileName = `skills/${Date.now()}-${file.name}`
      await uploadToStorage('school-images', fileName, file)
      const imageUrl = getStorageUrl('school-images', fileName)
      
      setFormData(prev => ({
        ...prev,
        image_url: imageUrl
      }))
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Gagal upload gambar')
    } finally {
      setImageUploading(false)
    }
  }

  const handleArrayAdd = (fieldName, value) => {
    if (!value.trim()) return
    
    setFormData(prev => ({
      ...prev,
      [fieldName]: [...prev[fieldName], value.trim()]
    }))
  }

  const handleArrayRemove = (fieldName, index) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: prev[fieldName].filter((_, i) => i !== index)
    }))
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    
    // Validation
    if (!formData.name.trim()) {
      alert('Nama kompetensi keahlian wajib diisi')
      return
    }

    if (!formData.duration_years || formData.duration_years < 1) {
      alert('Durasi harus minimal 1 tahun')
      return
    }

    try {
      setFormLoading(true)
      
      if (editingSkill) {
        await updateSkill(editingSkill.id, formData)
      } else {
        await createSkill(formData)
      }
      
      await fetchSkills()
      setShowForm(false)
      setEditingSkill(null)
      resetFormData()
      alert(`Kompetensi keahlian berhasil ${editingSkill ? 'diperbarui' : 'ditambahkan'}`)
    } catch (error) {
      console.error('Error saving skill:', error)
      alert(`Gagal ${editingSkill ? 'memperbarui' : 'menambahkan'} kompetensi keahlian`)
    } finally {
      setFormLoading(false)
    }
  }

  const handleToggleStatus = async (skill) => {
    try {
      await toggleSkillStatus(skill.id, !skill.is_active)
      await fetchSkills()
    } catch (error) {
      console.error('Error toggling skill status:', error)
      alert('Gagal mengubah status kompetensi keahlian')
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteSkill(id)
      await fetchSkills()
      setDeleteConfirm(null)
      alert('Kompetensi keahlian berhasil dihapus')
    } catch (error) {
      console.error('Error deleting skill:', error)
      alert('Gagal menghapus kompetensi keahlian')
    }
  }

  const columns = [
    {
      key: 'name',
      title: 'Nama Kompetensi',
      sortable: true,
      render: (value, item) => (
        <div className="d-flex align-items-center">
          <div className="flex-shrink-0 me-3">
            {item.image_url ? (
              <img
                className="rounded-circle object-fit-cover"
                src={item.image_url}
                alt={value}
                style={{ width: '40px', height: '40px' }}
              />
            ) : (
              <div className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                <BookOpen className="text-primary" size={20} />
              </div>
            )}
          </div>
          <div>
            <div className="fw-medium text-dark small">{value}</div>
            <div className="text-muted small text-truncate" style={{ maxWidth: '300px' }}>
              {item.description}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'duration_years',
      title: 'Durasi',
      render: (value) => (
        <div className="d-flex align-items-center small text-dark">
          <Clock className="text-muted me-1" size={16} />
          {value} Tahun
        </div>
      )
    },
    {
      key: 'subjects',
      title: 'Mata Pelajaran',
      render: (value) => (
        <div className="small text-dark">
          {Array.isArray(value) && value.length > 0 ? (
            <span className="badge bg-primary bg-opacity-10 text-primary">
              {value.length} Mata Pelajaran
            </span>
          ) : (
            <span className="text-muted">Belum diatur</span>
          )}
        </div>
      )
    },
    {
      key: 'facilities',
      title: 'Fasilitas',
      render: (value) => (
        <div className="small text-dark">
          {Array.isArray(value) && value.length > 0 ? (
            <span className="badge bg-success bg-opacity-10 text-success d-inline-flex align-items-center">
              <Building className="me-1" size={12} />
              {value.length} Fasilitas
            </span>
          ) : (
            <span className="text-muted">Belum diatur</span>
          )}
        </div>
      )
    },
    {
      key: 'career_prospects',
      title: 'Prospek Karir',
      render: (value) => (
        <div className="small text-dark">
          {Array.isArray(value) && value.length > 0 ? (
            <span className="badge bg-warning bg-opacity-10 text-warning d-inline-flex align-items-center">
              <Award className="me-1" size={12} />
              {value.length} Prospek
            </span>
          ) : (
            <span className="text-muted">Belum diatur</span>
          )}
        </div>
      )
    },
    {
      key: 'is_active',
      title: 'Status',
      render: (value, item) => (
        <button
          onClick={() => handleToggleStatus(item)}
          className={`btn btn-sm d-inline-flex align-items-center ${
            value
              ? 'btn-outline-success'
              : 'btn-outline-danger'
          }`}
        >
          {value ? (
            <>
              <CheckCircle className="me-1" size={12} />
              Aktif
            </>
          ) : (
            <>
              <XCircle className="me-1" size={12} />
              Nonaktif
            </>
          )}
        </button>
      )
    },
    {
      key: 'actions',
      title: 'Aksi',
      render: (_, item) => (
        <div className="d-flex gap-1">
          <button
            onClick={() => handleEdit(item)}
            className="btn btn-sm btn-outline-primary p-1"
            title="Edit"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => setDeleteConfirm(item)}
            className="btn btn-sm btn-outline-danger p-1"
            title="Hapus"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ]

  // Array field component
  const ArrayField = ({ label, fieldName, placeholder }) => {
    const [inputValue, setInputValue] = useState('')
    
    return (
      <div className="mb-3">
        <label className="form-label fw-semibold">{label}</label>
        
        {/* Current items */}
        {formData[fieldName].length > 0 && (
          <div className="mb-2">
            {formData[fieldName].map((item, index) => (
              <span key={index} className="badge bg-light text-dark me-2 mb-1 d-inline-flex align-items-center">
                {item}
                <button
                  type="button"
                  className="btn-close btn-close-sm ms-2"
                  onClick={() => handleArrayRemove(fieldName, index)}
                  style={{ fontSize: '0.7em' }}
                ></button>
              </span>
            ))}
          </div>
        )}
        
        {/* Add new item */}
        <div className="input-group">
          <input
            type="text"
            className="form-control"
            placeholder={placeholder}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleArrayAdd(fieldName, inputValue)
                setInputValue('')
              }
            }}
          />
          <button
            type="button"
            className="btn btn-outline-primary"
            onClick={() => {
              handleArrayAdd(fieldName, inputValue)
              setInputValue('')
            }}
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
    )
  }

  if (showForm) {
    return (
      <div className="container-fluid py-4">
        {/* Header */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="d-flex align-items-center gap-3 mb-3">
              <button
                onClick={() => {
                  setShowForm(false)
                  setEditingSkill(null)
                  resetFormData()
                }}
                className="btn btn-outline-secondary"
                disabled={formLoading}
              >
                Kembali
              </button>
              <div>
                <h1 className="h2 fw-bold text-dark mb-1">
                  {editingSkill ? 'Edit' : 'Tambah'} Kompetensi Keahlian
                </h1>
                <p className="text-muted mb-0">
                  {editingSkill ? 'Perbarui' : 'Tambahkan'} informasi kompetensi keahlian
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="row">
          <div className="col-12">
            <form onSubmit={handleFormSubmit}>
              <div className="row">
                {/* Main Content */}
                <div className="col-lg-8">
                  <div className="card mb-4">
                    <div className="card-header">
                      <h5 className="card-title mb-0">Informasi Kompetensi</h5>
                    </div>
                    <div className="card-body">
                      {/* Name */}
                      <div className="mb-3">
                        <label htmlFor="name" className="form-label fw-semibold">
                          Nama Kompetensi Keahlian <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control form-control-lg"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Contoh: Teknik Komputer dan Jaringan"
                          required
                          disabled={formLoading}
                        />
                      </div>

                      {/* Description */}
                      <div className="mb-3">
                        <label htmlFor="description" className="form-label fw-semibold">
                          Deskripsi
                        </label>
                        <textarea
                          className="form-control"
                          id="description"
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          placeholder="Deskripsi singkat tentang kompetensi keahlian ini..."
                          rows={4}
                          disabled={formLoading}
                        />
                      </div>

                      {/* Duration */}
                      <div className="mb-3">
                        <label htmlFor="duration_years" className="form-label fw-semibold">
                          Durasi (Tahun) <span className="text-danger">*</span>
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          id="duration_years"
                          name="duration_years"
                          value={formData.duration_years}
                          onChange={handleInputChange}
                          min={1}
                          max={5}
                          required
                          disabled={formLoading}
                        />
                      </div>

                      {/* Array Fields */}
                      <ArrayField
                        label="Mata Pelajaran"
                        fieldName="subjects"
                        placeholder="Masukkan mata pelajaran"
                      />

                      <ArrayField
                        label="Fasilitas"
                        fieldName="facilities"
                        placeholder="Masukkan fasilitas yang tersedia"
                      />

                      <ArrayField
                        label="Prospek Karir"
                        fieldName="career_prospects"
                        placeholder="Masukkan prospek karir"
                      />
                    </div>
                  </div>
                </div>

                {/* Sidebar */}
                <div className="col-lg-4">
                  {/* Image Upload */}
                  <div className="card mb-4">
                    <div className="card-header">
                      <h5 className="card-title mb-0">Gambar Kompetensi</h5>
                    </div>
                    <div className="card-body">
                      {/* Image Preview */}
                      {formData.image_url && (
                        <div className="mb-3">
                          <img
                            src={formData.image_url}
                            alt="Preview"
                            className="img-fluid rounded"
                            style={{ maxHeight: '200px', width: '100%', objectFit: 'cover' }}
                          />
                        </div>
                      )}

                      {/* Upload Input */}
                      <div className="mb-3">
                        <input
                          type="file"
                          className="form-control"
                          id="image_upload"
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={imageUploading || formLoading}
                        />
                      </div>

                      {imageUploading && (
                        <div className="d-flex align-items-center text-primary">
                          <div className="spinner-border spinner-border-sm me-2" />
                          <small>Mengupload gambar...</small>
                        </div>
                      )}

                      <div className="form-text small">
                        <strong>Format:</strong> JPG, PNG, GIF<br />
                        <strong>Ukuran maksimal:</strong> 2MB<br />
                        <strong>Rekomendasi:</strong> 400x300px untuk hasil terbaik
                      </div>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="card mb-4">
                    <div className="card-header">
                      <h5 className="card-title mb-0">Status</h5>
                    </div>
                    <div className="card-body">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="is_active"
                          name="is_active"
                          checked={formData.is_active}
                          onChange={handleInputChange}
                          disabled={formLoading}
                        />
                        <label className="form-check-label fw-semibold" htmlFor="is_active">
                          <CheckCircle size={16} className="me-1" />
                          Kompetensi Aktif
                        </label>
                        <div className="form-text small">
                          Kompetensi keahlian ini aktif dan dapat dipilih siswa
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="card">
                    <div className="card-body">
                      <div className="d-grid gap-2">
                        <button
                          type="submit"
                          className="btn btn-primary btn-lg"
                          disabled={formLoading || imageUploading}
                        >
                          {formLoading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" />
                              {editingSkill ? 'Memperbarui...' : 'Menyimpan...'}
                            </>
                          ) : (
                            <>
                              {editingSkill ? 'Perbarui' : 'Simpan'} Kompetensi
                            </>
                          )}
                        </button>
                        
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => {
                            setShowForm(false)
                            setEditingSkill(null)
                            resetFormData()
                          }}
                          disabled={formLoading}
                        >
                          Batal
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center">
            <div className="mb-3 mb-md-0">
              <h1 className="h2 fw-bold text-dark mb-1">Kompetensi Keahlian</h1>
              <p className="text-muted mb-0">
                Kelola data kompetensi keahlian yang tersedia di sekolah
              </p>
            </div>
            <button
              onClick={handleAdd}
              className="btn btn-primary d-flex align-items-center"
            >
              <Plus size={16} className="me-2" />
              Tambah Kompetensi
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-6 col-lg-4">
          <div className="card h-100 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="p-2 bg-primary bg-opacity-10 rounded me-3">
                  <BookOpen className="text-primary" size={24} />
                </div>
                <div>
                  <div className="fw-medium text-muted small">Total Kompetensi</div>
                  <div className="h4 fw-bold text-dark mb-0">{skills.length}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-12 col-md-6 col-lg-4">
          <div className="card h-100 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="p-2 bg-success bg-opacity-10 rounded me-3">
                  <CheckCircle className="text-success" size={24} />
                </div>
                <div>
                  <div className="fw-medium text-muted small">Kompetensi Aktif</div>
                  <div className="h4 fw-bold text-dark mb-0">
                    {skills.filter(skill => skill.is_active).length}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-12 col-md-6 col-lg-4">
          <div className="card h-100 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="p-2 bg-danger bg-opacity-10 rounded me-3">
                  <XCircle className="text-danger" size={24} />
                </div>
                <div>
                  <div className="fw-medium text-muted small">Kompetensi Nonaktif</div>
                  <div className="h4 fw-bold text-dark mb-0">
                    {skills.filter(skill => !skill.is_active).length}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="card shadow-sm">
        <DataTable
          data={skills}
          columns={columns}
          loading={loading}
          searchable={true}
          onRefresh={fetchSkills}
        />
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal fade show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header border-0 pb-0">
                <div className="d-flex align-items-center">
                  <div className="p-2 bg-danger bg-opacity-10 rounded-circle me-3">
                    <AlertCircle className="text-danger" size={24} />
                  </div>
                  <h5 className="modal-title fw-semibold">
                    Konfirmasi Hapus
                  </h5>
                </div>
              </div>
              
              <div className="modal-body">
                <p className="text-muted mb-0">
                  Apakah Anda yakin ingin menghapus kompetensi keahlian{' '}
                  <span className="fw-semibold text-dark">"{deleteConfirm.name}"</span>?{' '}
                  Tindakan ini tidak dapat dibatalkan.
                </p>
              </div>
              
              <div className="modal-footer border-0 pt-0">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="btn btn-outline-secondary"
                >
                  Batal
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm.id)}
                  className="btn btn-danger"
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SkillsAdmin