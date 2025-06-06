// src/services/api.js
import { supabase } from './supabase'

// School Profile API
export const getSchoolProfile = async () => {
  const { data, error } = await supabase
    .from('school_profile')
    .select('*')
    .single()
  
  if (error) throw error
  return data
}

// Skills API
export const getActiveSkills = async () => {
  const { data, error } = await supabase
    .from('skills')
    .select('*')
    .eq('is_active', true)
    .order('name')
  
  if (error) throw error
  return data
}

// PPDB API
export const getActivePPDBPeriod = async () => {
  const { data, error } = await supabase
    .from('ppdb_periods')
    .select('*')
    .eq('is_active', true)
    .single()
  
  if (error) throw error
  return data
}

export const submitPPDBRegistration = async (registrationData) => {
  const { data, error } = await supabase
    .from('ppdb_registrations')
    .insert([registrationData])
    .select()
  
  if (error) throw error
  return data[0]
}

// News API
export const getPublishedNews = async (limit = 10) => {
  const { data, error } = await supabase
    .from('news')
    .select('*')
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .limit(limit)
  
  if (error) throw error
  return data
}

export const getFeaturedNews = async () => {
  const { data, error } = await supabase
    .from('news')
    .select('*')
    .eq('is_published', true)
    .eq('is_featured', true)
    .order('published_at', { ascending: false })
    .limit(3)
  
  if (error) throw error
  return data
}

// Gallery API
export const getGalleryByCategory = async (category = null) => {
  let query = supabase
    .from('gallery')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (category) {
    query = query.eq('category', category)
  }
  
  const { data, error } = await query
  
  if (error) throw error
  return data
}

// Contacts API
export const getContacts = async () => {
  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .order('order_index')
  
  if (error) throw error
  return data
}

// Upload file to Supabase Storage
export const uploadFile = async (bucket, fileName, file) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file)
  
  if (error) throw error
  return data
}