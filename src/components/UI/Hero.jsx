import React from 'react'

const Hero = ({ title, subtitle, backgroundImage, children }) => {
  const bgStyle = backgroundImage ? {
    backgroundImage: `linear-gradient(rgba(59, 130, 246, 0.8), rgba(30, 64, 175, 0.8)), url(${backgroundImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  } : {};

  const sectionStyle = {
    ...bgStyle,
    minHeight: '80vh',
    color: 'white'
  };

  return (
    <>
      <style>{`
        .hero-section {
          min-height: 100vh;
        }
        
        @media (max-width: 576px) {
          .hero-section {
            min-height: 80vh;
            padding: 1rem 0;
          }
          
          .hero-title {
            font-size: 2rem !important;
            line-height: 1.2;
          }
          
          .hero-subtitle {
            font-size: 1rem !important;
          }
        }
        
        @media (min-width: 577px) and (max-width: 768px) {
          .hero-title {
            font-size: 2.5rem !important;
          }
          
          .hero-subtitle {
            font-size: 1.1rem !important;
          }
        }
        
        @media (min-width: 769px) and (max-width: 992px) {
          .hero-title {
            font-size: 3rem !important;
          }
        }
      `}</style>
      
      <section className="hero-section d-flex align-items-center justify-content-center" style={sectionStyle}>
        <div className="container-fluid px-3 px-md-4">
          <div className="row justify-content-center text-center">
            <div className="col-12 col-sm-10 col-md-8 col-lg-8 col-xl-6">
              <h1 className="hero-title display-4 fw-bold mb-3 mb-md-4">
                {title}
              </h1>
              {subtitle && (
                <p className="hero-subtitle lead mb-3 mb-md-4 px-2 px-md-0">
                  {subtitle}
                </p>
              )}
              <div className="hero-content">
                {children}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default Hero