// src/admin/components/AdminLayout.jsx
import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { 
  Home, 
  User, 
  Users, 
  BookOpen, 
  Newspaper, 
  Camera, 
  Phone, 
  Settings,
  LogOut,
  Menu,
  X,
  Shield,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Calendar,
  FileText
} from 'lucide-react'
import { getCurrentAdmin, logoutAdmin } from '../../services/auth'
import { toast } from 'react-hot-toast'

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sessionExpired, setSessionExpired] = useState(false)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const [ppdbSubmenuOpen, setPpdbSubmenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    checkAuth()
    
    // Check if PPDB submenu should be open based on current route
    if (location.pathname.startsWith('/admin/ppdb')) {
      setPpdbSubmenuOpen(true)
    }
    
    // Check auth status periodically (every 5 minutes)
    const authCheckInterval = setInterval(checkAuth, 5 * 60 * 1000)
    
    // Session timeout warning (after 25 minutes of inactivity)
    let inactivityTimer
    const resetInactivityTimer = () => {
      clearTimeout(inactivityTimer)
      inactivityTimer = setTimeout(() => {
        setSessionExpired(true)
        toast.error('Sesi Anda akan berakhir dalam 5 menit. Silakan refresh halaman.')
      }, 25 * 60 * 1000)
    }

    // Track user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']
    events.forEach(event => {
      document.addEventListener(event, resetInactivityTimer, true)
    })

    resetInactivityTimer()

    return () => {
      clearInterval(authCheckInterval)
      clearTimeout(inactivityTimer)
      events.forEach(event => {
        document.removeEventListener(event, resetInactivityTimer, true)
      })
    }
  }, [location.pathname])

  const checkAuth = async () => {
    try {
      const currentAdmin = await getCurrentAdmin()
      if (!currentAdmin || !currentAdmin.admin) {
        handleUnauthorized()
        return
      }
      setAdmin(currentAdmin.admin)
      setSessionExpired(false)
    } catch (error) {
      console.error('Auth check failed:', error)
      handleUnauthorized()
    } finally {
      setLoading(false)
    }
  }

  const handleUnauthorized = () => {
    setAdmin(null)
    toast.error('Sesi Anda telah berakhir. Silakan login kembali.')
    navigate('/login', { replace: true })
  }

  const handleLogout = async () => {
    try {
      await logoutAdmin()
      toast.success('Berhasil logout')
      navigate('/login', { replace: true })
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Gagal logout')
    }
  }

  const menuItems = [
    { 
      path: '/admin/dashboard', 
      label: 'Dashboard', 
      icon: Home,
      roles: ['super_admin', 'admin', 'editor']
    },
    { 
      path: '/admin/profile', 
      label: 'Profil Sekolah', 
      icon: User,
      roles: ['super_admin', 'admin', 'editor']
    },
    { 
      path: '/admin/ppdb', 
      label: 'PPDB', 
      icon: Users,
      roles: ['super_admin', 'admin'],
      hasSubmenu: true,
      submenu: [
        {
          path: '/admin/ppdb',
          label: 'Periode PPDB',
          icon: Calendar,
          roles: ['super_admin', 'admin']
        },
        {
          path: '/admin/ppdb/registrations',
          label: 'Pendaftaran',
          icon: FileText,
          roles: ['super_admin', 'admin']
        }
      ]
    },
    { 
      path: '/admin/skills', 
      label: 'Kompetensi Keahlian', 
      icon: BookOpen,
      roles: ['super_admin', 'admin', 'editor']
    },
    { 
      path: '/admin/news', 
      label: 'Berita', 
      icon: Newspaper,
      roles: ['super_admin', 'admin', 'editor']
    },
    { 
      path: '/admin/gallery', 
      label: 'Galeri', 
      icon: Camera,
      roles: ['super_admin', 'admin', 'editor']
    },
    { 
      path: '/admin/contacts', 
      label: 'Kontak', 
      icon: Phone,
      roles: ['super_admin', 'admin']
    },
  ]

  // Filter menu items based on user role
  const allowedMenuItems = menuItems.filter(item => 
    !admin || item.roles.includes(admin.role)
  )

  const isActive = (path) => location.pathname === path
  const isParentActive = (item) => {
    if (item.hasSubmenu && item.submenu) {
      return item.submenu.some(subitem => location.pathname === subitem.path)
    }
    return location.pathname === item.path
  }

  const handlePpdbToggle = () => {
    setPpdbSubmenuOpen(!ppdbSubmenuOpen)
  }

  const getRoleColor = (role) => {
    switch (role) {
      case 'super_admin':
        return 'text-danger bg-danger-subtle'
      case 'admin':
        return 'text-primary bg-primary-subtle'
      case 'editor':
        return 'text-success bg-success-subtle'
      default:
        return 'text-secondary bg-secondary-subtle'
    }
  }

  const getRoleLabel = (role) => {
    switch (role) {
      case 'super_admin':
        return 'Super Admin'
      case 'admin':
        return 'Administrator'
      case 'editor':
        return 'Editor'
      default:
        return 'User'
    }
  }

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted">Memuat...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-layout-wrapper">
      {/* Session Expired Warning */}
      {sessionExpired && (
        <div 
          className="position-fixed bg-warning-subtle border border-warning rounded-3 p-3 shadow-lg"
          style={{ top: '5rem', right: '1rem', zIndex: 1050 }}
        >
          <div className="d-flex align-items-center">
            <AlertTriangle className="text-warning me-2" size={20} />
            <div>
              <p className="fw-medium text-warning-emphasis mb-1">Peringatan Sesi</p>
              <p className="small text-warning-emphasis mb-0">Sesi akan berakhir dalam 5 menit</p>
            </div>
          </div>
        </div>
      )}

      <div className="admin-layout">
        {/* Sidebar */}
        <aside 
          className={`sidebar bg-white shadow-lg ${sidebarOpen ? 'sidebar-open' : ''}`}
        >
          {/* Logo */}
          <div className="sidebar-header">
            <div className="d-flex align-items-center">
              <Shield className="text-white me-2" size={32} />
              <h1 className="h5 fw-bold text-white mb-0">Admin Panel</h1>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="btn btn-link text-white p-0 d-lg-none"
            >
              <X size={24} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="sidebar-nav">
            {allowedMenuItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.path)
              const parentActive = isParentActive(item)

              if (item.hasSubmenu) {
                return (
                  <div key={item.path} className="nav-item-group">
                    <button
                      onClick={handlePpdbToggle}
                      className={`nav-link nav-link-toggle ${parentActive ? 'active' : ''}`}
                    >
                      <Icon size={20} className="nav-icon" />
                      <span className="nav-text">{item.label}</span>
                      <ChevronRight 
                        size={16} 
                        className={`nav-toggle-icon ${ppdbSubmenuOpen ? 'rotated' : ''}`}
                      />
                    </button>
                    
                    <div className={`nav-submenu ${ppdbSubmenuOpen ? 'open' : ''}`}>
                      {item.submenu?.map((subitem) => {
                        const SubIcon = subitem.icon
                        const subActive = isActive(subitem.path)
                        return (
                          <Link
                            key={subitem.path}
                            to={subitem.path}
                            className={`nav-link nav-sublink ${subActive ? 'active' : ''}`}
                            onClick={() => setSidebarOpen(false)}
                          >
                            <SubIcon size={18} className="nav-icon" />
                            <span className="nav-text">{subitem.label}</span>
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                )
              }

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-link ${active ? 'active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon size={20} className="nav-icon" />
                  <span className="nav-text">{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* User Info (only visible on mobile) */}
          <div className="sidebar-footer d-lg-none">
            {admin && (
              <div className="user-info">
                <div className="d-flex align-items-center mb-2">
                  {admin.avatar_url ? (
                    <img
                      src={admin.avatar_url}
                      alt="Avatar"
                      className="user-avatar"
                    />
                  ) : (
                    <div className="user-avatar-placeholder">
                      <User className="text-white" size={20} />
                    </div>
                  )}
                  <div className="flex-grow-1 ms-3">
                    <p className="user-name">{admin.full_name}</p>
                    <span className={`badge rounded-pill ${getRoleColor(admin.role)}`}>
                      {getRoleLabel(admin.role)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <div className="main-wrapper">
          {/* Header */}
          <header className="main-header">
            <div className="header-left">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="btn btn-link text-secondary p-0 menu-toggle"
              >
                <Menu size={24} />
              </button>
            </div>
            
            <div className="header-right">
              {admin && (
                <div className="user-dropdown position-relative">
                  <button
                    className="btn btn-link text-decoration-none p-0 d-flex align-items-center"
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  >
                    <div className="d-flex align-items-center">
                      <span className="user-greeting d-none d-md-inline">
                        Selamat datang, <span className="fw-medium text-dark">{admin.full_name}</span>
                      </span>
                      <span className="user-greeting d-md-none fw-medium text-dark">
                        {admin.full_name}
                      </span>
                      {admin.avatar_url ? (
                        <img
                          src={admin.avatar_url}
                          alt="Avatar"
                          className="user-avatar-header ms-2"
                        />
                      ) : (
                        <div className="user-avatar-header-placeholder ms-2">
                          <User className="text-white" size={16} />
                        </div>
                      )}
                      <ChevronDown size={16} className="ms-1 text-muted" />
                    </div>
                  </button>
                  
                  {/* Dropdown Menu */}
                  {profileDropdownOpen && (
                    <div className="dropdown-menu-custom">
                      <div className="dropdown-header">
                        <div className="fw-medium text-dark">{admin.full_name}</div>
                        <small className={`badge rounded-pill ${getRoleColor(admin.role)}`}>
                          {getRoleLabel(admin.role)}
                        </small>
                      </div>
                      <div className="dropdown-divider"></div>
                      <button
                        onClick={handleLogout}
                        className="dropdown-item-custom"
                      >
                        <LogOut size={16} className="me-2" />
                        Keluar
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </header>

          {/* Page Content */}
          <main className="main-content">
            <div className="content-wrapper">
              {children}
            </div>
          </main>
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay d-lg-none"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Dropdown overlay */}
      {profileDropdownOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100"
          style={{ zIndex: 999 }}
          onClick={() => setProfileDropdownOpen(false)}
        />
      )}

      <style jsx>{`
        /* Base Layout - Prevent horizontal scroll */
        * {
          box-sizing: border-box;
        }

        html, body {
          overflow-x: hidden;
          margin: 0;
        }

        .admin-layout-wrapper {
          width: 100vw;
          height: 100vh;
          overflow: hidden;
          background-color: #f8f9fa;
        }

        .admin-layout {
          display: flex;
          width: 100%;
          height: 100%;
          position: relative;
        }

        /* Sidebar Styles */
        .sidebar {
          width: 16rem;
          min-width: 16rem;
          max-width: 16rem;
          display: flex;
          flex-direction: column;
          position: fixed;
          top: 0;
          left: 0;
          height: 100vh;
          z-index: 1040;
          transform: translateX(-100%);
          transition: transform 0.3s ease-in-out;
          overflow: hidden;
          background: white;
          box-shadow: 4px 0 8px rgba(0, 0, 0, 0.1);
        }

        .sidebar-open {
          transform: translateX(0);
        }

        .sidebar-header {
          height: 4rem;
          min-height: 4rem;
          padding: 0 1rem;
          background: linear-gradient(135deg, #0d6efd 0%, #0b5394 100%);
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          flex-shrink: 0;
        }

        .sidebar-nav {
          flex: 1;
          padding: 1rem 0;
          overflow-y: auto;
          overflow-x: hidden;
        }

        .nav-item-group {
          margin-bottom: 0;
        }

        .nav-link {
          display: flex;
          align-items: center;
          padding: 0.75rem 1rem;
          color: #374151;
          text-decoration: none;
          font-size: 0.875rem;
          font-weight: 500;
          transition: all 0.2s ease;
          border-left: 4px solid transparent;
          white-space: nowrap;
          border: none;
          background: none;
          width: 100%;
          text-align: left;
          cursor: pointer;
        }

        .nav-link:hover {
          background-color: #f8f9fa;
          color: #0d6efd;
        }

        .nav-link.active {
          background-color: #0d6efd;
          color: white;
          border-left-color: white;
        }

        .nav-link-toggle {
          position: relative;
          justify-content: space-between;
        }

        .nav-link-toggle.active {
          background-color: #e3f2fd;
          color: #0d6efd;
          border-left-color: #0d6efd;
        }

        .nav-toggle-icon {
          transition: transform 0.2s ease;
          margin-left: auto;
        }

        .nav-toggle-icon.rotated {
          transform: rotate(90deg);
        }

        .nav-submenu {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.3s ease-in-out;
          background-color: #f8f9fa;
        }

        .nav-submenu.open {
          max-height: 200px;
        }

        .nav-sublink {
          padding: 0.5rem 1rem 0.5rem 2.5rem;
          font-size: 0.8125rem;
          border-left: 4px solid transparent;
        }

        .nav-sublink:hover {
          background-color: #e9ecef;
          color: #0d6efd;
        }

        .nav-sublink.active {
          background-color: #0d6efd;
          color: white;
          border-left-color: white;
        }

        .nav-icon {
          margin-right: 0.75rem;
          flex-shrink: 0;
        }

        .nav-text {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .sidebar-footer {
          padding: 1rem;
          border-top: 1px solid #e5e7eb;
          background-color: #f8f9fa;
          flex-shrink: 0;
        }

        .user-info {
          margin-bottom: 1rem;
        }

        .user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          object-fit: cover;
          flex-shrink: 0;
        }

        .user-avatar-placeholder {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background-color: #0d6efd;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .user-name {
          font-size: 0.875rem;
          font-weight: 500;
          margin: 0;
          color: #374151;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* Main Content Styles */
        .main-wrapper {
          flex: 1;
          display: flex;
          flex-direction: column;
          height: 100vh;
          width: 100%;
          min-width: 0;
          overflow: hidden;
        }

        .main-header {
          height: 4rem;
          min-height: 4rem;
          background: white;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 1rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          flex-shrink: 0;
          width: 100%;
          z-index: 1020;
        }

        .header-left {
          display: flex;
          align-items: center;
          flex-shrink: 0;
        }

        .header-right {
          display: flex;
          align-items: center;
          flex-shrink: 0;
          min-width: 0;
        }

        .menu-toggle {
          font-size: 1.5rem;
        }

        .user-greeting {
          font-size: 0.875rem;
          color: #6b7280;
          margin-right: 0.5rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .user-avatar-header {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          object-fit: cover;
          flex-shrink: 0;
        }

        .user-avatar-header-placeholder {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background-color: #0d6efd;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .user-dropdown {
          position: relative;
        }

        .dropdown-menu-custom {
          position: absolute;
          top: 100%;
          right: 0;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
          min-width: 200px;
          z-index: 1000;
          margin-top: 0.5rem;
        }

        .dropdown-header {
          padding: 0.75rem 1rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .dropdown-divider {
          height: 1px;
          background-color: #e5e7eb;
          margin: 0;
        }

        .dropdown-item-custom {
          display: flex;
          align-items: center;
          width: 100%;
          padding: 0.75rem 1rem;
          background: none;
          border: none;
          text-align: left;
          color: #374151;
          font-size: 0.875rem;
          transition: background-color 0.2s ease;
        }

        .dropdown-item-custom:hover {
          background-color: #f8f9fa;
          color: #dc3545;
        }

        .main-content {
          flex: 1;
          height: calc(100vh - 4rem);
          overflow-y: auto;
          overflow-x: hidden;
          width: 100%;
        }

        .content-wrapper {
          padding: 1.5rem;
          width: 100%;
          min-height: 100%;
          overflow-wrap: break-word;
          word-wrap: break-word;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          align-items: stretch;
          box-sizing: border-box;
        }

        .content-wrapper > * {
          width: 100%;
          margin: 0 auto;
          box-sizing: border-box;
        }

        .sidebar-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background-color: rgba(0, 0, 0, 0.5);
          z-index: 1030;
        }

        /* Desktop Styles */
        @media (min-width: 992px) {
          .sidebar {
            position: fixed;
            transform: translateX(0);
          }

          .main-wrapper {
            margin-left: 16rem;
            width: calc(100vw - 16rem);
          }

          .content-wrapper {
            max-width: 100%;
          }

          .content-wrapper > * {
            max-width: 100%;
          }
        }

        /* Tablet Styles */
        @media (max-width: 991.98px) and (min-width: 768px) {
          .main-wrapper {
            margin-left: 0;
            width: 100vw;
          }

          .content-wrapper {
            padding: 1.5rem;
            max-width: 100%;
          }

          .content-wrapper > * {
            max-width: 100%;
          }

          .main-header {
            padding: 0 1.5rem;
          }
        }

        /* Mobile Styles */
        @media (max-width: 767.98px) {
          .main-wrapper {
            margin-left: 0;
            width: 100vw;
          }

          .content-wrapper {
            padding: 1rem;
            max-width: 100%;
          }

          .content-wrapper > * {
            max-width: 100%;
          }

          .main-header {
            padding: 0 1rem;
          }

          .user-greeting {
            display: none;
          }

          .dropdown-menu-custom {
            min-width: 180px;
            right: -0.5rem;
          }
        }

        /* Small Mobile Styles */
        @media (max-width: 575.98px) {
          .content-wrapper {
            padding: 0.75rem;
            max-width: 100%;
          }

          .content-wrapper > * {
            max-width: 100%;
          }

          .main-header {
            padding: 0 0.75rem;
          }

          .dropdown-menu-custom {
            min-width: 160px;
            right: -0.25rem;
          }

          .sidebar {
            width: 280px;
            min-width: 280px;
            max-width: 280px;
          }
        }

        /* Ultra Small Mobile */
        @media (max-width: 375px) {
          .sidebar {
            width: 260px;
            min-width: 260px;
            max-width: 260px;
          }

          .content-wrapper {
            padding: 0.5rem;
            max-width: calc(100vw - 1rem);
          }

          .content-wrapper > * {
            max-width: 100%;
          }

          .main-header {
            padding: 0 0.5rem;
          }
        }

        /* Custom scrollbar for sidebar */
        .sidebar-nav::-webkit-scrollbar {
          width: 4px;
        }

        .sidebar-nav::-webkit-scrollbar-track {
          background: #f1f1f1;
        }

        .sidebar-nav::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 2px;
        }

        .sidebar-nav::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }

        /* Custom scrollbar for main content */
        .main-content::-webkit-scrollbar {
          width: 6px;
        }

        .main-content::-webkit-scrollbar-track {
          background: #f1f1f1;
        }

        .main-content::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }

        .main-content::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }

        /* Animation for dropdown */
        .dropdown-menu-custom {
          animation: fadeIn 0.15s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Fix for very wide content */
        .content-wrapper * {
          max-width: 100%;
          word-wrap: break-word;
          overflow-wrap: break-word;
        }

        /* Tables responsive fix */
        .content-wrapper table {
          width: 100%;
          table-layout: auto;
        }

        .content-wrapper .table-responsive {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }

        /* Form elements responsive fix */
        .content-wrapper input,
        .content-wrapper textarea,
        .content-wrapper select {
          max-width: 100%;
          box-sizing: border-box;
        }

        /* Image responsive fix */
        .content-wrapper img {
          max-width: 100%;
          height: auto;
        }

        /* Pre and code blocks fix */
        .content-wrapper pre,
        .content-wrapper code {
          max-width: 100%;
          overflow-x: auto;
          word-wrap: break-word;
          white-space: pre-wrap;
        }
      `}</style>
    </div>
  )
}

export default AdminLayout