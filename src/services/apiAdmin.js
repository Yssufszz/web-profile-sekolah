// src/services/apiAdmin.js
import { supabase } from './supabase'
import { generateRegistrationNumber } from '../utils/helpers'

// DASHBOARD API
export const getDashboardStats = async () => {
  try {
    const { count: totalStudents } = await supabase
      .from('ppdb_registrations')
      .select('*', { count: 'exact', head: true })

    const { count: pendingRegistrations } = await supabase
      .from('ppdb_registrations')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')

    const { count: acceptedStudents } = await supabase
      .from('ppdb_registrations')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'accepted')

    const { count: totalNews } = await supabase
      .from('news')
      .select('*', { count: 'exact', head: true })

    const { count: totalSkills } = await supabase
      .from('skills')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)

    const { count: totalGallery } = await supabase
      .from('gallery')
      .select('*', { count: 'exact', head: true })

    return {
      totalStudents: totalStudents || 0,
      pendingRegistrations: pendingRegistrations || 0,
      acceptedStudents: acceptedStudents || 0,
      totalNews: totalNews || 0,
      totalSkills: totalSkills || 0,
      totalGallery: totalGallery || 0
    }
  } catch (error) {
    throw error
  }
}

export const getRecentRegistrations = async (limit = 5) => {
  const { data, error } = await supabase
    .from('ppdb_registrations')
    .select(`
      *,
      skills(name),
      ppdb_periods(academic_year)
    `)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}

// SCHOOL PROFILE ADMIN API
export const updateSchoolProfile = async (profileData) => {
  const { data, error } = await supabase
    .from('school_profile')
    .upsert([{
      ...profileData,
      updated_at: new Date().toISOString()
    }])
    .select()

  if (error) throw error
  return data[0]
}

export const getSchoolProfileAdmin = async () => {
  const { data, error } = await supabase
    .from('school_profile')
    .select('*')
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data
}

// SKILLS ADMIN API
export const getAllSkills = async () => {
  const { data, error } = await supabase
    .from('skills')
    .select('*')
    .order('name')

  if (error) throw error
  return data
}

export const createSkill = async (skillData) => {
  const { data, error } = await supabase
    .from('skills')
    .insert([skillData])
    .select()

  if (error) throw error
  return data[0]
}

export const updateSkill = async (id, skillData) => {
  const { data, error } = await supabase
    .from('skills')
    .update({
      ...skillData,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()

  if (error) throw error
  return data[0]
}

export const deleteSkill = async (id) => {
  const { error } = await supabase
    .from('skills')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export const toggleSkillStatus = async (id, isActive) => {
  const { data, error } = await supabase
    .from('skills')
    .update({ 
      is_active: isActive,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()

  if (error) throw error
  return data[0]
}

// PPDB ADMIN API
export const getAllPPDBPeriods = async () => {
  const { data, error } = await supabase
    .from('ppdb_periods')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export const createPPDBPeriod = async (periodData) => {
  const { data, error } = await supabase
    .from('ppdb_periods')
    .insert([periodData])
    .select()

  if (error) throw error
  return data[0]
}

export const updatePPDBPeriod = async (id, periodData) => {
  const { data, error } = await supabase
    .from('ppdb_periods')
    .update({
      ...periodData,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()

  if (error) throw error
  return data[0]
}

export const deletePPDBPeriod = async (id) => {
  const { error } = await supabase
    .from('ppdb_periods')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export const togglePPDBPeriodStatus = async (id, isActive) => {
  if (isActive) {
    await supabase
      .from('ppdb_periods')
      .update({ is_active: false })
      .neq('id', id)
  }

  const { data, error } = await supabase
    .from('ppdb_periods')
    .update({ 
      is_active: isActive,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()

  if (error) throw error
  return data[0]
}

export const getAllPPDBRegistrations = async (periodId = null, status = null) => {
  let query = supabase
    .from('ppdb_registrations')
    .select(`
      *,
      skills(name),
      ppdb_periods(academic_year)
    `)
    .order('created_at', { ascending: false })

  if (periodId) {
    query = query.eq('period_id', periodId)
  }

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query

  if (error) throw error
  return data
}

export const updateRegistrationStatus = async (id, status, notes = null) => {
  const { data, error } = await supabase
    .from('ppdb_registrations')
    .update({
      status,
      notes,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()

  if (error) throw error
  return data[0]
}

export const deleteRegistration = async (id) => {
  const { error } = await supabase
    .from('ppdb_registrations')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export const exportRegistrationsToCSV = async (periodId = null) => {
  const registrations = await getAllPPDBRegistrations(periodId)
  
  const csvData = registrations.map(reg => ({
    'No. Pendaftaran': reg.registration_number,
    'Nama Siswa': reg.student_name,
    'Email Siswa': reg.student_email,
    'Telepon Siswa': reg.student_phone,
    'Nama Orang Tua': reg.parent_name,
    'Telepon Orang Tua': reg.parent_phone,
    'Email Orang Tua': reg.parent_email,
    'Tanggal Lahir': reg.birth_date,
    'Tempat Lahir': reg.birth_place,
    'Jenis Kelamin': reg.gender,
    'Alamat': reg.address,
    'Sekolah Asal': reg.previous_school,
    'Kompetensi Keahlian': reg.skills?.name,
    'Status': reg.status,
    'Catatan': reg.notes,
    'Tanggal Daftar': new Date(reg.created_at).toLocaleDateString('id-ID')
  }))

  return csvData
}

// NEWS ADMIN API
export const getAllNews = async () => {
  const { data, error } = await supabase
    .from('news')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export const createNews = async (newsData) => {
  const { data, error } = await supabase
    .from('news')
    .insert([{
      ...newsData,
      published_at: newsData.is_published ? new Date().toISOString() : null
    }])
    .select()

  if (error) throw error
  return data[0]
}

export const updateNews = async (id, newsData) => {
  const updateData = {
    ...newsData,
    updated_at: new Date().toISOString()
  }

  if (newsData.is_published && !newsData.published_at) {
    updateData.published_at = new Date().toISOString()
  }

  const { data, error } = await supabase
    .from('news')
    .update(updateData)
    .eq('id', id)
    .select()

  if (error) throw error
  return data[0]
}

export const deleteNews = async (id) => {
  const { error } = await supabase
    .from('news')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export const toggleNewsStatus = async (id, isPublished) => {
  const updateData = {
    is_published: isPublished,
    updated_at: new Date().toISOString()
  }

  if (isPublished) {
    updateData.published_at = new Date().toISOString()
  }

  const { data, error } = await supabase
    .from('news')
    .update(updateData)
    .eq('id', id)
    .select()

  if (error) throw error
  return data[0]
}

export const toggleNewsFeatured = async (id, isFeatured) => {
  const { data, error } = await supabase
    .from('news')
    .update({
      is_featured: isFeatured,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()

  if (error) throw error
  return data[0]
}

// GALLERY ADMIN API
export const getAllGallery = async () => {
  const { data, error } = await supabase
    .from('gallery')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export const createGalleryItem = async (galleryData) => {
  const { data, error } = await supabase
    .from('gallery')
    .insert([galleryData])
    .select()

  if (error) throw error
  return data[0]
}

export const updateGalleryItem = async (id, galleryData) => {
  const { data, error } = await supabase
    .from('gallery')
    .update({
      ...galleryData,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()

  if (error) throw error
  return data[0]
}

export const deleteGalleryItem = async (id) => {
  const { error } = await supabase
    .from('gallery')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export const toggleGalleryFeatured = async (id, isFeatured) => {
  const { data, error } = await supabase
    .from('gallery')
    .update({
      is_featured: isFeatured,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()

  if (error) throw error
  return data[0]
}

// CONTACTS ADMIN API
export const getAllContacts = async () => {
  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .order('order_index')

  if (error) throw error
  return data
}

export const createContact = async (contactData) => {
  const { data, error } = await supabase
    .from('contacts')
    .insert([contactData])
    .select()

  if (error) throw error
  return data[0]
}

export const updateContact = async (id, contactData) => {
  const { data, error } = await supabase
    .from('contacts')
    .update(contactData)
    .eq('id', id)
    .select()

  if (error) throw error
  return data[0]
}

export const deleteContact = async (id) => {
  const { error } = await supabase
    .from('contacts')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export const updateContactOrder = async (contacts) => {
  const updates = contacts.map((contact, index) => ({
    id: contact.id,
    order_index: index
  }))

  const { error } = await supabase
    .from('contacts')
    .upsert(updates)

  if (error) throw error
}

export const toggleContactPrimary = async (id, isPrimary) => {
  if (isPrimary) {
    const contact = await supabase
      .from('contacts')
      .select('type')
      .eq('id', id)
      .single()

    if (contact.data) {
      await supabase
        .from('contacts')
        .update({ is_primary: false })
        .eq('type', contact.data.type)
        .neq('id', id)
    }
  }

  const { data, error } = await supabase
    .from('contacts')
    .update({ is_primary: isPrimary })
    .eq('id', id)
    .select()

  if (error) throw error
  return data[0]
}

// ADMIN USERS API
export const getAllAdminUsers = async () => {
  const { data, error } = await supabase
    .from('admin_users')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export const createAdminUser = async (userData) => {
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: userData.email,
    password: userData.password,
    email_confirm: true
  })

  if (authError) throw authError

  const { data, error } = await supabase
    .from('admin_users')
    .insert([{
      email: userData.email,
      full_name: userData.full_name,
      role: userData.role,
      avatar_url: userData.avatar_url,
      password_hash: 'managed_by_auth' // Placeholder since we use Supabase Auth
    }])
    .select()

  if (error) throw error
  return data[0]
}

export const updateAdminUser = async (id, userData) => {
  const { data, error } = await supabase
    .from('admin_users')
    .update({
      ...userData,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()

  if (error) throw error
  return data[0]
}

export const toggleAdminStatus = async (id, isActive) => {
  const { data, error } = await supabase
    .from('admin_users')
    .update({
      is_active: isActive,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()

  if (error) throw error
  return data[0]
}

export const deleteAdminUser = async (id) => {
  const { data: adminUser, error: fetchError } = await supabase
    .from('admin_users')
    .select('email')
    .eq('id', id)
    .single()

  if (fetchError) throw fetchError

  const { error: deleteError } = await supabase
    .from('admin_users')
    .delete()
    .eq('id', id)

  if (deleteError) throw deleteError
}
// FILE UPLOAD HELPERS
export const uploadToStorage = async (bucket, path, file) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (error) throw error
  return data
}

export const deleteFromStorage = async (bucket, path) => {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path])

  if (error) throw error
}

export const getStorageUrl = (bucket, path) => {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path)

  return data.publicUrl
}

// UTILITY FUNCTIONS
export const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-')
}

export const createNewsSlug = async (title) => {
  let baseSlug = generateSlug(title)
  let slug = baseSlug
  let counter = 1

  while (true) {
    const { data, error } = await supabase
      .from('news')
      .select('id')
      .eq('slug', slug)
      .single()

    if (error && error.code === 'PGRST116') {
      break
    }

    if (error) throw error

    slug = `${baseSlug}-${counter}`
    counter++
  }

  return slug
}