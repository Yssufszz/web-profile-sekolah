// src/pages/Login.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginAdmin, getCurrentAdmin } from '../services/auth'
import Loading from '../components/UI/Loading'

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [checkingAuth, setCheckingAuth] = useState(true)
  
  const navigate = useNavigate()

  // Check if already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const admin = await getCurrentAdmin()
        if (admin) {
          navigate('/admin/dashboard')
        }
      } catch (error) {
        console.error('Auth check error:', error)
      } finally {
        setCheckingAuth(false)
      }
    }

    checkAuth()
  }, [navigate])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.email || !formData.password) {
      setError('Email dan password harus diisi')
      return
    }

    setLoading(true)
    setError('')

    try {
      await loginAdmin(formData.email, formData.password)
      navigate('/admin/dashboard')
    } catch (error) {
      console.error('Login error:', error)
      if (error.message.includes('Invalid login credentials')) {
        setError('Email atau password salah')
      } else if (error.message.includes('Unauthorized')) {
        setError('Akun tidak memiliki akses admin')
      } else {
        setError('Terjadi kesalahan. Silakan coba lagi.')
      }
    } finally {
      setLoading(false)
    }
  }

  if (checkingAuth) {
    return <Loading text="Memeriksa status login..." />
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-4">
            <div className="card shadow-lg border-0">
              <div className="card-body p-5">
                <div className="text-center mb-4">
                  <h2 className="fw-bold text-primary mb-2">Admin Login</h2>
                  <p className="text-muted">Masuk ke panel administrasi</p>
                </div>

                {error && (
                  <div className="alert alert-danger alert-dismissible fade show" role="alert">
                    <i className="bi bi-exclamation-circle me-2"></i>
                    {error}
                    <button 
                      type="button" 
                      className="btn-close" 
                      onClick={() => setError('')}
                    ></button>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label fw-semibold">
                      Email
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="bi bi-envelope"></i>
                      </span>
                      <input
                        type="email"
                        className="form-control"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="admin@sekolah.com"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="password" className="form-label fw-semibold">
                      Password
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="bi bi-lock"></i>
                      </span>
                      <input
                        type="password"
                        className="form-control"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Masukkan password"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-100 btn-custom"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </span>
                        Memproses...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-box-arrow-in-right me-2"></i>
                        Masuk
                      </>
                    )}
                  </button>
                </form>

                <div className="text-center mt-4">
                  <a 
                    href="/" 
                    className="text-decoration-none text-muted"
                  >
                    <i className="bi bi-arrow-left me-1"></i>
                    Kembali ke Beranda
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

export default Login