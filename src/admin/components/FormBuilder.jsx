// src/admin/components/FormBuilder.jsx
import React, { useState, useEffect } from 'react'
import { 
  Plus, 
  Trash2, 
  Eye, 
  EyeOff, 
  Calendar,
  Clock,
  Image,
  FileText,
  CheckSquare,
  Circle,
  List,
  Type,
  Hash,
  Mail,
  Phone,
  Link,
  AlertCircle,
  Save,
  X
} from 'lucide-react'
import FileUpload from './FileUpload'

const FormBuilder = ({
  initialData = {},
  onSubmit,
  onCancel,
  children,
  loading = false,
  submitText = "Simpan",
  cancelText = "Batal",
  title = "Form",
  description = "",
  className = ""
}) => {
  const [formData, setFormData] = useState(initialData)
  const [errors, setErrors] = useState({})
  const [isDirty, setIsDirty] = useState(false)

  useEffect(() => {
    setFormData(initialData)
  }, [initialData])

  const fieldTypes = {
    'text': { icon: Type, label: 'Teks' },
    'textarea': { icon: FileText, label: 'Teks Panjang' },
    'email': { icon: Mail, label: 'Email' },
    'phone': { icon: Phone, label: 'Telepon' },
    'number': { icon: Hash, label: 'Angka' },
    'url': { icon: Link, label: 'Link/URL' },
    'date': { icon: Calendar, label: 'Tanggal' },
    'time': { icon: Clock, label: 'Waktu' },
    'datetime': { icon: Calendar, label: 'Tanggal & Waktu' },
    'select': { icon: List, label: 'Pilihan Dropdown' },
    'radio': { icon: Circle, label: 'Pilihan Radio' },
    'checkbox': { icon: CheckSquare, label: 'Checkbox' },
    'file': { icon: Image, label: 'Upload File' },
    'password': { icon: EyeOff, label: 'Password' }
  }

  const handleInputChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setIsDirty(true)
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }))
    }
  }

  const handleArrayChange = (name, index, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: prev[name]?.map((item, i) => i === index ? value : item) || []
    }))
    setIsDirty(true)
  }

  const addArrayItem = (name, defaultValue = '') => {
    setFormData(prev => ({
      ...prev,
      [name]: [...(prev[name] || []), defaultValue]
    }))
    setIsDirty(true)
  }

  const removeArrayItem = (name, index) => {
    setFormData(prev => ({
      ...prev,
      [name]: prev[name]?.filter((_, i) => i !== index) || []
    }))
    setIsDirty(true)
  }

  const validateForm = (fields) => {
    const newErrors = {}
    
    fields.forEach(field => {
      const value = formData[field.name]
      
      if (field.required && (!value || (Array.isArray(value) && value.length === 0))) {
        newErrors[field.name] = `${field.label} wajib diisi`
      }
      
      if (field.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        newErrors[field.name] = 'Format email tidak valid'
      }
      
      if (field.type === 'phone' && value && !/^(\+62|62|0)[2-9]\d{7,11}$/.test(value.replace(/\s/g, ''))) {
        newErrors[field.name] = 'Format nomor telepon tidak valid'
      }
      
      if (field.type === 'url' && value && !/^https?:\/\/.+/.test(value)) {
        newErrors[field.name] = 'Format URL tidak valid (harus dimulai dengan http:// atau https://)'
      }
      
      if (field.type === 'number' && value && isNaN(value)) {
        newErrors[field.name] = 'Harus berupa angka'
      }
      
      if (field.type === 'number' && value) {
        if (field.min && Number(value) < field.min) {
          newErrors[field.name] = `Minimal ${field.min}`
        }
        if (field.max && Number(value) > field.max) {
          newErrors[field.name] = `Maksimal ${field.max}`
        }
      }
      
      if (['text', 'textarea', 'email'].includes(field.type) && value) {
        if (field.minLength && value.length < field.minLength) {
          newErrors[field.name] = `Minimal ${field.minLength} karakter`
        }
        if (field.maxLength && value.length > field.maxLength) {
          newErrors[field.name] = `Maksimal ${field.maxLength} karakter`
        }
      }

      // File validation
      if (field.type === 'file' && field.required) {
        if (!value || (Array.isArray(value) && value.length === 0)) {
          newErrors[field.name] = `${field.label} wajib diupload`
        }
      }
    })
    
    return newErrors
  }

  const handleSubmit = (e, fields) => {
    e.preventDefault()
    
    const validationErrors = validateForm(fields)
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    
    setErrors({})
    onSubmit(formData)
  }

  const renderField = (field) => {
    const value = formData[field.name] || (field.type === 'file' ? [] : '')
    const error = errors[field.name]
    const commonProps = {
      id: field.name,
      name: field.name,
      required: field.required,
      disabled: loading,
      className: `form-control ${error ? 'is-invalid' : ''}`
    }

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            {...commonProps}
            value={value}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            rows={field.rows || 3}
            minLength={field.minLength}
            maxLength={field.maxLength}
          />
        )

      case 'select':
        return (
          <select
            {...commonProps}
            value={value}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
          >
            <option value="">Pilih {field.label}</option>
            {field.options?.map((option, index) => (
              <option key={index} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )

      case 'radio':
        return (
          <div className="d-flex flex-column gap-2">
            {field.options?.map((option, index) => (
              <div key={index} className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name={field.name}
                  id={`${field.name}_${index}`}
                  value={option.value}
                  checked={value === option.value}
                  onChange={(e) => handleInputChange(field.name, e.target.value)}
                  disabled={loading}
                />
                <label className="form-check-label" htmlFor={`${field.name}_${index}`}>
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        )

      case 'checkbox':
        if (field.multiple) {
          return (
            <div className="d-flex flex-column gap-2">
              {field.options?.map((option, index) => (
                <div key={index} className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id={`${field.name}_${index}`}
                    value={option.value}
                    checked={Array.isArray(value) && value.includes(option.value)}
                    onChange={(e) => {
                      const newValue = Array.isArray(value) ? [...value] : []
                      if (e.target.checked) {
                        newValue.push(option.value)
                      } else {
                        const index = newValue.indexOf(option.value)
                        if (index > -1) newValue.splice(index, 1)
                      }
                      handleInputChange(field.name, newValue)
                    }}
                    disabled={loading}
                  />
                  <label className="form-check-label" htmlFor={`${field.name}_${index}`}>
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          )
        } else {
          return (
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id={field.name}
                checked={value === true}
                onChange={(e) => handleInputChange(field.name, e.target.checked)}
                disabled={loading}
              />
              <label className="form-check-label" htmlFor={field.name}>
                {field.checkboxLabel || field.label}
              </label>
            </div>
          )
        }

      case 'file':
        return (
          <div className={error ? 'is-invalid' : ''}>
            <FileUpload
              accept={field.accept || "image/*"}
              multiple={field.multiple || false}
              maxSize={field.maxSize || 5 * 1024 * 1024}
              maxFiles={field.maxFiles || 5}
              bucket={field.bucket || "uploads"}
              folder={field.folder || "files"}
              onUpload={field.onUpload}
              onRemove={field.onRemove}
              existingFiles={Array.isArray(value) ? value : []}
              disabled={loading}
              label={field.uploadLabel || `Upload ${field.label}`}
              description={field.uploadDescription || "Pilih file atau drag & drop di sini"}
              preview={field.preview !== false}
              onChange={(files) => handleInputChange(field.name, files)}
              className={error ? 'border-danger' : ''}
            />
          </div>
        )

      case 'array':
        return (
          <div className="d-flex flex-column gap-2">
            {Array.isArray(value) && value.map((item, index) => (
              <div key={index} className="d-flex align-items-center gap-2">
                <input
                  type="text"
                  className="form-control flex-grow-1"
                  value={item}
                  onChange={(e) => handleArrayChange(field.name, index, e.target.value)}
                  placeholder={field.placeholder}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => removeArrayItem(field.name, index)}
                  disabled={loading}
                  className="btn btn-outline-danger btn-sm d-flex align-items-center justify-content-center"
                  style={{ width: '38px', height: '38px' }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem(field.name, '')}
              disabled={loading}
              className="btn btn-outline-primary btn-sm d-flex align-items-center"
            >
              <Plus size={16} className="me-1" />
              Tambah {field.label}
            </button>
          </div>
        )

      default:
        return (
          <input
            {...commonProps}
            type={field.type}
            value={value}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            min={field.min}
            max={field.max}
            minLength={field.minLength}
            maxLength={field.maxLength}
            step={field.step}
          />
        )
    }
  }

  return (
    <div className={`card shadow-sm ${className}`}>
      {/* Header */}
      {(title || description) && (
        <div className="card-header bg-white border-bottom">
          <div className="container-fluid p-0">
            {title && (
              <h2 className="card-title h5 mb-1">{title}</h2>
            )}
            {description && (
              <p className="card-text text-muted small mb-0">{description}</p>
            )}
          </div>
        </div>
      )}

      {/* Form Content */}
      <div className="card-body">
        <div className="container-fluid p-0">
          {typeof children === 'function' ? 
            children({ 
              formData, 
              handleInputChange, 
              renderField, 
              errors,
              handleSubmit,
              isDirty,
              setErrors
            }) :
            children
          }
        </div>
      </div>

      {/* Footer */}
      <div className="card-footer bg-light border-top">
        <div className="container-fluid p-0">
          <div className="d-flex flex-column flex-sm-row justify-content-end align-items-stretch align-items-sm-center gap-2">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                disabled={loading}
                className="btn btn-outline-secondary order-2 order-sm-1"
              >
                {cancelText}
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary d-flex align-items-center justify-content-center order-1 order-sm-2"
            >
              {loading && (
                <div className="spinner-border spinner-border-sm me-2" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              )}
              <Save size={16} className="me-2" />
              {submitText}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export const Form = ({ fields = [], ...props }) => {
  return (
    <FormBuilder {...props}>
      {({ formData, handleInputChange, renderField, errors, handleSubmit }) => (
        <form onSubmit={(e) => handleSubmit(e, fields)}>
          <div className="row">
            <div className="col-12">
              <div className="d-flex flex-column gap-4">
                {fields.map((field, index) => (
                  <div key={field.name || index} className="form-group">
                    <label
                      htmlFor={field.name}
                      className="form-label fw-medium"
                    >
                      {field.label}
                      {field.required && <span className="text-danger ms-1">*</span>}
                    </label>
                    
                    {field.description && (
                      <div className="form-text text-muted small mb-2">
                        {field.description}
                      </div>
                    )}
                    
                    {renderField(field)}
                    
                    {errors[field.name] && (
                      <div className="invalid-feedback d-flex align-items-center mt-1" style={{ display: 'flex' }}>
                        <AlertCircle size={16} className="me-1" />
                        {errors[field.name]}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </form>
      )}
    </FormBuilder>
  )
}

export default FormBuilder