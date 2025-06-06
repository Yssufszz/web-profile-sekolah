// src/admin/components/ProtectedRoute.jsx
import React, { useState, useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { getCurrentAdmin } from '../../services/auth'
import Loading from '../../components/UI/Loading'

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [admin, setAdmin] = useState(null)
  const location = useLocation()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      setIsLoading(true)
      const response = await getCurrentAdmin()
      
      if (response && response.admin) {
        setIsAuthenticated(true)
        setAdmin(response.admin)
        
        // Check role-based access if required
        if (requiredRole && response.admin.role !== requiredRole) {
          setIsAuthenticated(false)
        }
      } else {
        setIsAuthenticated(false)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loading />
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <Navigate 
        to="/login" 
        state={{ from: location.pathname }}
        replace 
      />
    )
  }

  // Render children if authenticated and authorized
  return children
}

export default ProtectedRoute