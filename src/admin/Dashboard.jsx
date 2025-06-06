// src/admin/Dashboard.jsx
import React, { useState, useEffect } from 'react'
import { 
  Users, 
  Clock, 
  CheckCircle, 
  Newspaper, 
  BookOpen, 
  Camera,
  TrendingUp,
  Calendar,
  ArrowRight,
  Activity
} from 'lucide-react'
import AdminLayout from './components/AdminLayout'
import { getDashboardStats, getRecentRegistrations } from '../services/apiAdmin'
import { formatDate } from '../utils/helpers'

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    pendingRegistrations: 0,
    acceptedStudents: 0,
    totalNews: 0,
    totalSkills: 0,
    totalGallery: 0
  })
  const [recentRegistrations, setRecentRegistrations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const [statsData, recentData] = await Promise.all([
        getDashboardStats(),
        getRecentRegistrations(5)
      ])
      
      setStats(statsData)
      setRecentRegistrations(recentData)
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Total Pendaftar',
      value: stats.totalStudents,
      icon: Users,
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      shadowColor: 'rgba(102, 126, 234, 0.4)'
    },
    {
      title: 'Menunggu Verifikasi',
      value: stats.pendingRegistrations,
      icon: Clock,
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      shadowColor: 'rgba(240, 147, 251, 0.4)'
    },
    {
      title: 'Diterima',
      value: stats.acceptedStudents,
      icon: CheckCircle,
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      shadowColor: 'rgba(79, 172, 254, 0.4)'
    },
    {
      title: 'Total Berita',
      value: stats.totalNews,
      icon: Newspaper,
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      shadowColor: 'rgba(67, 233, 123, 0.4)'
    },
    {
      title: 'Kompetensi Keahlian',
      value: stats.totalSkills,
      icon: BookOpen,
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      shadowColor: 'rgba(250, 112, 154, 0.4)'
    },
    {
      title: 'Total Galeri',
      value: stats.totalGallery,
      icon: Camera,
      gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      shadowColor: 'rgba(168, 237, 234, 0.4)'
    }
  ]

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { 
        label: 'Menunggu', 
        className: 'badge rounded-pill',
        style: { 
          background: 'linear-gradient(45deg, #ffecd2 0%, #fcb69f 100%)',
          color: '#8b4513'
        }
      },
      accepted: { 
        label: 'Diterima', 
        className: 'badge rounded-pill',
        style: { 
          background: 'linear-gradient(45deg, #a8edea 0%, #fed6e3 100%)',
          color: '#2d5a5a'
        }
      },
      rejected: { 
        label: 'Ditolak', 
        className: 'badge rounded-pill',
        style: { 
          background: 'linear-gradient(45deg, #ffecd2 0%, #fcb69f 100%)',
          color: '#dc3545'
        }
      }
    }
    
    const statusInfo = statusMap[status] || { 
      label: status, 
      className: 'badge rounded-pill bg-secondary' 
    }
    
    return (
      <span className={statusInfo.className} style={statusInfo.style}>
        {statusInfo.label}
      </span>
    )
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="d-flex justify-content-center align-items-center" style={{ height: '16rem' }}>
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-muted">Memuat dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
      <div className="container-fluid">
        {/* Header with gradient background */}
        <div className="row mb-4">
          <div className="col-12">
            <div 
              className="rounded-4 p-4 text-white position-relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #0d6efd 0%, #0b5394 100%)',
                boxShadow: '0 10px 30px rgba(13, 110, 253, 0.3)'
              }}
            >
              <div className="position-relative" style={{ zIndex: 2 }}>
                <div className="d-flex align-items-center mb-2">
                  <Activity className="me-3" size={32} />
                  <h1 className="display-6 fw-bold mb-0">Dashboard</h1>
                </div>
                <p className="mb-0 opacity-75">Selamat datang di panel administrasi sekolah</p>
              </div>
              
              {/* Background decoration */}
              <div 
                className="position-absolute top-0 end-0 opacity-10"
                style={{
                  width: '200px',
                  height: '200px',
                  background: 'radial-gradient(circle, white 0%, transparent 70%)',
                  transform: 'translate(50px, -50px)'
                }}
              />
            </div>
          </div>
        </div>

        {/* Stats Cards with modern design */}
        <div className="row g-4 mb-4">
          {statCards.map((card, index) => {
            const Icon = card.icon
            return (
              <div key={index} className="col-12 col-md-6 col-lg-4">
                <div 
                  className="card h-100 border-0 position-relative overflow-hidden"
                  style={{
                    background: 'white',
                    boxShadow: `0 8px 25px ${card.shadowColor}`,
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)'
                    e.currentTarget.style.boxShadow = `0 15px 35px ${card.shadowColor}`
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = `0 8px 25px ${card.shadowColor}`
                  }}
                >
                  <div className="card-body p-4">
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="flex-grow-1">
                        <p className="text-muted small mb-2 text-uppercase fw-semibold tracking-wide">
                          {card.title}
                        </p>
                        <h2 className="fw-bold mb-0" style={{ fontSize: '2.5rem', color: '#2d3748' }}>
                          {card.value}
                        </h2>
                      </div>
                      <div 
                        className="d-flex align-items-center justify-content-center rounded-3 text-white"
                        style={{ 
                          width: '60px', 
                          height: '60px',
                          background: card.gradient,
                          boxShadow: `0 4px 15px ${card.shadowColor}`
                        }}
                      >
                        <Icon size={28} />
                      </div>
                    </div>
                  </div>
                  
                  {/* Card accent */}
                  <div 
                    className="position-absolute bottom-0 start-0 end-0"
                    style={{
                      height: '4px',
                      background: card.gradient
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        {/* Recent Registrations with modern table */}
        <div className="row mb-4">
          <div className="col-12">
            <div 
              className="card border-0 overflow-hidden"
              style={{
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.08)',
                borderRadius: '1rem'
              }}
            >
              <div 
                className="card-header border-0 text-white"
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  padding: '1.5rem'
                }}
              >
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="mb-1 fw-bold">Pendaftaran Terbaru</h5>
                    <p className="mb-0 opacity-75 small">Monitoring siswa yang baru mendaftar</p>
                  </div>
                  <a 
                    href="/admin/ppdb" 
                    className="btn btn-light btn-sm rounded-pill px-3 d-flex align-items-center"
                    style={{ transition: 'all 0.2s ease' }}
                  >
                    Lihat Semua
                    <ArrowRight size={16} className="ms-1" />
                  </a>
                </div>
              </div>
              
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead style={{ backgroundColor: '#f8fafc' }}>
                      <tr>
                        <th className="border-0 text-uppercase small fw-bold text-muted py-3 px-4">
                          No. Pendaftaran
                        </th>
                        <th className="border-0 text-uppercase small fw-bold text-muted py-3">
                          Nama Siswa
                        </th>
                        <th className="border-0 text-uppercase small fw-bold text-muted py-3">
                          Kompetensi Keahlian
                        </th>
                        <th className="border-0 text-uppercase small fw-bold text-muted py-3">
                          Status
                        </th>
                        <th className="border-0 text-uppercase small fw-bold text-muted py-3">
                          Tanggal Daftar
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentRegistrations.length > 0 ? (
                        recentRegistrations.map((registration, index) => (
                          <tr key={registration.id} className="border-0">
                            <td className="fw-bold py-3 px-4" style={{ color: '#4299e1' }}>
                              {registration.registration_number}
                            </td>
                            <td className="py-3">
                              <div className="fw-semibold text-dark">{registration.student_name}</div>
                              <div className="text-muted small">{registration.student_email}</div>
                            </td>
                            <td className="py-3">
                              <span 
                                className="badge rounded-pill px-3 py-2"
                                style={{
                                  background: 'linear-gradient(45deg, #e3f2fd 0%, #f3e5f5 100%)',
                                  color: '#5e72e4'
                                }}
                              >
                                {registration.skills?.name || '-'}
                              </span>
                            </td>
                            <td className="py-3">
                              {getStatusBadge(registration.status)}
                            </td>
                            <td className="text-muted py-3">
                              {formatDate(registration.created_at)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="text-center text-muted py-5">
                            <div className="d-flex flex-column align-items-center">
                              <Users size={48} className="text-muted mb-3 opacity-50" />
                              <p className="mb-0">Belum ada pendaftaran</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions with modern cards */}
        <div className="row">
          <div className="col-12">
            <div 
              className="card border-0"
              style={{
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.08)',
                borderRadius: '1rem'
              }}
            >
              <div className="card-body p-4">
                <div className="mb-4">
                  <h5 className="fw-bold text-dark mb-1">Aksi Cepat</h5>
                  <p className="text-muted mb-0">Akses fitur utama dengan sekali klik</p>
                </div>
                
                <div className="row g-4">
                  <div className="col-12 col-md-6 col-lg-3">
                    <a
                      href="/admin/ppdb"
                      className="card text-decoration-none h-100 border-0 overflow-hidden"
                      style={{ 
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-3px) scale(1.02)'
                        e.target.style.boxShadow = '0 12px 35px rgba(102, 126, 234, 0.4)'
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0) scale(1)'
                        e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.3)'
                      }}
                    >
                      <div className="card-body p-4 text-white">
                        <Users className="mb-3" size={40} />
                        <h6 className="fw-bold mb-2">Kelola PPDB</h6>
                        <p className="small mb-0 opacity-75">Verifikasi pendaftar baru</p>
                      </div>
                    </a>
                  </div>
                  
                  <div className="col-12 col-md-6 col-lg-3">
                    <a
                      href="/admin/news"
                      className="card text-decoration-none h-100 border-0 overflow-hidden"
                      style={{ 
                        background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 8px 25px rgba(67, 233, 123, 0.3)'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-3px) scale(1.02)'
                        e.target.style.boxShadow = '0 12px 35px rgba(67, 233, 123, 0.4)'
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0) scale(1)'
                        e.target.style.boxShadow = '0 8px 25px rgba(67, 233, 123, 0.3)'
                      }}
                    >
                      <div className="card-body p-4 text-white">
                        <Newspaper className="mb-3" size={40} />
                        <h6 className="fw-bold mb-2">Buat Berita</h6>
                        <p className="small mb-0 opacity-75">Publikasi pengumuman</p>
                      </div>
                    </a>
                  </div>
                  
                  <div className="col-12 col-md-6 col-lg-3">
                    <a
                      href="/admin/gallery"
                      className="card text-decoration-none h-100 border-0 overflow-hidden"
                      style={{ 
                        background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 8px 25px rgba(250, 112, 154, 0.3)'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-3px) scale(1.02)'
                        e.target.style.boxShadow = '0 12px 35px rgba(250, 112, 154, 0.4)'
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0) scale(1)'
                        e.target.style.boxShadow = '0 8px 25px rgba(250, 112, 154, 0.3)'
                      }}
                    >
                      <div className="card-body p-4 text-white">
                        <Camera className="mb-3" size={40} />
                        <h6 className="fw-bold mb-2">Upload Galeri</h6>
                        <p className="small mb-0 opacity-75">Tambah foto/video</p>
                      </div>
                    </a>
                  </div>
                  
                  <div className="col-12 col-md-6 col-lg-3">
                    <a
                      href="/admin/profile"
                      className="card text-decoration-none h-100 border-0 overflow-hidden"
                      style={{ 
                        background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 8px 25px rgba(79, 172, 254, 0.3)'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-3px) scale(1.02)'
                        e.target.style.boxShadow = '0 12px 35px rgba(79, 172, 254, 0.4)'
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0) scale(1)'
                        e.target.style.boxShadow = '0 8px 25px rgba(79, 172, 254, 0.3)'
                      }}
                    >
                      <div className="card-body p-4 text-white">
                        <Calendar className="mb-3" size={40} />
                        <h6 className="fw-bold mb-2">Update Profil</h6>
                        <p className="small mb-0 opacity-75">Edit data sekolah</p>
                      </div>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  )
}

export default Dashboard