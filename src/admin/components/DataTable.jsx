// src/admin/components/DataTable.jsx
import React, { useState } from 'react'
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Filter,
  Download,
  RefreshCw
} from 'lucide-react'

const DataTable = ({ 
  data = [], 
  columns = [], 
  loading = false,
  searchable = true,
  filterable = false,
  exportable = false,
  onRefresh,
  onExport,
  onRowClick,
  pageSize = 10
}) => {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })

  // Filter data based on search term
  const filteredData = data.filter(item =>
    searchable && searchTerm
      ? Object.values(item).some(value =>
          value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      : true
  )

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortConfig.key) return 0
    
    const aValue = a[sortConfig.key]
    const bValue = b[sortConfig.key]
    
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
    return 0
  })

  // Pagination
  const totalPages = Math.ceil(sortedData.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const currentData = sortedData.slice(startIndex, endIndex)

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null
    return sortConfig.direction === 'asc' ? '↑' : '↓'
  }

  const renderPagination = () => {
    const pages = []
    const maxVisiblePages = 5
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }

    return (
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center px-3 py-3 border-top" style={{ backgroundColor: '#f8f9fa' }}>
        <div className="text-muted mb-2 mb-md-0" style={{ fontSize: '0.8125rem' }}>
          <span className="d-none d-sm-inline">Menampilkan </span>
          <span className="fw-medium text-dark">{startIndex + 1} - {Math.min(endIndex, sortedData.length)}</span> dari <span className="fw-medium text-dark">{sortedData.length}</span>
          <span className="d-none d-sm-inline"> data</span>
        </div>
        
        <div className="d-flex align-items-center">
          <nav aria-label="Table pagination">
            <ul className="pagination pagination-sm mb-0">
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="page-link border-0 text-muted d-flex align-items-center justify-content-center"
                  aria-label="Previous"
                  style={{ width: '32px', height: '32px' }}
                >
                  <ChevronLeft style={{ width: '16px', height: '16px' }} />
                </button>
              </li>
              
              {pages.map(page => (
                <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                  <button
                    onClick={() => handlePageChange(page)}
                    className={`page-link d-flex align-items-center justify-content-center ${
                      currentPage === page
                        ? 'bg-primary text-white border-primary shadow-sm'
                        : 'text-muted border-0'
                    }`}
                    style={{ 
                      width: '32px', 
                      height: '32px',
                      fontSize: '0.8125rem',
                      fontWeight: currentPage === page ? '500' : '400'
                    }}
                  >
                    {page}
                  </button>
                </li>
              ))}
              
              <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="page-link border-0 text-muted d-flex align-items-center justify-content-center"
                  aria-label="Next"
                  style={{ width: '32px', height: '32px' }}
                >
                  <ChevronRight style={{ width: '16px', height: '16px' }} />
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-3 shadow-sm border" style={{ overflow: 'hidden' }}>
      {/* Table Header Actions */}
      <div className="px-3 py-3 border-bottom" style={{ backgroundColor: '#f8f9fa' }}>
        <div className="row align-items-center g-2 g-md-3">
          <div className="col-12 col-lg-7 col-xl-8">
            <div className="d-flex flex-column flex-sm-row gap-2">
              {searchable && (
                <div className="position-relative flex-grow-1" style={{ minWidth: '200px' }}>
                  <div className="position-absolute top-50 start-0 translate-middle-y ps-3">
                    <Search className="text-muted" style={{ width: '16px', height: '16px' }} />
                  </div>
                  <input
                    type="text"
                    placeholder="Cari data..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="form-control ps-5 border-0 shadow-sm"
                    style={{ 
                      paddingLeft: '2.5rem',
                      fontSize: '0.875rem',
                      backgroundColor: 'white'
                    }}
                  />
                </div>
              )}
              
              {filterable && (
                <button className="btn btn-outline-secondary btn-sm d-flex align-items-center justify-content-center flex-shrink-0 shadow-sm">
                  <Filter className="me-1 me-sm-2" style={{ width: '16px', height: '16px' }} />
                  <span className="d-none d-sm-inline">Filter</span>
                </button>
              )}
            </div>
          </div>
          
          <div className="col-12 col-lg-5 col-xl-4">
            <div className="d-flex gap-2 justify-content-start justify-content-lg-end">
              {exportable && (
                <button
                  onClick={onExport}
                  className="btn btn-success btn-sm d-flex align-items-center justify-content-center flex-shrink-0 shadow-sm"
                  style={{ fontWeight: '500' }}
                >
                  <Download className="me-1 me-sm-2" style={{ width: '16px', height: '16px' }} />
                  <span className="d-none d-sm-inline">Export</span>
                </button>
              )}
              
              {onRefresh && (
                <button
                  onClick={onRefresh}
                  className="btn btn-primary btn-sm d-flex align-items-center justify-content-center flex-shrink-0 shadow-sm"
                  style={{ fontWeight: '500' }}
                >
                  <RefreshCw className="me-1 me-sm-2" style={{ width: '16px', height: '16px' }} />
                  <span className="d-none d-sm-inline">Refresh</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Table Container with Horizontal Scroll */}
      <div className="table-responsive" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        <table className="table table-hover mb-0" style={{ minWidth: '600px', fontSize: '0.875rem' }}>
          <thead className="sticky-top" style={{ backgroundColor: '#f8f9fa' }}>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  onClick={() => column.sortable && handleSort(column.key)}
                  className={`px-2 px-md-3 py-3 text-start fw-semibold ${
                    column.sortable ? 'user-select-none' : ''
                  }`}
                  style={{
                    cursor: column.sortable ? 'pointer' : 'default',
                    letterSpacing: '0.025em',
                    minWidth: column.minWidth || '100px',
                    width: column.width || 'auto',
                    maxWidth: column.maxWidth || 'none',
                    whiteSpace: 'nowrap',
                    color: '#374151',
                    fontSize: '0.8125rem',
                    borderBottom: '2px solid #e5e7eb'
                  }}
                >
                  <div className="d-flex align-items-center gap-1">
                    <span className="text-truncate" title={column.title}>
                      {column.title}
                    </span>
                    {column.sortable && (
                      <span className="text-muted flex-shrink-0">
                        {getSortIcon(column.key) || '↕'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          
          <tbody className="bg-white">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-3 py-5 text-center">
                  <div className="d-flex align-items-center justify-content-center">
                    <div className="spinner-border spinner-border-sm text-primary me-2" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <span className="text-muted" style={{ fontSize: '0.875rem' }}>Memuat data...</span>
                  </div>
                </td>
              </tr>
            ) : currentData.length > 0 ? (
              currentData.map((item, index) => (
                <tr
                  key={item.id || index}
                  onClick={() => onRowClick && onRowClick(item)}
                  className={`${onRowClick ? 'cursor-pointer' : ''}`}
                  style={{ 
                    cursor: onRowClick ? 'pointer' : 'default',
                    transition: 'background-color 0.15s ease'
                  }}
                >
                  {columns.map((column) => (
                    <td 
                      key={column.key} 
                      className="px-2 px-md-3 py-3"
                      style={{
                        minWidth: column.minWidth || '100px',
                        width: column.width || 'auto',
                        maxWidth: column.maxWidth || '200px',
                        fontSize: '0.875rem',
                        color: '#374151',
                        borderBottom: '1px solid #f1f5f9'
                      }}
                    >
                      <div 
                        className={`${column.wrap === false ? 'text-nowrap text-truncate' : ''}`}
                        title={column.wrap === false ? (typeof item[column.key] === 'string' ? item[column.key] : '') : ''}
                      >
                        {column.render
                          ? column.render(item[column.key], item)
                          : item[column.key]
                        }
                      </div>
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-3 py-5 text-center">
                  <div className="text-center" style={{ color: '#6b7280' }}>
                    <div className="mb-3" style={{ fontSize: '2rem', opacity: 0.5 }}>
                      {searchTerm ? '🔍' : '📄'}
                    </div>
                    <div style={{ fontSize: '0.875rem' }}>
                      {searchTerm ? 'Tidak ada data yang sesuai dengan pencarian' : 'Tidak ada data tersedia'}
                    </div>
                    {searchTerm && (
                      <button 
                        onClick={() => setSearchTerm('')}
                        className="btn btn-link btn-sm text-primary mt-2 p-0"
                        style={{ fontSize: '0.8125rem' }}
                      >
                        Hapus filter pencarian
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && renderPagination()}
    </div>
  )
}

export default DataTable