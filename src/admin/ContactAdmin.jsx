// src/admin/ContactAdmin.jsx
import React, { useState, useEffect } from 'react'
import AdminLayout from './components/AdminLayout'
import DataTable from './components/DataTable'
import { 
  getAllContacts, 
  createContact, 
  updateContact, 
  deleteContact,
  updateContactOrder,
  toggleContactPrimary
} from '../services/apiAdmin'
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Phone, 
  Mail, 
  MapPin, 
  Globe,
  Star,
  StarOff,
  GripVertical,
  Save,
  X,
  Facebook,
  Instagram,
  MessageCircle,
  Youtube,
  ExternalLink
} from 'lucide-react'

const ContactAdmin = () => {
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingContact, setEditingContact] = useState(null)
  const [formLoading, setFormLoading] = useState(false)
  const [draggedItem, setDraggedItem] = useState(null)
  
  // Form state
  const [formData, setFormData] = useState({
    type: 'phone',
    label: '',
    value: '',
    icon: '',
    is_primary: false
  })
  const [formErrors, setFormErrors] = useState({})

  useEffect(() => {
    loadContacts()
  }, [])

  const loadContacts = async () => {
    try {
      setLoading(true)
      const data = await getAllContacts()
      setContacts(data)
    } catch (error) {
      console.error('Error loading contacts:', error)
      alert('Gagal memuat data kontak')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      type: 'phone',
      label: '',
      value: '',
      icon: '',
      is_primary: false
    })
    setFormErrors({})
  }

  const handleCreate = () => {
    resetForm()
    setEditingContact(null)
    setShowModal(true)
  }

  const handleEdit = (contact) => {
    setEditingContact(contact)
    setFormData({
      type: contact.type || 'phone',
      label: contact.label || '',
      value: contact.value || '',
      icon: contact.icon || '',
      is_primary: contact.is_primary || false
    })
    setFormErrors({})
    setShowModal(true)
  }

  const handleDelete = async (contact) => {
    if (!confirm(`Hapus kontak "${contact.label}"?`)) return

    try {
      await deleteContact(contact.id)
      await loadContacts()
      alert('Kontak berhasil dihapus')
    } catch (error) {
      console.error('Error deleting contact:', error)
      alert('Gagal menghapus kontak')
    }
  }

  const handleTogglePrimary = async (contact) => {
    try {
      await toggleContactPrimary(contact.id, !contact.is_primary)
      await loadContacts()
    } catch (error) {
      console.error('Error toggling primary:', error)
      alert('Gagal mengubah status utama')
    }
  }

  const validateForm = () => {
    const errors = {}
    
    if (!formData.type.trim()) {
      errors.type = 'Tipe kontak harus dipilih'
    }
    
    if (!formData.label.trim()) {
      errors.label = 'Label harus diisi'
    }
    
    if (!formData.value.trim()) {
      errors.value = 'Nilai kontak harus diisi'
    }

    // Validate email format if type is email
    if (formData.type === 'email' && formData.value.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.value)) {
        errors.value = 'Format email tidak valid'
      }
    }

    // Validate phone format if type is phone
    if (formData.type === 'phone' && formData.value.trim()) {
      const phoneRegex = /^[\d\s\-\+\(\)]+$/
      if (!phoneRegex.test(formData.value)) {
        errors.value = 'Format nomor telepon tidak valid'
      }
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    try {
      setFormLoading(true)
      
      const submitData = {
        ...formData,
        label: formData.label.trim(),
        value: formData.value.trim(),
        icon: formData.icon.trim() || null
      }
      
      if (editingContact) {
        await updateContact(editingContact.id, submitData)
        alert('Kontak berhasil diperbarui')
      } else {
        await createContact(submitData)
        alert('Kontak berhasil ditambahkan')
      }
      
      setShowModal(false)
      resetForm()
      setEditingContact(null)
      await loadContacts()
    } catch (error) {
      console.error('Error saving contact:', error)
      alert('Gagal menyimpan kontak')
    } finally {
      setFormLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))

    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleDragStart = (e, contact) => {
    setDraggedItem(contact)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = async (e, targetContact) => {
    e.preventDefault()
    
    if (!draggedItem || draggedItem.id === targetContact.id) return

    const oldIndex = contacts.findIndex(c => c.id === draggedItem.id)
    const newIndex = contacts.findIndex(c => c.id === targetContact.id)
    
    const newContacts = [...contacts]
    const [removed] = newContacts.splice(oldIndex, 1)
    newContacts.splice(newIndex, 0, removed)
    
    setContacts(newContacts)
    
    try {
      await updateContactOrder(newContacts)
    } catch (error) {
      console.error('Error updating order:', error)
      await loadContacts() // Reload on error
    }
    
    setDraggedItem(null)
  }

  const getIconForType = (type) => {
    switch (type) {
      case 'phone': return Phone
      case 'email': return Mail
      case 'location': return MapPin
      case 'social': return Globe
      default: return Phone
    }
  }

  const getSocialIcon = (value) => {
    const lowerValue = value.toLowerCase()
    if (lowerValue.includes('facebook')) return Facebook
    if (lowerValue.includes('instagram')) return Instagram
    if (lowerValue.includes('whatsapp') || lowerValue.includes('wa')) return MessageCircle
    if (lowerValue.includes('youtube')) return Youtube
    return ExternalLink
  }

  const contactTypes = [
    { value: 'phone', label: 'Telepon' },
    { value: 'email', label: 'Email' },
    { value: 'location', label: 'Lokasi' },
    { value: 'social', label: 'Media Sosial' }
  ]

  const getPlaceholderForType = (type) => {
    switch (type) {
      case 'phone': return 'Contoh: (021) 123-4567'
      case 'email': return 'Contoh: info@sekolah.com'
      case 'location': return 'Contoh: Jl. Pendidikan No. 123, Jakarta'
      case 'social': return 'Contoh: https://facebook.com/sekolah'
      default: return 'Masukkan nilai kontak'
    }
  }

  const tableColumns = [
    {
      key: 'drag',
      title: '',
      render: (_, contact) => (
        <div
          draggable
          onDragStart={(e) => handleDragStart(e, contact)}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, contact)}
          className="cursor-move p-1"
          style={{ cursor: 'move' }}
        >
          <GripVertical className="text-muted" style={{ width: '16px', height: '16px' }} />
        </div>
      )
    },
    {
      key: 'type',
      title: 'Tipe',
      render: (type, contact) => {
        const Icon = getIconForType(type)
        return (
          <div className="d-flex align-items-center">
            <Icon className="text-muted me-2" style={{ width: '16px', height: '16px' }} />
            <span className="text-capitalize">
              {contactTypes.find(t => t.value === type)?.label || type}
            </span>
          </div>
        )
      }
    },
    {
      key: 'label',
      title: 'Label',
      sortable: true,
      render: (label, contact) => (
        <div className="fw-medium text-dark">{label}</div>
      )
    },
    {
      key: 'value',
      title: 'Nilai',
      render: (value, contact) => (
        <div className="d-flex align-items-center">
          {contact.type === 'social' && (
            <>
              {React.createElement(getSocialIcon(value), { 
                className: "text-muted me-2", 
                style: { width: '14px', height: '14px' } 
              })}
            </>
          )}
          <div className="text-truncate" style={{ maxWidth: '200px' }} title={value}>
            {contact.type === 'email' ? (
              <a href={`mailto:${value}`} className="text-decoration-none">
                {value}
              </a>
            ) : contact.type === 'phone' ? (
              <a href={`tel:${value}`} className="text-decoration-none">
                {value}
              </a>
            ) : contact.type === 'social' ? (
              <a href={value} target="_blank" rel="noopener noreferrer" className="text-decoration-none">
                {value}
              </a>
            ) : (
              value
            )}
          </div>
        </div>
      )
    },
    {
      key: 'is_primary',
      title: 'Utama',
      render: (isPrimary, contact) => (
        <button
          onClick={() => handleTogglePrimary(contact)}
          className={`btn btn-sm p-1 border-0 ${
            isPrimary 
              ? 'text-warning' 
              : 'text-muted'
          }`}
          style={{ 
            backgroundColor: 'transparent',
            transition: 'color 0.2s ease'
          }}
          onMouseEnter={(e) => {
            if (!isPrimary) e.target.classList.add('text-warning')
          }}
          onMouseLeave={(e) => {
            if (!isPrimary) e.target.classList.remove('text-warning')
          }}
          title={isPrimary ? 'Kontak utama' : 'Jadikan kontak utama'}
        >
          {isPrimary ? 
            <Star style={{ width: '16px', height: '16px', fill: 'currentColor' }} /> : 
            <StarOff style={{ width: '16px', height: '16px' }} />
          }
        </button>
      )
    },
    {
      key: 'actions',
      title: 'Aksi',
      render: (_, contact) => (
        <div className="d-flex align-items-center gap-2">
          <button
            onClick={() => handleEdit(contact)}
            className="btn btn-sm btn-outline-primary p-1"
            title="Edit"
          >
            <Edit2 style={{ width: '16px', height: '16px' }} />
          </button>
          <button
            onClick={() => handleDelete(contact)}
            className="btn btn-sm btn-outline-danger p-1"
            title="Hapus"
          >
            <Trash2 style={{ width: '16px', height: '16px' }} />
          </button>
        </div>
      )
    }
  ]

  return (
    <div className="container-fluid px-3 py-4">
      <div className="row g-4">
        {/* Header */}
        <div className="col-12">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
            <div>
              <h1 className="h2 fw-bold text-dark mb-1">Kontak</h1>
              <p className="text-muted mb-0">Kelola informasi kontak sekolah</p>
            </div>
            <button
              onClick={handleCreate}
              className="btn btn-primary d-flex align-items-center gap-2 flex-shrink-0"
            >
              <Plus style={{ width: '16px', height: '16px' }} />
              <span>Tambah Kontak</span>
            </button>
          </div>
        </div>

        {/* Contact List */}
        <div className="col-12">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white border-bottom">
              <div className="row">
                <div className="col">
                  <h2 className="h5 fw-semibold text-dark mb-1">Daftar Kontak</h2>
                  <p className="small text-muted mb-0">
                    Drag dan drop untuk mengubah urutan kontak
                  </p>
                </div>
              </div>
            </div>
            
            <div className="card-body p-0">
              <div className="table-responsive">
                <DataTable
                  data={contacts}
                  columns={tableColumns}
                  loading={loading}
                  searchable={true}
                  onRefresh={loadContacts}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="col-12">
          <div className="alert alert-info border-info bg-light">
            <div className="d-flex align-items-start gap-3">
              <div className="flex-shrink-0">
                <Phone className="text-info" style={{ width: '20px', height: '20px', marginTop: '2px' }} />
              </div>
              <div className="flex-grow-1">
                <h6 className="alert-heading fw-medium text-info-emphasis mb-2">Tips Penggunaan</h6>
                <div className="small text-info-emphasis">
                  <ul className="mb-0 ps-3">
                    <li className="mb-1">Drag dan drop untuk mengubah urutan tampilan kontak</li>
                    <li className="mb-1">Tandai satu kontak sebagai "utama" untuk setiap tipe</li>
                    <li className="mb-1">Kontak utama akan ditampilkan lebih menonjol di website</li>
                    <li className="mb-0">Gunakan format yang konsisten untuk nomor telepon</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Form */}
      {showModal && (
        <div 
          className="modal fade show d-block" 
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          tabIndex="-1"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-semibold">
                  {editingContact ? 'Edit Kontak' : 'Tambah Kontak'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                  aria-label="Close"
                ></button>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row g-3">
                    {/* Contact Type */}
                    <div className="col-12">
                      <label htmlFor="type" className="form-label fw-medium">
                        Tipe Kontak <span className="text-danger">*</span>
                      </label>
                      <select
                        id="type"
                        name="type"
                        className={`form-select ${formErrors.type ? 'is-invalid' : ''}`}
                        value={formData.type}
                        onChange={handleInputChange}
                        required
                      >
                        {contactTypes.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                      {formErrors.type && (
                        <div className="invalid-feedback">
                          {formErrors.type}
                        </div>
                      )}
                    </div>

                    {/* Label */}
                    <div className="col-12">
                      <label htmlFor="label" className="form-label fw-medium">
                        Label <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        id="label"
                        name="label"
                        className={`form-control ${formErrors.label ? 'is-invalid' : ''}`}
                        value={formData.label}
                        onChange={handleInputChange}
                        placeholder="Contoh: Telepon Kantor, Email Sekolah"
                        required
                      />
                      {formErrors.label && (
                        <div className="invalid-feedback">
                          {formErrors.label}
                        </div>
                      )}
                    </div>

                    {/* Value */}
                    <div className="col-12">
                      <label htmlFor="value" className="form-label fw-medium">
                        Nilai <span className="text-danger">*</span>
                      </label>
                      <input
                        type={formData.type === 'email' ? 'email' : 'text'}
                        id="value"
                        name="value"
                        className={`form-control ${formErrors.value ? 'is-invalid' : ''}`}
                        value={formData.value}
                        onChange={handleInputChange}
                        placeholder={getPlaceholderForType(formData.type)}
                        required
                      />
                      {formErrors.value && (
                        <div className="invalid-feedback">
                          {formErrors.value}
                        </div>
                      )}
                    </div>

                    {/* Icon (Optional) */}
                    <div className="col-12">
                      <label htmlFor="icon" className="form-label fw-medium">
                        Icon (Opsional)
                      </label>
                      <input
                        type="text"
                        id="icon"
                        name="icon"
                        className="form-control"
                        value={formData.icon}
                        onChange={handleInputChange}
                        placeholder="Nama icon dari Lucide React"
                      />
                      <div className="form-text">
                        Contoh: Phone, Mail, MapPin, Facebook, Instagram
                      </div>
                    </div>

                    {/* Primary Contact */}
                    <div className="col-12">
                      <div className="form-check">
                        <input
                          type="checkbox"
                          id="is_primary"
                          name="is_primary"
                          className="form-check-input"
                          checked={formData.is_primary}
                          onChange={handleInputChange}
                        />
                        <label htmlFor="is_primary" className="form-check-label">
                          Jadikan sebagai kontak utama untuk tipe ini
                        </label>
                      </div>
                      <div className="form-text">
                        Kontak utama akan ditampilkan lebih menonjol di website
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                    disabled={formLoading}
                  >
                    <X style={{ width: '16px', height: '16px' }} className="me-1" />
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary d-flex align-items-center gap-2"
                    disabled={formLoading}
                  >
                    <Save style={{ width: '16px', height: '16px' }} />
                    <span>
                      {formLoading 
                        ? 'Menyimpan...' 
                        : editingContact 
                          ? 'Perbarui' 
                          : 'Simpan'
                      }
                    </span>
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

export default ContactAdmin