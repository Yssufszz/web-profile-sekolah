// src/utils/helpers.js
export const formatDate = (dateString) => {
  const options = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    timeZone: 'Asia/Jakarta'
  }
  return new Date(dateString).toLocaleDateString('id-ID', options)
}

export const generateRegistrationNumber = () => {
  const year = new Date().getFullYear()
  const month = String(new Date().getMonth() + 1).padStart(2, '0')
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `PPDB${year}${month}${random}`
}

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

export const validatePhone = (phone) => {
  const re = /^(\+62|62|0)[2-9]\d{7,11}$/
  return re.test(phone.replace(/\s/g, ''))
}