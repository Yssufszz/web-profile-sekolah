// src/admin/GalleryAdmin.jsx
import React, { useState, useEffect } from 'react'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Star, 
  StarOff,
  Image,
  Video,
  Eye,
  Filter,
  Grid,
  List,
  Search,
  Calendar,
  Tag,
  X,
  Upload,
  FileImage,
  FileVideo
} from 'lucide-react'
import DataTable from './components/DataTable'
import { 
  getAllGallery,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
  toggleGalleryFeatured,
  uploadToStorage,
  getStorageUrl,
  deleteFromStorage
} from '../services/apiAdmin'

const GalleryAdmin = () => {
  const [galleryItems, setGalleryItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [viewMode, setViewMode] = useState('grid') // grid or table
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    media_type: 'image',
    media_file: null,
    category: '',
    is_featured: false
  })
  const [filePreview, setFilePreview] = useState(null)
  const [errors, setErrors] = useState({})

  const categories = [
    { value: 'facility', label: 'Fasilitas' },
    { value: 'activity', label: 'Kegiatan' },
    { value: 'achievement', label: 'Prestasi' },
    { value: 'event', label: 'Acara' }
  ]

  const mediaTypes = [
    { value: 'image', label: 'Gambar' },
    { value: 'video', label: 'Video' }
  ]

  useEffect(() => {
    loadGalleryItems()
  }, [])

  const loadGalleryItems = async () => {
    try {
      setLoading(true)
      const data = await getAllGallery()
      setGalleryItems(data)
    } catch (error) {
      console.error('Error loading gallery items:', error)
      alert('Gagal memuat data galeri')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      media_type: 'image',
      media_file: null,
      category: '',
      is_featured: false
    })
    setFilePreview(null)
    setErrors({})
  }

  const handleShowModal = (item = null) => {
    if (item) {
      setEditingItem(item)
      setFormData({
        title: item.title || '',
        description: item.description || '',
        media_type: item.media_type || 'image',
        media_file: null,
        category: item.category || '',
        is_featured: item.is_featured || false
      })
      setFilePreview(item.media_url)
    } else {
      setEditingItem(null)
      resetForm()
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingItem(null)
    resetForm()
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          media_file: 'Ukuran file tidak boleh lebih dari 10MB'
        }))
        return
      }

      // Validate file type
      const isImage = file.type.startsWith('image/')
      const isVideo = file.type.startsWith('video/')
      
      if (!isImage && !isVideo) {
        setErrors(prev => ({
          ...prev,
          media_file: 'File harus berupa gambar atau video'
        }))
        return
      }

      setFormData(prev => ({
        ...prev,
        media_file: file,
        media_type: isImage ? 'image' : 'video'
      }))

      // Create preview
      if (isImage) {
        const reader = new FileReader()
        reader.onload = (e) => setFilePreview(e.target.result)
        reader.readAsDataURL(file)
      } else {
        setFilePreview(null)
      }

      // Clear error
      if (errors.media_file) {
        setErrors(prev => ({
          ...prev,
          media_file: ''
        }))
      }
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Judul wajib diisi'
    }

    if (!formData.category) {
      newErrors.category = 'Kategori wajib dipilih'
    }

    if (!editingItem && !formData.media_file) {
      newErrors.media_file = 'File media wajib dipilih'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleUploadFile = async (file) => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `gallery/${fileName}`
      
      await uploadToStorage('gallery', filePath, file)
      return getStorageUrl('gallery', filePath)
    } catch (error) {
      console.error('Upload error:', error)
      throw new Error('Gagal upload file')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    try {
      setSubmitting(true)

      const submitData = { ...formData }

      // Upload media file if exists
      if (formData.media_file) {
        const mediaUrl = await handleUploadFile(formData.media_file)
        submitData.media_url = mediaUrl
        
        // Generate thumbnail for video
        if (formData.media_type === 'video') {
          submitData.thumbnail_url = '/api/placeholder/300/200' // Placeholder for now
        }
      }

      // Remove file from submitData before sending to API
      delete submitData.media_file

      if (editingItem) {
        await updateGalleryItem(editingItem.id, submitData)
      } else {
        await createGalleryItem(submitData)
      }

      await loadGalleryItems()
      handleCloseModal()
      alert(editingItem ? 'Galeri berhasil diperbarui' : 'Galeri berhasil ditambahkan')
    } catch (error) {
      console.error('Submit error:', error)
      alert('Gagal menyimpan galeri')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (item) => {
    if (!confirm('Apakah Anda yakin ingin menghapus item galeri ini?')) return

    try {
      // Delete file from storage if exists
      if (item.media_url) {
        const urlParts = item.media_url.split('/')
        const fileName = urlParts[urlParts.length - 1]
        await deleteFromStorage('gallery', `gallery/${fileName}`)
      }

      await deleteGalleryItem(item.id)
      await loadGalleryItems()
      alert('Item galeri berhasil dihapus')
    } catch (error) {
      console.error('Delete error:', error)
      alert('Gagal menghapus item galeri')
    }
  }

  const handleToggleFeatured = async (item) => {
    try {
      await toggleGalleryFeatured(item.id, !item.is_featured)
      await loadGalleryItems()
    } catch (error) {
      console.error('Toggle featured error:', error)
      alert('Gagal mengubah status unggulan')
    }
  }

  const tableColumns = [
    {
      key: 'media_preview',
      title: 'Preview',
      render: (value, item) => (
        <div className="d-flex justify-content-center">
          <div style={{ width: '64px', height: '64px' }} className="rounded overflow-hidden bg-light">
            {item.media_type === 'image' ? (
              <img
                src={item.media_url || '/api/placeholder/64/64'}
                alt={item.title}
                className="w-100 h-100"
                style={{ objectFit: 'cover' }}
              />
            ) : (
              <div className="w-100 h-100 d-flex align-items-center justify-content-center">
                <Video size={24} className="text-muted" />
              </div>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'title',
      title: 'Judul',
      sortable: true,
      render: (value, item) => (
        <div>
          <div className="fw-semibold text-dark">{value}</div>
          <small className="text-muted">
            {item.media_type === 'image' ? 'Gambar' : 'Video'}
          </small>
        </div>
      )
    },
    {
      key: 'category',
      title: 'Kategori',
      sortable: true,
      render: (value) => {
        const categoryLabel = categories.find(cat => cat.value === value)?.label || value
        return (
          <span className="badge bg-primary rounded-pill">
            {categoryLabel}
          </span>
        )
      }
    },
    {
      key: 'is_featured',
      title: 'Unggulan',
      render: (value, item) => (
        <button
          onClick={() => handleToggleFeatured(item)}
          className={`btn btn-sm p-1 ${
            value ? 'text-warning' : 'text-muted'
          }`}
          style={{ background: 'none', border: 'none' }}
        >
          {value ? <Star size={16} fill="currentColor" /> : <StarOff size={16} />}
        </button>
      )
    },
    {
      key: 'created_at',
      title: 'Tanggal Dibuat',
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString('id-ID')
    },
    {
      key: 'actions',
      title: 'Aksi',
      render: (value, item) => (
        <div className="d-flex gap-1">
          <button
            onClick={() => window.open(item.media_url, '_blank')}
            className="btn btn-sm btn-outline-primary p-1"
            title="Lihat Media"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={() => handleShowModal(item)}
            className="btn btn-sm btn-outline-success p-1"
            title="Edit"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => handleDelete(item)}
            className="btn btn-sm btn-outline-danger p-1"
            title="Hapus"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ]

  const filteredItems = galleryItems.filter(item => {
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false
    if (selectedType !== 'all' && item.media_type !== selectedType) return false
    return true
  })

  const renderGridView = () => (
    <div className="row g-4">
      {filteredItems.map((item) => (
        <div key={item.id} className="col-12 col-sm-6 col-lg-4 col-xl-3">
          <div className="card h-100 shadow-sm">
            <div className="position-relative" style={{ height: '200px' }}>
              {item.media_type === 'image' ? (
                <img
                  src={item.media_url || '/api/placeholder/300/200'}
                  alt={item.title}
                  className="card-img-top w-100 h-100"
                  style={{ objectFit: 'cover' }}
                />
              ) : (
                <div className="w-100 h-100 bg-light d-flex align-items-center justify-content-center">
                  <Video size={48} className="text-muted" />
                </div>
              )}
            </div>
            
            <div className="card-body d-flex flex-column">
              <div className="d-flex align-items-start justify-content-between mb-2">
                <h6 className="card-title mb-0 text-truncate flex-grow-1">{item.title}</h6>
                {item.is_featured && (
                  <Star size={16} className="text-warning ms-2 flex-shrink-0" fill="currentColor" />
                )}
              </div>
              
              {item.description && (
                <p className="card-text text-muted small mb-3" 
                   style={{ 
                     display: '-webkit-box',
                     WebkitLineClamp: 2,
                     WebkitBoxOrient: 'vertical',
                     overflow: 'hidden'
                   }}>
                  {item.description}
                </p>
              )}
              
              <div className="mt-auto">
                <div className="d-flex align-items-center justify-content-between">
                  <span className="badge bg-primary rounded-pill">
                    {categories.find(cat => cat.value === item.category)?.label || item.category}
                  </span>
                  
                  <div className="d-flex gap-1">
                    <button
                      onClick={() => window.open(item.media_url, '_blank')}
                      className="btn btn-sm btn-outline-primary p-1"
                      title="Lihat Media"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => handleShowModal(item)}
                      className="btn btn-sm btn-outline-success p-1"
                      title="Edit"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      className="btn btn-sm btn-outline-danger p-1"
                      title="Hapus"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
      
      {filteredItems.length === 0 && (
        <div className="col-12">
          <div className="text-center py-5">
            <Image size={48} className="text-muted mb-3" />
            <p className="text-muted">Belum ada item galeri</p>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          {/* Header */}
          <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4">
            <div className="mb-3 mb-md-0">
              <h1 className="h2 fw-bold text-dark mb-1">Galeri</h1>
              <p className="text-muted mb-0">Kelola foto dan video sekolah</p>
            </div>
            <button
              onClick={() => handleShowModal()}
              className="btn btn-primary d-flex align-items-center"
            >
              <Plus size={16} className="me-2" />
              Tambah Media
            </button>
          </div>

          {/* Filters and View Toggle */}
          <div className="card mb-4">
            <div className="card-body">
              <div className="row align-items-center">
                <div className="col-12 col-lg-8">
                  <div className="row g-3">
                    <div className="col-12 col-sm-6 col-md-4">
                      <div className="d-flex align-items-center">
                        <Filter size={16} className="text-muted me-2" />
                        <select
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className="form-select form-select-sm"
                        >
                          <option value="all">Semua Kategori</option>
                          {categories.map(category => (
                            <option key={category.value} value={category.value}>
                              {category.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    <div className="col-12 col-sm-6 col-md-4">
                      <div className="d-flex align-items-center">
                        <Tag size={16} className="text-muted me-2" />
                        <select
                          value={selectedType}
                          onChange={(e) => setSelectedType(e.target.value)}
                          className="form-select form-select-sm"
                        >
                          <option value="all">Semua Jenis</option>
                          {mediaTypes.map(type => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="col-12 col-lg-4">
                  <div className="d-flex justify-content-lg-end mt-3 mt-lg-0">
                    <div className="btn-group" role="group" aria-label="View mode">
                      <button
                        type="button"
                        onClick={() => setViewMode('grid')}
                        className={`btn btn-sm ${
                          viewMode === 'grid' 
                            ? 'btn-primary' 
                            : 'btn-outline-secondary'
                        }`}
                      >
                        <Grid size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setViewMode('table')}
                        className={`btn btn-sm ${
                          viewMode === 'table' 
                            ? 'btn-primary' 
                            : 'btn-outline-secondary'
                        }`}
                      >
                        <List size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          {viewMode === 'grid' ? (
            renderGridView()
          ) : (
            <div className="card">
              <div className="card-body">
                <DataTable
                  data={filteredItems}
                  columns={tableColumns}
                  loading={loading}
                  searchable={true}
                  onRefresh={loadGalleryItems}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingItem ? 'Edit Galeri' : 'Tambah Galeri'}
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={handleCloseModal}
                  disabled={submitting}
                ></button>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row g-3">
                    {/* Title */}
                    <div className="col-12">
                      <label className="form-label">
                        Judul <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                        placeholder="Masukkan judul galeri"
                        disabled={submitting}
                      />
                      {errors.title && (
                        <div className="invalid-feedback">{errors.title}</div>
                      )}
                    </div>

                    {/* Description */}
                    <div className="col-12">
                      <label className="form-label">Deskripsi</label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        className="form-control"
                        rows="3"
                        placeholder="Masukkan deskripsi galeri"
                        disabled={submitting}
                      />
                    </div>

                    {/* Media Type */}
                    <div className="col-md-6">
                      <label className="form-label">
                        Jenis Media <span className="text-danger">*</span>
                      </label>
                      <select
                        name="media_type"
                        value={formData.media_type}
                        onChange={handleInputChange}
                        className="form-select"
                        disabled={submitting}
                      >
                        {mediaTypes.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Category */}
                    <div className="col-md-6">
                      <label className="form-label">
                        Kategori <span className="text-danger">*</span>
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className={`form-select ${errors.category ? 'is-invalid' : ''}`}
                        disabled={submitting}
                      >
                        <option value="">Pilih Kategori</option>
                        {categories.map(category => (
                          <option key={category.value} value={category.value}>
                            {category.label}
                          </option>
                        ))}
                      </select>
                      {errors.category && (
                        <div className="invalid-feedback">{errors.category}</div>
                      )}
                    </div>

                    {/* File Upload */}
                    <div className="col-12">
                      <label className="form-label">
                        File Media {!editingItem && <span className="text-danger">*</span>}
                      </label>
                      <input
                        type="file"
                        accept="image/*,video/*"
                        onChange={handleFileChange}
                        className={`form-control ${errors.media_file ? 'is-invalid' : ''}`}
                        disabled={submitting}
                      />
                      <div className="form-text">
                        Pilih file gambar atau video (maksimal 10MB)
                      </div>
                      {errors.media_file && (
                        <div className="invalid-feedback">{errors.media_file}</div>
                      )}
                      
                      {/* File Preview */}
                      {filePreview && (
                        <div className="mt-3">
                          <label className="form-label">Preview:</label>
                          <div className="border rounded p-2">
                            {formData.media_type === 'image' ? (
                              <img 
                                src={filePreview} 
                                alt="Preview" 
                                className="img-fluid"
                                style={{ maxHeight: '200px', objectFit: 'contain' }}
                              />
                            ) : (
                              <div className="text-center py-4">
                                <FileVideo size={48} className="text-muted mb-2" />
                                <div className="text-muted">Video Preview</div>
                                <small className="text-muted">
                                  {formData.media_file?.name}
                                </small>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Featured */}
                    <div className="col-12">
                      <div className="form-check">
                        <input
                          type="checkbox"
                          name="is_featured"
                          checked={formData.is_featured}
                          onChange={handleInputChange}
                          className="form-check-input"
                          id="is_featured"
                          disabled={submitting}
                        />
                        <label className="form-check-label" htmlFor="is_featured">
                          Tampilkan sebagai unggulan
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={handleCloseModal}
                    disabled={submitting}
                  >
                    Batal
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        {editingItem ? 'Memperbarui...' : 'Menyimpan...'}
                      </>
                    ) : (
                      editingItem ? 'Perbarui' : 'Simpan'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GalleryAdmin