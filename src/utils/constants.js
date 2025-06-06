// src/utils/constants.js
export const ROUTES = {
  // Public Routes
  HOME: '/',
  PROFILE: '/profil',
  PPDB: '/ppdb',
  SKILLS: '/kompetensi-keahlian',
  CONTACT: '/kontak',
  LOGIN: '/login',
  
  // Admin Routes
  ADMIN: '/admin',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_PROFILE: '/admin/profile',
  ADMIN_PPDB: '/admin/ppdb',
  ADMIN_PPDB_REGISTRATIONS: '/admin/ppdb/registrations',
  ADMIN_SKILLS: '/admin/skills',
  ADMIN_NEWS: '/admin/news',
  ADMIN_GALLERY: '/admin/gallery',
  ADMIN_CONTACTS: '/admin/contacts',
}

export const STORAGE_BUCKETS = {
  SCHOOL_IMAGES: 'school-images',
  SCHOOL_VIDEOS: 'school-videos',
  PPDB_DOCUMENTS: 'ppdb-documents',
  NEWS_IMAGES: 'news-images',
  GALLERY_IMAGES: 'gallery'
}

export const GALLERY_CATEGORIES = {
  FACILITY: 'facility',
  ACTIVITY: 'activity',
  ACHIEVEMENT: 'achievement',
  EVENT: 'event'
}

export const NEWS_CATEGORIES = {
  NEWS: 'news',
  ANNOUNCEMENT: 'announcement',
  EVENT: 'event'
}

export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  EDITOR: 'editor'
}

export const PERMISSIONS = {
  // Dashboard access
  VIEW_DASHBOARD: ['super_admin', 'admin', 'editor'],
  
  // Profile management
  MANAGE_PROFILE: ['super_admin', 'admin', 'editor'],
  
  // PPDB management
  MANAGE_PPDB: ['super_admin', 'admin'],
  VIEW_PPDB: ['super_admin', 'admin', 'editor'],
  
  // Skills management
  MANAGE_SKILLS: ['super_admin', 'admin', 'editor'],
  
  // News management
  MANAGE_NEWS: ['super_admin', 'admin', 'editor'],
  PUBLISH_NEWS: ['super_admin', 'admin'],
  
  // Gallery management
  MANAGE_GALLERY: ['super_admin', 'admin', 'editor'],
  
  // Contact management
  MANAGE_CONTACTS: ['super_admin', 'admin'],
  
  // User management
  MANAGE_USERS: ['super_admin'],
  
  // System settings
  MANAGE_SETTINGS: ['super_admin']
}

export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  REFRESH: '/auth/refresh',
  
  // Admin endpoints
  ADMIN_PROFILE: '/admin/profile',
  
  // Public endpoints
  SCHOOL_PROFILE: '/public/profile',
  PPDB_INFO: '/public/ppdb',
  SKILLS: '/public/skills',
  NEWS: '/public/news',
  GALLERY: '/public/gallery',
  CONTACTS: '/public/contacts'
}

export const STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived'
}

export const PAGINATION = {
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100
}