// src/admin/PPDBAdmin.jsx
import React, { useState, useEffect } from 'react'
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  Users, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Clock,
  Download,
  FileText,
  Settings,
  AlertCircle,
  User,
  Phone,
  Mail,
  MapPin,
  School,
  BookOpen
} from 'lucide-react'
import DataTable from './components/DataTable'
import { Form } from './components/FormBuilder'
import { 
  getAllPPDBPeriods,
  createPPDBPeriod,
  updatePPDBPeriod,
  deletePPDBPeriod,
  togglePPDBPeriodStatus,
  getAllPPDBRegistrations,
  updateRegistrationStatus,
  deleteRegistration,
  exportRegistrationsToCSV,
  getAllSkills
} from '../services/apiAdmin'

const PPDBAdmin = () => {
  const [activeTab, setActiveTab] = useState('periods')
  const [periods, setPeriods] = useState([])
  const [registrations, setRegistrations] = useState([])
  const [skills, setSkills] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState(null)
  const [selectedRegistration, setSelectedRegistration] = useState(null)
  const [showPeriodModal, setShowPeriodModal] = useState(false)
  const [showRegistrationModal, setShowRegistrationModal] = useState(false)
  const [showRegistrationDetail, setShowRegistrationDetail] = useState(false)
  const [filterStatus, setFilterStatus] = useState('')
  const [filterPeriod, setFilterPeriod] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [periodsData, skillsData] = await Promise.all([
        getAllPPDBPeriods(),
        getAllSkills()
      ])
      setPeriods(periodsData)
      setSkills(skillsData)
      
      if (periodsData.length > 0) {
        loadRegistrations()
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadRegistrations = async (periodId = null, status = null) => {
    try {
      setLoading(true)
      const data = await getAllPPDBRegistrations(periodId, status)
      setRegistrations(data)
    } catch (error) {
      console.error('Error loading registrations:', error)
    } finally {
      setLoading(false)
    }
  }

  // PPDB Periods Functions
  const handleCreatePeriod = async (formData) => {
    try {
      setLoading(true)
      await createPPDBPeriod(formData)
      await loadData()
      setShowPeriodModal(false)
      setSelectedPeriod(null)
    } catch (error) {
      console.error('Error creating period:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdatePeriod = async (formData) => {
    try {
      setLoading(true)
      await updatePPDBPeriod(selectedPeriod.id, formData)
      await loadData()
      setShowPeriodModal(false)
      setSelectedPeriod(null)
    } catch (error) {
      console.error('Error updating period:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePeriod = async (id) => {
    if (!confirm('Apakah Anda yakin ingin menghapus periode PPDB ini?')) return
    
    try {
      setLoading(true)
      await deletePPDBPeriod(id)
      await loadData()
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
      await loadData()
    } catch (error) {
      console.error('Error toggling period status:', error)
    } finally {
      setLoading(false)
    }
  }

  // Registration Functions
  const handleUpdateRegistrationStatus = async (id, status, notes = '') => {
    try {
      setLoading(true)
      await updateRegistrationStatus(id, status, notes)
      await loadRegistrations(filterPeriod, filterStatus)
    } catch (error) {
      console.error('Error updating registration status:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteRegistration = async (id) => {
    if (!confirm('Apakah Anda yakin ingin menghapus pendaftaran ini?')) return
    
    try {
      setLoading(true)
      await deleteRegistration(id)
      await loadRegistrations(filterPeriod, filterStatus)
    } catch (error) {
      console.error('Error deleting registration:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExportRegistrations = async () => {
    try {
      setLoading(true)
      const csvData = await exportRegistrationsToCSV(filterPeriod)
      
      // Convert to CSV string
      const headers = Object.keys(csvData[0]).join(',')
      const rows = csvData.map(row => Object.values(row).join(',')).join('\n')
      const csvContent = `${headers}\n${rows}`
      
      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `ppdb-registrations-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting registrations:', error)
    } finally {
      setLoading(false)
    }
  }

  // Form Fields
  const periodFields = [
    {
      name: 'academic_year',
      label: 'Tahun Ajaran',
      type: 'text',
      required: true,
      placeholder: '2024/2025'
    },
    {
      name: 'registration_start',
      label: 'Tanggal Mulai Pendaftaran',
      type: 'date',
      required: true
    },
    {
      name: 'registration_end',
      label: 'Tanggal Akhir Pendaftaran',
      type: 'date',
      required: true
    },
    {
      name: 'announcement_date',
      label: 'Tanggal Pengumuman',
      type: 'date'
    },
    {
      name: 'max_students',
      label: 'Kuota Maksimal Siswa',
      type: 'number',
      required: true,
      min: 1
    },
    {
      name: 'registration_fee',
      label: 'Biaya Pendaftaran',
      type: 'number',
      min: 0,
      step: 1000
    },
    {
      name: 'requirements',
      label: 'Persyaratan',
      type: 'array',
      placeholder: 'Masukkan persyaratan'
    },
    {
      name: 'documents_needed',
      label: 'Dokumen yang Diperlukan',
      type: 'array',
      placeholder: 'Masukkan dokumen yang diperlukan'
    },
    {
      name: 'selection_process',
      label: 'Proses Seleksi',
      type: 'array',
      placeholder: 'Masukkan tahapan seleksi'
    }
  ]

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
            onClick={() => {
              setSelectedPeriod(item)
              setShowPeriodModal(true)
            }}
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

  const registrationColumns = [
    {
      key: 'registration_number',
      title: 'No. Pendaftaran',
      sortable: true
    },
    {
      key: 'student_name',
      title: 'Nama Siswa',
      sortable: true
    },
    {
      key: 'student_email',
      title: 'Email',
      render: (value) => value || '-'
    },
    {
      key: 'skills',
      title: 'Kompetensi Keahlian',
      render: (value) => value?.name || '-'
    },
    {
      key: 'status',
      title: 'Status',
      render: (value) => {
        const statusConfig = {
          pending: { color: 'warning', text: 'Menunggu' },
          accepted: { color: 'success', text: 'Diterima' },
          rejected: { color: 'danger', text: 'Ditolak' }
        }
        const config = statusConfig[value] || statusConfig.pending
        return (
          <span className={`badge bg-${config.color}`}>
            {config.text}
          </span>
        )
      }
    },
    {
      key: 'created_at',
      title: 'Tanggal Daftar',
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString('id-ID')
    },
    {
      key: 'actions',
      title: 'Aksi',
      render: (value, item) => (
        <div className="d-flex gap-2">
          <button
            onClick={() => {
              setSelectedRegistration(item)
              setShowRegistrationDetail(true)
            }}
            className="btn btn-outline-info btn-sm"
            title="Lihat Detail"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              setSelectedRegistration(item)
              setShowRegistrationModal(true)
            }}
            className="btn btn-outline-primary btn-sm"
            title="Update Status"
          >
            <Settings className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDeleteRegistration(item.id)}
            className="btn btn-outline-danger btn-sm"
            title="Hapus"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ]

  const getStatusCounts = () => {
    return {
      total: registrations.length,
      pending: registrations.filter(r => r.status === 'pending').length,
      accepted: registrations.filter(r => r.status === 'accepted').length,
      rejected: registrations.filter(r => r.status === 'rejected').length
    }
  }

  const statusCounts = getStatusCounts()

  return (
    <div className="container-fluid py-4" style={{overflowX: 'hidden'}}>
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center flex-wrap">
            <div className="mb-2 mb-md-0">
              <h1 className="h2 mb-1 text-dark">Manajemen PPDB</h1>
              <p className="text-muted mb-0 small">Kelola periode dan pendaftaran PPDB</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="row mb-4">
        <div className="col-12">
          <ul className="nav nav-tabs flex-nowrap" style={{overflowX: 'auto', overflowY: 'hidden'}}>
            <li className="nav-item">
              <button
                onClick={() => setActiveTab('periods')}
                className={`nav-link d-flex align-items-center text-nowrap ${activeTab === 'periods' ? 'active' : ''}`}
              >
                <Calendar className="me-2" style={{width: '16px', height: '16px', minWidth: '16px'}} />
                <span className="d-none d-sm-inline">Periode PPDB</span>
                <span className="d-sm-none">Periode</span>
              </button>
            </li>
            <li className="nav-item">
              <button
                onClick={() => setActiveTab('registrations')}
                className={`nav-link d-flex align-items-center text-nowrap ${activeTab === 'registrations' ? 'active' : ''}`}
              >
                <Users className="me-2" style={{width: '16px', height: '16px', minWidth: '16px'}} />
                <span className="d-none d-sm-inline">Pendaftaran ({statusCounts.total})</span>
                <span className="d-sm-none">Daftar ({statusCounts.total})</span>
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Periods Tab */}
      {activeTab === 'periods' && (
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center flex-wrap">
                <div className="mb-2 mb-md-0">
                  <h5 className="card-title mb-1">Periode PPDB</h5>
                  <small className="text-muted">Kelola periode penerimaan peserta didik baru</small>
                </div>
                <button
                  onClick={() => {
                    setSelectedPeriod(null)
                    setShowPeriodModal(true)
                  }}
                  className="btn btn-primary d-flex align-items-center btn-sm"
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
                    onRefresh={loadData}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Registrations Tab */}
      {activeTab === 'registrations' && (
        <div className="row">
          <div className="col-12">
            {/* Statistics Cards */}
            <div className="row mb-4 g-3">
              <div className="col-6 col-md-3">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body p-3">
                    <div className="d-flex align-items-center">
                      <div className="p-2 p-md-3 bg-primary bg-opacity-10 rounded-3 me-2 me-md-3">
                        <Users className="text-primary" style={{width: '20px', height: '20px'}} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <small className="text-muted d-block text-truncate">Total Pendaftar</small>
                        <h4 className="mb-0 h5 h-md-4">{statusCounts.total}</h4>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body p-3">
                    <div className="d-flex align-items-center">
                      <div className="p-2 p-md-3 bg-warning bg-opacity-10 rounded-3 me-2 me-md-3">
                        <Clock className="text-warning" style={{width: '20px', height: '20px'}} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <small className="text-muted d-block text-truncate">Menunggu</small>
                        <h4 className="mb-0 h5 h-md-4">{statusCounts.pending}</h4>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body p-3">
                    <div className="d-flex align-items-center">
                      <div className="p-2 p-md-3 bg-success bg-opacity-10 rounded-3 me-2 me-md-3">
                        <CheckCircle className="text-success" style={{width: '20px', height: '20px'}} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <small className="text-muted d-block text-truncate">Diterima</small>
                        <h4 className="mb-0 h5 h-md-4">{statusCounts.accepted}</h4>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body p-3">
                    <div className="d-flex align-items-center">
                      <div className="p-2 p-md-3 bg-danger bg-opacity-10 rounded-3 me-2 me-md-3">
                        <XCircle className="text-danger" style={{width: '20px', height: '20px'}} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <small className="text-muted d-block text-truncate">Ditolak</small>
                        <h4 className="mb-0 h5 h-md-4">{statusCounts.rejected}</h4>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters and Actions */}
            <div className="card">
              <div className="card-header p-3">
                <div className="row align-items-center g-3">
                  <div className="col-12 col-lg-8">
                    <div className="row g-2">
                      <div className="col-12 col-sm-6">
                        <select
                          value={filterPeriod}
                          onChange={(e) => {
                            setFilterPeriod(e.target.value)
                            loadRegistrations(e.target.value, filterStatus)
                          }}
                          className="form-select form-select-sm"
                        >
                          <option value="">Semua Periode</option>
                          {periods.map(period => (
                            <option key={period.id} value={period.id}>
                              {period.academic_year}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-12 col-sm-6">
                        <select
                          value={filterStatus}
                          onChange={(e) => {
                            setFilterStatus(e.target.value)
                            loadRegistrations(filterPeriod, e.target.value)
                          }}
                          className="form-select form-select-sm"
                        >
                          <option value="">Semua Status</option>
                          <option value="pending">Menunggu</option>
                          <option value="accepted">Diterima</option>
                          <option value="rejected">Ditolak</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="col-12 col-lg-4 d-flex justify-content-end">
                    <button
                      onClick={handleExportRegistrations}
                      className="btn btn-success d-flex align-items-center btn-sm w-100 w-lg-auto justify-content-center"
                    >
                      <Download className="me-1 me-md-2" style={{width: '16px', height: '16px'}} />
                      <span className="d-none d-sm-inline">Export CSV</span>
                      <span className="d-sm-none">Export</span>
                    </button>
                  </div>
                </div>
              </div>
              <div className="card-body p-2 p-md-3">
                <div className="table-responsive">
                  <DataTable
                    data={registrations}
                    columns={registrationColumns}
                    loading={loading}
                    searchable={true}
                    onRefresh={() => loadRegistrations(filterPeriod, filterStatus)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Period Modal */}
      {showPeriodModal && (
        <div className="modal show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content mx-3 mx-md-0">
              <Form
                fields={periodFields}
                initialData={selectedPeriod || {}}
                onSubmit={selectedPeriod ? handleUpdatePeriod : handleCreatePeriod}
                onCancel={() => {
                  setShowPeriodModal(false)
                  setSelectedPeriod(null)
                }}
                loading={loading}
                title={selectedPeriod ? 'Edit Periode PPDB' : 'Tambah Periode PPDB'}
                submitText={selectedPeriod ? 'Update' : 'Simpan'}
              />
            </div>
          </div>
        </div>
      )}

      {/* Registration Status Modal */}
      {showRegistrationModal && selectedRegistration && (
        <div className="modal show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content mx-3 mx-md-0">
              <div className="modal-header">
                <h5 className="modal-title">Update Status Pendaftaran</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowRegistrationModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p className="text-muted mb-3 small">
                  {selectedRegistration.student_name} - {selectedRegistration.registration_number}
                </p>
                
                <div className="mb-3">
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    defaultValue={selectedRegistration.status}
                    onChange={(e) => {
                      const notes = prompt('Catatan (opsional):')
                      handleUpdateRegistrationStatus(selectedRegistration.id, e.target.value, notes)
                      setShowRegistrationModal(false)
                    }}
                  >
                    <option value="pending">Menunggu</option>
                    <option value="accepted">Diterima</option>
                    <option value="rejected">Ditolak</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowRegistrationModal(false)}
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Registration Detail Modal */}
      {showRegistrationDetail && selectedRegistration && (
        <div className="modal show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content mx-2 mx-md-0">
              <div className="modal-header">
                <h5 className="modal-title">Detail Pendaftaran</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowRegistrationDetail(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  {/* Student Info */}
                  <div className="col-12 col-lg-6">
                    <div className="card h-100">
                      <div className="card-header">
                        <h6 className="card-title mb-0 d-flex align-items-center">
                          <User className="me-2" style={{width: '20px', height: '20px'}} />
                          Informasi Siswa
                        </h6>
                      </div>
                      <div className="card-body">
                        <div className="row g-2">
                          <div className="col-12">
                            <small className="text-muted">No. Pendaftaran:</small>
                            <div className="fw-medium text-break">{selectedRegistration.registration_number}</div>
                          </div>
                          <div className="col-12">
                            <small className="text-muted">Nama:</small>
                            <div className="text-break">{selectedRegistration.student_name}</div>
                          </div>
                          <div className="col-12">
                            <small className="text-muted">Email:</small>
                            <div className="text-break">{selectedRegistration.student_email || '-'}</div>
                          </div>
                          <div className="col-12">
                            <small className="text-muted">Telepon:</small>
                            <div className="text-break">{selectedRegistration.student_phone || '-'}</div>
                          </div>
                          <div className="col-12">
                            <small className="text-muted">Tempat, Tanggal Lahir:</small>
                            <div className="text-break">
                              {selectedRegistration.birth_place}, {new Date(selectedRegistration.birth_date).toLocaleDateString('id-ID')}
                            </div>
                          </div>
                          <div className="col-12">
                            <small className="text-muted">Jenis Kelamin:</small>
                            <div>{selectedRegistration.gender}</div>
                          </div>
                          <div className="col-12">
                            <small className="text-muted">Alamat:</small>
                            <div className="text-break">{selectedRegistration.address}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Parent Info */}
                  <div className="col-12 col-lg-6">
                    <div className="card h-100">
                      <div className="card-header">
                        <h6 className="card-title mb-0 d-flex align-items-center">
                          <Users className="me-2" style={{width: '20px', height: '20px'}} />
                          Informasi Orang Tua
                        </h6>
                      </div>
                      <div className="card-body">
                        <div className="row g-2">
                          <div className="col-12">
                            <small className="text-muted">Nama:</small>
                            <div className="text-break">{selectedRegistration.parent_name}</div>
                          </div>
                          <div className="col-12">
                            <small className="text-muted">Telepon:</small>
                            <div className="text-break">{selectedRegistration.parent_phone}</div>
                          </div>
                          <div className="col-12">
                            <small className="text-muted">Email:</small>
                            <div className="text-break">{selectedRegistration.parent_email || '-'}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* School Info */}
                  <div className="col-12 col-lg-6">
                    <div className="card h-100">
                      <div className="card-header">
                        <h6 className="card-title mb-0 d-flex align-items-center">
                          <School className="me-2" style={{width: '20px', height: '20px'}} />
                          Informasi Sekolah
                        </h6>
                      </div>
                      <div className="card-body">
                        <div className="row g-2">
                          <div className="col-12">
                            <small className="text-muted">Sekolah Asal:</small>
                            <div className="text-break">{selectedRegistration.previous_school}</div>
                          </div>
                          <div className="col-12">
                            <small className="text-muted">Kompetensi Keahlian:</small>
                            <div className="text-break">{selectedRegistration.skills?.name || '-'}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status Info */}
                  <div className="col-12 col-lg-6">
                    <div className="card h-100">
                      <div className="card-header">
                        <h6 className="card-title mb-0 d-flex align-items-center">
                          <AlertCircle className="me-2" style={{width: '20px', height: '20px'}} />
                          Status Pendaftaran
                        </h6>
                      </div>
                      <div className="card-body">
                        <div className="row g-2">
                          <div className="col-12">
                            <small className="text-muted">Status:</small>
                            <div>
                              <span className={`badge ${
                                selectedRegistration.status === 'accepted' 
                                  ? 'bg-success'
                                  : selectedRegistration.status === 'rejected'
                                  ? 'bg-danger'
                                  : 'bg-warning'
                              }`}>
                                {selectedRegistration.status === 'accepted' ? 'Diterima' :
                                 selectedRegistration.status === 'rejected' ? 'Ditolak' : 'Menunggu'}
                              </span>
                            </div>
                          </div>
                          <div className="col-12">
                            <small className="text-muted">Tanggal Daftar:</small>
                            <div>{new Date(selectedRegistration.created_at).toLocaleDateString('id-ID')}</div>
                          </div>
                          {selectedRegistration.notes && (
                            <div className="col-12">
                              <small className="text-muted">Catatan:</small>
                              <div className="text-break">{selectedRegistration.notes}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Documents Section */}
                  {selectedRegistration.documents && (
                    <div className="col-12">
                      <div className="card">
                        <div className="card-header">
                          <h6 className="card-title mb-0 d-flex align-items-center">
                            <FileText className="me-2" style={{width: '20px', height: '20px'}} />
                            Dokumen
                          </h6>
                        </div>
                        <div className="card-body">
                          <div className="row g-3">
                            {Object.entries(selectedRegistration.documents).map(([key, url]) => (
                              <div key={key} className="col-12 col-sm-6 col-md-4 col-lg-3">
                                <div className="border rounded p-3 h-100">
                                  <div className="fw-medium text-capitalize mb-2 text-break">
                                    {key.replace('_', ' ')}
                                  </div>
                                  {url ? (
                                    <a
                                      href={url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-primary text-decoration-none small text-break"
                                    >
                                      Lihat Dokumen
                                    </a>
                                  ) : (
                                    <span className="text-muted small">Tidak tersedia</span>
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
              </div>
              <div className="modal-footer d-flex flex-column flex-sm-row justify-content-between">
                <div className="d-flex flex-column flex-sm-row gap-2 mb-2 mb-sm-0">
                  <button
                    onClick={() => {
                      setShowRegistrationDetail(false)
                      setSelectedRegistration(selectedRegistration)
                      setShowRegistrationModal(true)
                    }}
                    className="btn btn-primary d-flex align-items-center justify-content-center"
                  >
                    <Settings className="me-2" style={{width: '16px', height: '16px'}} />
                    Update Status
                  </button>
                  <button
                    onClick={() => handleDeleteRegistration(selectedRegistration.id)}
                    className="btn btn-danger d-flex align-items-center justify-content-center"
                  >
                    <Trash2 className="me-2" style={{width: '16px', height: '16px'}} />
                    Hapus
                  </button>
                </div>
                <button
                  onClick={() => setShowRegistrationDetail(false)}
                  className="btn btn-secondary"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PPDBAdmin