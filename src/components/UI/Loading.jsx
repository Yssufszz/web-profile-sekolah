import React from 'react'

const Loading = ({ text = 'Loading...' }) => {
  return (
    <div className="d-flex justify-content-center align-items-center py-5">
      <div className="text-center">
        <div className="spinner-border text-primary mb-3" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="text-muted">{text}</p>
      </div>
    </div>
  )
}

export default Loading