// src/services/auth.js
import { supabase } from './supabase'

// Login admin
export const loginAdmin = async (email, password) => {
  try {
    // First, authenticate with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (authError) throw authError

    // Then check if user exists in admin_users table
    const { data: adminData, error: adminError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', email)
      .eq('is_active', true)
      .single()

    if (adminError || !adminData) {
      await supabase.auth.signOut()
      throw new Error('Unauthorized: Not an admin user')
    }

    // Update last login
    await supabase
      .from('admin_users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', adminData.id)

    return {
      user: authData.user,
      admin: adminData
    }
  } catch (error) {
    throw error
  }
}

// Logout admin
export const logoutAdmin = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

// Get current admin session
export const getCurrentAdmin = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error || !session) return null

    const { data: adminData, error: adminError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', session.user.email)
      .eq('is_active', true)
      .single()

    if (adminError || !adminData) return null

    return {
      user: session.user,
      admin: adminData
    }
  } catch (error) {
    return null
  }
}

// Check if user is authenticated admin
export const isAuthenticated = async () => {
  const admin = await getCurrentAdmin()
  return !!admin
}

// Get admin profile
export const getAdminProfile = async () => {
  const admin = await getCurrentAdmin()
  return admin?.admin || null
}

// Update admin profile
export const updateAdminProfile = async (updates) => {
  const admin = await getCurrentAdmin()
  
  if (!admin) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('admin_users')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', admin.admin.id)
    .select()
    .single()

  if (error) throw error
  return data
}

// Change password
export const changePassword = async (newPassword) => {
  const { error } = await supabase.auth.updateUser({
    password: newPassword
  })

  if (error) throw error
}

// Auth state listener
export const onAuthStateChange = (callback) => {
  return supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN' && session) {
      const admin = await getCurrentAdmin()
      callback(admin)
    } else if (event === 'SIGNED_OUT') {
      callback(null)
    }
  })
}