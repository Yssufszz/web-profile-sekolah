// src/admin/NewsAdmin.jsx
import React, { useState, useEffect } from 'react'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  Star,
  StarOff,
  Calendar,
  User,
  FileText,
  Image,
  AlertCircle,
  Save,
  X,
  Upload,
  ExternalLink,
  ArrowLeft,
  Check
} from 'lucide-react'
import DataTable from './components/DataTable'
import {
  getAllNews,
  createNews,
  updateNews,
  deleteNews,
  toggleNewsStatus,
  toggleNewsFeatured,
  createNewsSlug,
  uploadToStorage,
  getStorageUrl
} from '../services/apiAdmin'

const NewsAdmin = () => {
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingNews, setEditingNews] = useState(null)
  const [formLoading, setFormLoading] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [imageUploading, setImageUploading] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: 'news',
    featured_image_url: '',
    is_published: false,
    is_featured: false
  })

  useEffect(() => {
    fetchNews()
  }, [])

  const fetchNews = async () => {
    try {
      setLoading(true)
      const data = await getAllNews()
      setNews(data)
    } catch (error) {
      console.error('Error fetching news:', error)
      alert('Gagal memuat data berita')
    } finally {
      setLoading(false)
    }
  }

  const resetFormData = () => {
    setFormData({
      title: '',
      excerpt: '',
      content: '',
      category: 'news',
      featured_image_url: '',
      is_published: false,
      is_featured: false
    })
  }

  const handleCreateNews = () => {
    setEditingNews(null)
    resetFormData()
    setShowForm(true)
  }

  const handleEditNews = (newsItem) => {
    setEditingNews(newsItem)
    setFormData({
      title: newsItem.title || '',
      excerpt: newsItem.excerpt || '',
      content: newsItem.content || '',
      category: newsItem.category || 'news',
      featured_image_url: newsItem.featured_image_url || '',
      is_published: newsItem.is_published || false,
      is_featured: newsItem.is_featured || false
    })
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingNews(null)
    resetFormData()
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
      const fileName = `news/${Date.now()}-${file.name}`
      await uploadToStorage('news-images', fileName, file)
      const imageUrl = getStorageUrl('news-images', fileName)
      
      setFormData(prev => ({
        ...prev,
        featured_image_url: imageUrl
      }))
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Gagal upload gambar')
    } finally {
      setImageUploading(false)
    }
  }

  const handleSubmitForm = async (e) => {
    e.preventDefault()
    
    // Validation
    if (!formData.title.trim()) {
      alert('Judul berita wajib diisi')
      return
    }

    if (!formData.content.trim()) {
      alert('Konten berita wajib diisi')
      return
    }

    try {
      setFormLoading(true)
      
      let submitData = { ...formData }
      
      // Generate slug if creating new news
      if (!editingNews) {
        submitData.slug = await createNewsSlug(formData.title)
      }

      let result
      if (editingNews) {
        result = await updateNews(editingNews.id, submitData)
      } else {
        result = await createNews(submitData)
      }

      await fetchNews()
      setShowForm(false)
      setEditingNews(null)
      resetFormData()
      alert(`Berita berhasil ${editingNews ? 'diperbarui' : 'ditambahkan'}`)
    } catch (error) {
      console.error('Error saving news:', error)
      alert(`Gagal ${editingNews ? 'memperbarui' : 'menambahkan'} berita`)
    } finally {
      setFormLoading(false)
    }
  }

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await toggleNewsStatus(id, !currentStatus)
      await fetchNews()
    } catch (error) {
      console.error('Error toggling news status:', error)
      alert('Gagal mengubah status berita')
    }
  }

  const handleToggleFeatured = async (id, currentFeatured) => {
    try {
      await toggleNewsFeatured(id, !currentFeatured)
      await fetchNews()
    } catch (error) {
      console.error('Error toggling featured status:', error)
      alert('Gagal mengubah status unggulan')
    }
  }

  const handleDeleteNews = async (id) => {
    try {
      await deleteNews(id)
      await fetchNews()
      setDeleteConfirm(null)
      alert('Berita berhasil dihapus')
    } catch (error) {
      console.error('Error deleting news:', error)
      alert('Gagal menghapus berita')
    }
  }

  const columns = [
    {
      key: 'featured_image_url',
      title: 'Gambar',
      render: (value) => (
        <div style={{ width: '64px', height: '48px' }} className="bg-light rounded overflow-hidden">
          {value ? (
            <img 
              src={value} 
              alt="Featured" 
              className="w-100 h-100"
              style={{ objectFit: 'cover' }}
            />
          ) : (
            <div className="w-100 h-100 d-flex align-items-center justify-content-center">
              <Image size={16} className="text-muted" />
            </div>
          )}
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
          <small className="text-muted">{item.category}</small>
        </div>
      )
    },
    {
      key: 'excerpt',
      title: 'Ringkasan',
      render: (value) => (
        <div className="text-truncate text-muted small" style={{ maxWidth: '200px' }}>
          {value || '-'}
        </div>
      )
    },
    {
      key: 'is_published',
      title: 'Status',
      render: (value) => (
        <span className={`badge ${value ? 'bg-success' : 'bg-secondary'}`}>
          {value ? 'Dipublikasi' : 'Draft'}
        </span>
      )
    },
    {
      key: 'is_featured',
      title: 'Unggulan',
      render: (value) => (
        <div className="d-flex align-items-center">
          {value ? (
            <Star size={16} className="text-warning" fill="currentColor" />
          ) : (
            <StarOff size={16} className="text-muted" />
          )}
        </div>
      )
    },
    {
      key: 'published_at',
      title: 'Tanggal Publikasi',
      sortable: true,
      render: (value) => value ? new Date(value).toLocaleDateString('id-ID') : '-'
    },
    {
      key: 'actions',
      title: 'Aksi',
      render: (_, item) => (
        <div className="d-flex gap-1">
          <button
            onClick={() => handleToggleStatus(item.id, item.is_published)}
            className={`btn btn-sm btn-outline-${item.is_published ? 'warning' : 'success'}`}
            title={item.is_published ? 'Ubah ke Draft' : 'Publikasikan'}
          >
            {item.is_published ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
          
          <button
            onClick={() => handleToggleFeatured(item.id, item.is_featured)}
            className={`btn btn-sm ${item.is_featured ? 'btn-warning' : 'btn-outline-secondary'}`}
            title={item.is_featured ? 'Hapus dari Unggulan' : 'Jadikan Unggulan'}
          >
            {item.is_featured ? <Star size={14} fill="currentColor" /> : <StarOff size={14} />}
          </button>
          
          <button
            onClick={() => handleEditNews(item)}
            className="btn btn-sm btn-outline-primary"
            title="Edit"
          >
            <Edit size={14} />
          </button>
          
          <button
            onClick={() => setDeleteConfirm(item)}
            className="btn btn-sm btn-outline-danger"
            title="Hapus"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )
    }
  ]

  // If form is shown, render form view
  if (showForm) {
    return (
      <div className="container-fluid py-4">
        {/* Form Header */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="d-flex align-items-center gap-3 mb-3">
              <button
                onClick={handleCloseForm}
                className="btn btn-outline-secondary d-flex align-items-center gap-2"
                disabled={formLoading}
              >
                <ArrowLeft size={16} />
                Kembali
              </button>
              <div>
                <h1 className="h2 fw-bold text-dark mb-1">
                  {editingNews ? 'Edit Berita' : 'Tambah Berita Baru'}
                </h1>
                <p className="text-muted mb-0">
                  {editingNews ? 'Perbarui informasi berita' : 'Buat berita, pengumuman, atau artikel baru'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="row">
          <div className="col-12">
            <form onSubmit={handleSubmitForm}>
              <div className="row">
                {/* Main Content */}
                <div className="col-lg-8">
                  <div className="card mb-4">
                    <div className="card-header">
                      <h5 className="card-title mb-0">Konten Berita</h5>
                    </div>
                    <div className="card-body">
                      {/* Title */}
                      <div className="mb-3">
                        <label htmlFor="title" className="form-label fw-semibold">
                          Judul Berita <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control form-control-lg"
                          id="title"
                          name="title"
                          value={formData.title}
                          onChange={handleInputChange}
                          placeholder="Masukkan judul berita yang menarik..."
                          maxLength={255}
                          required
                          disabled={formLoading}
                        />
                        <div className="form-text">
                          Judul yang baik akan menarik perhatian pembaca
                        </div>
                      </div>

                      {/* Excerpt */}
                      <div className="mb-3">
                        <label htmlFor="excerpt" className="form-label fw-semibold">
                          Ringkasan
                        </label>
                        <textarea
                          className="form-control"
                          id="excerpt"
                          name="excerpt"
                          value={formData.excerpt}
                          onChange={handleInputChange}
                          placeholder="Tulis ringkasan singkat yang menggambarkan isi berita..."
                          rows={3}
                          disabled={formLoading}
                        />
                        <div className="form-text">
                          Ringkasan akan ditampilkan di halaman daftar berita dan media sosial
                        </div>
                      </div>

                      {/* Content */}
                      <div className="mb-3">
                        <label htmlFor="content" className="form-label fw-semibold">
                          Konten Berita <span className="text-danger">*</span>
                        </label>
                        <textarea
                          className="form-control"
                          id="content"
                          name="content"
                          value={formData.content}
                          onChange={handleInputChange}
                          placeholder="Tulis konten berita lengkap di sini..."
                          rows={15}
                          required
                          disabled={formLoading}
                        />
                        <div className="form-text">
                          Tulis konten dengan lengkap dan informatif
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sidebar */}
                <div className="col-lg-4">
                  {/* Publishing Options */}
                  <div className="card mb-4">
                    <div className="card-header">
                      <h5 className="card-title mb-0">Pengaturan Publikasi</h5>
                    </div>
                    <div className="card-body">
                      {/* Category */}
                      <div className="mb-3">
                        <label htmlFor="category" className="form-label fw-semibold">
                          Kategori <span className="text-danger">*</span>
                        </label>
                        <select
                          className="form-select"
                          id="category"
                          name="category"
                          value={formData.category}
                          onChange={handleInputChange}
                          required
                          disabled={formLoading}
                        >
                          <option value="news">Berita</option>
                          <option value="announcement">Pengumuman</option>
                          <option value="event">Acara</option>
                        </select>
                      </div>

                      {/* Status Checkboxes */}
                      <div className="mb-3">
                        <div className="form-check mb-2">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="is_published"
                            name="is_published"
                            checked={formData.is_published}
                            onChange={handleInputChange}
                            disabled={formLoading}
                          />
                          <label className="form-check-label fw-semibold" htmlFor="is_published">
                            <Eye size={16} className="me-1" />
                            Publikasikan Berita
                          </label>
                          <div className="form-text small">
                            Berita akan terlihat oleh pengunjung website
                          </div>
                        </div>
                        
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="is_featured"
                            name="is_featured"
                            checked={formData.is_featured}
                            onChange={handleInputChange}
                            disabled={formLoading}
                          />
                          <label className="form-check-label fw-semibold" htmlFor="is_featured">
                            <Star size={16} className="me-1" />
                            Jadikan Berita Unggulan
                          </label>
                          <div className="form-text small">
                            Berita akan ditampilkan di bagian utama website
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Featured Image */}
                  <div className="card mb-4">
                    <div className="card-header">
                      <h5 className="card-title mb-0">Gambar Utama</h5>
                    </div>
                    <div className="card-body">
                      {/* Image Preview */}
                      {formData.featured_image_url && (
                        <div className="mb-3">
                          <img
                            src={formData.featured_image_url}
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
                          id="featured_image"
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
                        <strong>Rekomendasi:</strong> 1200x630px untuk hasil terbaik
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
                              {editingNews ? 'Memperbarui...' : 'Menyimpan...'}
                            </>
                          ) : (
                            <>
                              <Save size={16} className="me-2" />
                              {editingNews ? 'Perbarui Berita' : 'Simpan Berita'}
                            </>
                          )}
                        </button>
                        
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={handleCloseForm}
                          disabled={formLoading}
                        >
                          <X size={16} className="me-2" />
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

  // Default list view
  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3">
            <div>
              <h1 className="h2 fw-bold text-dark mb-1">Kelola Berita</h1>
              <p className="text-muted mb-0">Kelola berita, pengumuman, dan artikel sekolah</p>
            </div>
            <button
              onClick={handleCreateNews}
              className="btn btn-primary btn-lg d-flex align-items-center gap-2"
            >
              <Plus size={18} />
              <span>Tambah Berita</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-3">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-body d-flex align-items-center">
              <div className="me-3">
                <div className="rounded-circle bg-primary bg-opacity-10 p-3">
                  <FileText size={24} className="text-primary" />
                </div>
              </div>
              <div className="flex-grow-1 min-w-0">
                <p className="small fw-medium text-muted mb-1">Total Berita</p>
                <p className="h4 fw-bold mb-0">{news.length}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-6 col-lg-3">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-body d-flex align-items-center">
              <div className="me-3">
                <div className="rounded-circle bg-success bg-opacity-10 p-3">
                  <Eye size={24} className="text-success" />
                </div>
              </div>
              <div className="flex-grow-1 min-w-0">
                <p className="small fw-medium text-muted mb-1">Dipublikasi</p>
                <p className="h4 fw-bold mb-0">
                  {news.filter(item => item.is_published).length}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-6 col-lg-3">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-body d-flex align-items-center">
              <div className="me-3">
                <div className="rounded-circle bg-secondary bg-opacity-10 p-3">
                  <EyeOff size={24} className="text-secondary" />
                </div>
              </div>
              <div className="flex-grow-1 min-w-0">
                <p className="small fw-medium text-muted mb-1">Draft</p>
                <p className="h4 fw-bold mb-0">
                  {news.filter(item => !item.is_published).length}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-6 col-lg-3">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-body d-flex align-items-center">
              <div className="me-3">
                <div className="rounded-circle bg-warning bg-opacity-10 p-3">
                  <Star size={24} className="text-warning" />
                </div>
              </div>
              <div className="flex-grow-1 min-w-0">
                <p className="small fw-medium text-muted mb-1">Unggulan</p>
                <p className="h4 fw-bold mb-0">
                  {news.filter(item => item.is_featured).length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="row">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="table-responsive">
                <DataTable
                  data={news}
                  columns={columns}
                  loading={loading}
                  searchable={true}
                  onRefresh={fetchNews}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header border-0 pb-2">
                <div className="d-flex align-items-center">
                  <div className="rounded-circle bg-danger bg-opacity-10 p-2 me-3">
                    <AlertCircle size={20} className="text-danger" />
                  </div>
                  <h5 className="modal-title mb-0">Konfirmasi Hapus</h5>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setDeleteConfirm(null)}
                ></button>
              </div>
              
              <div className="modal-body pt-0">
                <p className="text-muted mb-0">
                  Apakah Anda yakin ingin menghapus berita "<strong>{deleteConfirm.title}</strong>"? 
                  Tindakan ini tidak dapat dibatalkan.
                </p>
              </div>
              
              <div className="modal-footer border-0 pt-0">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setDeleteConfirm(null)}
                >
                  Batal
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => handleDeleteNews(deleteConfirm.id)}
                >
                  <Trash2 size={16} className="me-2" />
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

export default NewsAdmin