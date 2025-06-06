import React from 'react'

const Card = ({ image, title, description, footer, className = '', onClick }) => {
  return (
    <div 
      className={`card h-100 card-hover ${className}`}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      {image && (
        <img 
          src={image} 
          className="card-img-top" 
          alt={title}
          style={{ height: '200px', objectFit: 'cover' }}
        />
      )}
      <div className="card-body d-flex flex-column">
        <h5 className="card-title">{title}</h5>
        <p className="card-text flex-grow-1">{description}</p>
        {footer && <div className="mt-auto">{footer}</div>}
      </div>
    </div>
  )
}

export default Card