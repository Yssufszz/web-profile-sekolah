// src/admin/PPDBPeriodManagement.jsx
import React, { useState, useEffect } from 'react'
import { 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Calendar,
  Save,
  X
} from 'lucide-react'
import DataTable from './components/DataTable'
import { 
  getAllPPDBPeriods,
  createPPDBPeriod,
  updatePPDBPeriod,
  deletePPDBPeriod,
  togglePPDBPeriodStatus
} from '../services/apiAdmin'

const PPDBPeriodManagement = () => {
  const [periods, setPeriods] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    academic_year: '',
    registration_start: '',
    registration_end: '',
    announcement_date: '',
    max_students: '',
    registration_fee: '',
    requirements: [],
    documents_needed: [],
    selection_process: []
  })
  const [arrayInputs, setArrayInputs] = useState({
    requirements: '',
    documents_needed: '',
    selection_process: ''
  })

  useEffect(() => {
    loadPeriods()
  }, [])

  const loadPeriods = async () => {
    try {
      setLoading(true)
      const periodsData = await getAllPPDBPeriods()
      setPeriods(periodsData)
    } catch (error) {
      console.error('Error loading periods:', error)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      academic_year: '',
      registration_start: '',
      registration_end: '',
      announcement_date: '',
      max_students: '',
      registration_fee: '',
      requirements: [],
      documents_needed: [],
      selection_process: []
    })
    setArrayInputs({
      requirements: '',
      documents_needed: '',
      selection_process: ''
    })
    setSelectedPeriod(null)
    setShowForm(false)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleArrayInputChange = (field, value) => {
    setArrayInputs(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const addArrayItem = (field) => {
    const value = arrayInputs[field].trim()
    if (value) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], value]
      }))
      setArrayInputs(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const removeArrayItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      setLoading(true)
      
      // Prepare form data
      const submitData = {
        ...formData,
        max_students: parseInt(formData.max_students),
        registration_fee: formData.registration_fee ? parseInt(formData.registration_fee) : 0
      }
      
      if (selectedPeriod) {
        await updatePPDBPeriod(selectedPeriod.id, submitData)
      } else {
        await createPPDBPeriod(submitData)
      }
      
      await loadPeriods()
      resetForm()
    } catch (error) {
      console.error('Error saving period:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (period) => {
    setSelectedPeriod(period)
    setFormData({
      academic_year: period.academic_year || '',
      registration_start: period.registration_start || '',
      registration_end: period.registration_end || '',
      announcement_date: period.announcement_date || '',
      max_students: period.max_students?.toString() || '',
      registration_fee: period.registration_fee?.toString() || '',
      requirements: period.requirements || [],
      documents_needed: period.documents_needed || [],
      selection_process: period.selection_process || []
    })
    setShowForm(true)
  }

  const handleDeletePeriod = async (id) => {
    if (!confirm('Apakah Anda yakin ingin menghapus periode PPDB ini?')) return
    
    try {
      setLoading(true)
      await deletePPDBPeriod(id)
      await loadPeriods()
    } catch (error) {
      console.error('Error deleting period:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTogglePeriodStatus = async (id, isActive) => {
    try {
      setLoading(true)
      await togglePPDBPeriodStatus(id, isActive)
      await loadPeriods()
    } catch (error) {
      console.error('Error toggling period status:', error)
    } finally {
      setLoading(false)
    }
  }

  // Table Columns
  const periodColumns = [
    {
      key: 'academic_year',
      title: 'Tahun Ajaran',
      sortable: true
    },
    {
      key: 'registration_start',
      title: 'Periode Pendaftaran',
      render: (value, item) => (
        <div className="small">
          <div>{new Date(item.registration_start).toLocaleDateString('id-ID')}</div>
          <div className="text-muted">s/d {new Date(item.registration_end).toLocaleDateString('id-ID')}</div>
        </div>
      )
    },
    {
      key: 'max_students',
      title: 'Kuota',
      render: (value) => value?.toLocaleString('id-ID')
    },
    {
      key: 'registration_fee',
      title: 'Biaya',
      render: (value) => value ? `Rp ${value.toLocaleString('id-ID')}` : 'Gratis'
    },
    {
      key: 'is_active',
      title: 'Status',
      render: (value) => (
        <span className={`badge ${value ? 'bg-success' : 'bg-secondary'}`}>
          {value ? 'Aktif' : 'Tidak Aktif'}
        </span>
      )
    },
    {
      key: 'actions',
      title: 'Aksi',
      render: (value, item) => (
        <div className="d-flex gap-2">
          <button
            onClick={() => handleEdit(item)}
            className="btn btn-outline-primary btn-sm"
            title="Edit"
          >
            <Edit3 className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleTogglePeriodStatus(item.id, !item.is_active)}
            className={`btn btn-sm ${item.is_active ? 'btn-outline-danger' : 'btn-outline-success'}`}
            title={item.is_active ? 'Nonaktifkan' : 'Aktifkan'}
          >
            {item.is_active ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
          </button>
          <button
            onClick={() => handleDeletePeriod(item.id)}
            className="btn btn-outline-danger btn-sm"
            title="Hapus"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ]

  return (
    <div className="container-fluid py-4" style={{overflowX: 'hidden'}}>
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center flex-wrap">
            <div className="mb-2 mb-md-0">
              <h1 className="h2 mb-1 text-dark">Manajemen Periode PPDB</h1>
              <p className="text-muted mb-0 small">Kelola periode penerimaan peserta didik baru</p>
            </div>
          </div>
        </div>
      </div>

      {/* Inline Form */}
      {showForm && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="card-title mb-0">
                    {selectedPeriod ? 'Edit Periode PPDB' : 'Tambah Periode PPDB'}
                  </h5>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="btn btn-outline-secondary btn-sm"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    {/* Academic Year */}
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Tahun Ajaran <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        name="academic_year"
                        className="form-control"
                        placeholder="2024/2025"
                        value={formData.academic_year}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    {/* Max Students */}
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Kuota Maksimal Siswa <span className="text-danger">*</span></label>
                      <input
                        type="number"
                        name="max_students"
                        className="form-control"
                        min="1"
                        value={formData.max_students}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    {/* Registration Start */}
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Tanggal Mulai Pendaftaran <span className="text-danger">*</span></label>
                      <input
                        type="date"
                        name="registration_start"
                        className="form-control"
                        value={formData.registration_start}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    {/* Registration End */}
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Tanggal Akhir Pendaftaran <span className="text-danger">*</span></label>
                      <input
                        type="date"
                        name="registration_end"
                        className="form-control"
                        value={formData.registration_end}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    {/* Announcement Date */}
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Tanggal Pengumuman</label>
                      <input
                        type="date"
                        name="announcement_date"
                        className="form-control"
                        value={formData.announcement_date}
                        onChange={handleInputChange}
                      />
                    </div>

                    {/* Registration Fee */}
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Biaya Pendaftaran</label>
                      <input
                        type="number"
                        name="registration_fee"
                        className="form-control"
                        min="0"
                        step="1000"
                        placeholder="0"
                        value={formData.registration_fee}
                        onChange={handleInputChange}
                      />
                    </div>

                    {/* Requirements */}
                    <div className="col-12 mb-3">
                      <label className="form-label">Persyaratan</label>
                      <div className="input-group mb-2">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Masukkan persyaratan"
                          value={arrayInputs.requirements}
                          onChange={(e) => handleArrayInputChange('requirements', e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addArrayItem('requirements'))}
                        />
                        <button
                          type="button"
                          className="btn btn-outline-primary"
                          onClick={() => addArrayItem('requirements')}
                        >
                          Tambah
                        </button>
                      </div>
                      {formData.requirements.length > 0 && (
                        <div className="d-flex flex-wrap gap-1">
                          {formData.requirements.map((req, index) => (
                            <span key={index} className="badge bg-light text-dark border">
                              {req}
                              <button
                                type="button"
                                className="btn-close btn-close-sm ms-1"
                                onClick={() => removeArrayItem('requirements', index)}
                                style={{fontSize: '0.6em'}}
                              ></button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Documents Needed */}
                    <div className="col-12 mb-3">
                      <label className="form-label">Dokumen yang Diperlukan</label>
                      <div className="input-group mb-2">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Masukkan dokumen yang diperlukan"
                          value={arrayInputs.documents_needed}
                          onChange={(e) => handleArrayInputChange('documents_needed', e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addArrayItem('documents_needed'))}
                        />
                        <button
                          type="button"
                          className="btn btn-outline-primary"
                          onClick={() => addArrayItem('documents_needed')}
                        >
                          Tambah
                        </button>
                      </div>
                      {formData.documents_needed.length > 0 && (
                        <div className="d-flex flex-wrap gap-1">
                          {formData.documents_needed.map((doc, index) => (
                            <span key={index} className="badge bg-light text-dark border">
                              {doc}
                              <button
                                type="button"
                                className="btn-close btn-close-sm ms-1"
                                onClick={() => removeArrayItem('documents_needed', index)}
                                style={{fontSize: '0.6em'}}
                              ></button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Selection Process */}
                    <div className="col-12 mb-3">
                      <label className="form-label">Proses Seleksi</label>
                      <div className="input-group mb-2">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Masukkan tahapan seleksi"
                          value={arrayInputs.selection_process}
                          onChange={(e) => handleArrayInputChange('selection_process', e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addArrayItem('selection_process'))}
                        />
                        <button
                          type="button"
                          className="btn btn-outline-primary"
                          onClick={() => addArrayItem('selection_process')}
                        >
                          Tambah
                        </button>
                      </div>
                      {formData.selection_process.length > 0 && (
                        <div className="d-flex flex-wrap gap-1">
                          {formData.selection_process.map((process, index) => (
                            <span key={index} className="badge bg-light text-dark border">
                              {process}
                              <button
                                type="button"
                                className="btn-close btn-close-sm ms-1"
                                onClick={() => removeArrayItem('selection_process', index)}
                                style={{fontSize: '0.6em'}}
                              ></button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="d-flex gap-2">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      <Save className="me-1" style={{width: '16px', height: '16px'}} />
                      {loading ? 'Menyimpan...' : (selectedPeriod ? 'Update' : 'Simpan')}
                    </button>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="btn btn-outline-secondary"
                    >
                      Batal
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Periods Section */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center flex-wrap">
              <div className="mb-2 mb-md-0">
                <h5 className="card-title mb-1 d-flex align-items-center">
                  <Calendar className="me-2" style={{width: '20px', height: '20px'}} />
                  Periode PPDB
                </h5>
                <small className="text-muted">Kelola periode penerimaan peserta didik baru</small>
              </div>
              <button
                onClick={() => setShowForm(true)}
                className="btn btn-primary d-flex align-items-center btn-sm"
                disabled={showForm}
              >
                <Plus className="me-1 me-md-2" style={{width: '16px', height: '16px'}} />
                <span className="d-none d-sm-inline">Tambah Periode</span>
                <span className="d-sm-none">Tambah</span>
              </button>
            </div>
            <div className="card-body p-2 p-md-3">
              <div className="table-responsive">
                <DataTable
                  data={periods}
                  columns={periodColumns}
                  loading={loading}
                  searchable={true}
                  onRefresh={loadPeriods}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PPDBPeriodManagement