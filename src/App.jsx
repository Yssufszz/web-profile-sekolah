// src/App.jsx
import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

// Public Layout Components
import Header from './components/Layout/Header'
import Footer from './components/Layout/Footer'

// Public Pages
import Home from './pages/Home'
import Profile from './pages/Profile'
import PPDB from './pages/PPDB'
import Skills from './pages/Skills'
import Contact from './pages/Contact'
import Login from './pages/Login'

// Admin Components
import AdminLayout from './admin/components/AdminLayout'
import ProtectedRoute from './admin/components/ProtectedRoute'

// Admin Pages
import Dashboard from './admin/Dashboard'
import ProfileAdmin from './admin/ProfileAdmin'
import PPDBPeriodManagement from './admin/PPDBPeriodManagement'
import PPDBRegistrationManagement from './admin/PPDBRegistrationManagement'
import SkillsAdmin from './admin/SkillsAdmin'
import NewsAdmin from './admin/NewsAdmin'
import GalleryAdmin from './admin/GalleryAdmin'
import ContactAdmin from './admin/ContactAdmin'

import { ROUTES } from './utils/constants'

// Public Layout Wrapper
const PublicLayout = ({ children }) => (
  <div className="App">
    <Header />
    <main className="main-content">
      {children}
    </main>
    <Footer />
  </div>
)

function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <Routes>
          {/* Public Routes */}
          <Route path={ROUTES.HOME} element={
            <PublicLayout>
              <Home />
            </PublicLayout>
          } />
          <Route path={ROUTES.PROFILE} element={
            <PublicLayout>
              <Profile />
            </PublicLayout>
          } />
          <Route path={ROUTES.PPDB} element={
            <PublicLayout>
              <PPDB />
            </PublicLayout>
          } />
          <Route path={ROUTES.SKILLS} element={
            <PublicLayout>
              <Skills />
            </PublicLayout>
          } />
          <Route path={ROUTES.CONTACT} element={
            <PublicLayout>
              <Contact />
            </PublicLayout>
          } />
          
          {/* Login Route (accessible both for public and admin) */}
          <Route path={ROUTES.LOGIN} element={<Login />} />
          
          {/* Admin Routes - All protected */}
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminLayout>
                <Navigate to="/admin/dashboard" replace />
              </AdminLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/admin/dashboard" element={
            <ProtectedRoute>
              <AdminLayout>
                <Dashboard />
              </AdminLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/admin/profile" element={
            <ProtectedRoute>
              <AdminLayout>
                <ProfileAdmin />
              </AdminLayout>
            </ProtectedRoute>
          } />
          
          {/* PPDB Admin Routes */}
          <Route path="/admin/ppdb" element={
            <ProtectedRoute>
              <AdminLayout>
                <PPDBPeriodManagement />
              </AdminLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/admin/ppdb/registrations" element={
            <ProtectedRoute>
              <AdminLayout>
                <PPDBRegistrationManagement />
              </AdminLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/admin/skills" element={
            <ProtectedRoute>
              <AdminLayout>
                <SkillsAdmin />
              </AdminLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/admin/news" element={
            <ProtectedRoute>
              <AdminLayout>
                <NewsAdmin />
              </AdminLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/admin/gallery" element={
            <ProtectedRoute>
              <AdminLayout>
                <GalleryAdmin />
              </AdminLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/admin/contacts" element={
            <ProtectedRoute>
              <AdminLayout>
                <ContactAdmin />
              </AdminLayout>
            </ProtectedRoute>
          } />
          
          {/* Catch all route - redirect to home */}
          <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
        </Routes>
        
        {/* Global Toast Notifications */}
        <Toaster 
          position="top-right"
          reverseOrder={false}
          gutter={8}
          containerClassName=""
          containerStyle={{}}
          toastOptions={{
            className: '',
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              theme: {
                primary: 'green',
                secondary: 'black',
              },
            },
          }}
        />
      </div>
    </Router>
  )
}

export default App