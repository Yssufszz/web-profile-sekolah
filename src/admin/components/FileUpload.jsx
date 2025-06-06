// src/admin/components/FileUpload.jsx
import React, { useState, useRef } from 'react'
import { 
  Upload, 
  X, 
  FileImage, 
  FileVideo, 
  FileText, 
  File,
  AlertCircle,
  CheckCircle,
  Loader
} from 'lucide-react'
import { uploadToStorage, deleteFromStorage, getStorageUrl } from '../../services/apiAdmin'

const FileUpload = ({
  accept = "image/*",
  multiple = false,
  maxSize = 5 * 1024 * 1024,
  maxFiles = 5,
  bucket = "uploads", // Default bucket
  folder = "files", // Default folder
  onUpload,
  onRemove,
  existingFiles = [],
  disabled = false,
  label = "Upload File",
  description = "Pilih file atau drag & drop di sini",
  preview = true,
  className = "",
  onChange // Callback untuk memberitahu parent component
}) => {
  const [dragActive, setDragActive] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState(existingFiles)
  const [uploadProgress, setUploadProgress] = useState({})
  const [errors, setErrors] = useState([])
  const fileInputRef = useRef(null)

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) return FileImage
    if (fileType.startsWith('video/')) return FileVideo
    if (fileType.includes('pdf') || fileType.includes('document')) return FileText
    return File
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const validateFile = (file) => {
    const errors = []
    if (file.size > maxSize) {
      errors.push(`File ${file.name} terlalu besar. Maksimal ${formatFileSize(maxSize)}`)
    }
    if (accept !== "*" && !accept.split(',').some(type => {
      const trimmedType = type.trim()
      if (trimmedType.includes('*')) {
        return file.type.startsWith(trimmedType.replace('*', ''))
      }
      return file.type === trimmedType
    })) {
      errors.push(`Tipe file ${file.name} tidak didukung`)
    }
    
    return errors
  }

  const uploadFileToStorage = async (file) => {
    try {
      // Generate unique filename
      const timestamp = Date.now()
      const randomStr = Math.random().toString(36).substring(2, 15)
      const fileExt = file.name.split('.').pop()
      const fileName = `${timestamp}-${randomStr}.${fileExt}`
      const filePath = `${folder}/${fileName}`

      // Upload to Supabase Storage
      const uploadResult = await uploadToStorage(bucket, filePath, file)
      
      // Get public URL
      const publicUrl = getStorageUrl(bucket, filePath)
      
      return {
        url: publicUrl,
        path: filePath,
        name: file.name,
        size: file.size,
        type: file.type
      }
    } catch (error) {
      console.error('Upload error:', error)
      throw new Error(`Gagal upload file ${file.name}: ${error.message}`)
    }
  }

  const handleFiles = async (files) => {
    const fileArray = Array.from(files)
    let newErrors = []
    let validFiles = []

    // Check total files limit
    if (uploadedFiles.length + fileArray.length > maxFiles) {
      newErrors.push(`Maksimal ${maxFiles} file yang dapat diupload`)
      setErrors(newErrors)
      return
    }

    // Validate each file
    fileArray.forEach(file => {
      const fileErrors = validateFile(file)
      if (fileErrors.length > 0) {
        newErrors = [...newErrors, ...fileErrors]
      } else {
        validFiles.push(file)
      }
    })

    if (newErrors.length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors([])

    // Process valid files
    for (const file of validFiles) {
      try {
        const fileId = Date.now() + Math.random()
        
        // Initialize progress
        setUploadProgress(prev => ({ ...prev, [fileId]: 0 }))

        const fileObj = {
          id: fileId,
          file,
          name: file.name,
          size: file.size,
          type: file.type,
          url: null,
          path: null,
          preview: null,
          uploading: true
        }

        // Generate preview for images
        if (file.type.startsWith('image/') && preview) {
          const reader = new FileReader()
          reader.onload = (e) => {
            fileObj.preview = e.target.result
            setUploadedFiles(prev => {
              const updated = [...prev, fileObj]
              if (onChange) onChange(updated)
              return updated
            })
          }
          reader.readAsDataURL(file)
        } else {
          setUploadedFiles(prev => {
            const updated = [...prev, fileObj]
            if (onChange) onChange(updated)
            return updated
          })
        }

        // Simulate progress
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => {
            const currentProgress = prev[fileId] || 0
            const newProgress = Math.min(currentProgress + Math.random() * 20, 90)
            return { ...prev, [fileId]: newProgress }
          })
        }, 200)

        // Upload file
        let uploadResult
        if (onUpload) {
          // Use custom upload function
          uploadResult = await onUpload(file)
        } else {
          // Use default upload to Supabase Storage
          uploadResult = await uploadFileToStorage(file)
        }

        // Clear progress interval
        clearInterval(progressInterval)
        
        // Complete upload
        setUploadProgress(prev => ({ ...prev, [fileId]: 100 }))
        
        setTimeout(() => {
          setUploadedFiles(prev => {
            const updated = prev.map(f => 
              f.id === fileId 
                ? { 
                    ...f, 
                    url: uploadResult.url || uploadResult,
                    path: uploadResult.path,
                    uploading: false 
                  }
                : f
            )
            if (onChange) onChange(updated)
            return updated
          })
          
          setUploadProgress(prev => {
            const newProgress = { ...prev }
            delete newProgress[fileId]
            return newProgress
          })
        }, 500)

      } catch (error) {
        console.error('File processing error:', error)
        
        // Remove failed file
        setUploadedFiles(prev => {
          const updated = prev.filter(f => f.id !== fileId)
          if (onChange) onChange(updated)
          return updated
        })
        
        setUploadProgress(prev => {
          const newProgress = { ...prev }
          delete newProgress[fileId]
          return newProgress
        })
        
        // Add error message
        setErrors(prev => [...prev, error.message || `Gagal upload ${file.name}`])
      }
    }
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (disabled) return
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files)
    }
  }

  const onButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const removeFile = async (fileId) => {
    const fileToRemove = uploadedFiles.find(f => f.id === fileId)
    
    if (fileToRemove) {
      try {
        // Delete from storage if file has path
        if (fileToRemove.path) {
          await deleteFromStorage(bucket, fileToRemove.path)
        }
        
        // Call custom onRemove if provided
        if (onRemove) {
          await onRemove(fileToRemove)
        }
      } catch (error) {
        console.error('Error removing file:', error)
        // Continue with removal from UI even if storage deletion fails
      }
    }
    
    setUploadedFiles(prev => {
      const updated = prev.filter(f => f.id !== fileId)
      if (onChange) onChange(updated)
      return updated
    })
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
          dragActive 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={onButtonClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
          disabled={disabled}
          className="hidden"
        />
        
        <div className="text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-900">{label}</p>
            <p className="text-sm text-gray-500">{description}</p>
            <p className="text-xs text-gray-400 mt-2">
              Maksimal {formatFileSize(maxSize)} per file, {maxFiles} file
            </p>
          </div>
        </div>
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          {errors.map((error, index) => (
            <div key={index} className="flex items-center text-red-800 text-sm">
              <AlertCircle className="h-4 w-4 mr-2" />
              {error}
            </div>
          ))}
        </div>
      )}

      {/* File List */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900">File yang dipilih:</h4>
          {uploadedFiles.map((file) => {
            const Icon = getFileIcon(file.type)
            const progress = uploadProgress[file.id]
            
            return (
              <div key={file.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                {/* File Icon/Preview */}
                <div className="flex-shrink-0 mr-3">
                  {file.preview ? (
                    <img 
                      src={file.preview} 
                      alt={file.name}
                      className="h-10 w-10 object-cover rounded"
                    />
                  ) : (
                    <Icon className="h-10 w-10 text-gray-400" />
                  )}
                </div>
                
                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.size)}
                  </p>
                  
                  {/* Progress Bar */}
                  {file.uploading && typeof progress === 'number' && (
                    <div className="mt-2">
                      <div className="bg-gray-200 rounded-full h-1.5">
                        <div 
                          className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{Math.round(progress)}%</p>
                    </div>
                  )}
                </div>
                
                {/* Status & Actions */}
                <div className="flex items-center space-x-2">
                  {file.uploading ? (
                    <Loader className="h-4 w-4 text-blue-600 animate-spin" />
                  ) : file.url ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : null}
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      removeFile(file.id)
                    }}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    disabled={disabled}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default FileUpload