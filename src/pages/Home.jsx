import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Hero from '../components/UI/Hero'
import Card from '../components/UI/Card'
import Loading from '../components/UI/Loading'
import { 
  getSchoolProfile, 
  getFeaturedNews, 
  getActiveSkills,
  getGalleryByCategory,
  getPublishedNews
} from '../services/api'
import { ROUTES } from '../utils/constants'
import { formatDate } from '../utils/helpers'

const Home = () => {
  const [schoolProfile, setSchoolProfile] = useState(null)
  const [featuredNews, setFeaturedNews] = useState([])
  const [publishedNews, setPublishedNews] = useState([])
  const [allPublishedNews, setAllPublishedNews] = useState([]) // Menyimpan semua berita
  const [skills, setSkills] = useState([])
  const [gallery, setGallery] = useState([])
  const [allGallery, setAllGallery] = useState([]) // Menyimpan semua galeri
  const [loading, setLoading] = useState(true)
  const [loadingMoreNews, setLoadingMoreNews] = useState(false)
  const [loadingMoreGallery, setLoadingMoreGallery] = useState(false)
  const [newsDisplayCount, setNewsDisplayCount] = useState(3) // Jumlah berita yang ditampilkan
  const [galleryDisplayCount, setGalleryDisplayCount] = useState(3) // Jumlah galeri yang ditampilkan

  useEffect(() => {
    fetchHomeData()
  }, [])

  const fetchHomeData = async () => {
    try {
      const [profile, news, published, skillsData, galleryData] = await Promise.all([
        getSchoolProfile(),
        getFeaturedNews(),
        getPublishedNews(), // Ambil semua berita
        getActiveSkills(),
        getGalleryByCategory()
      ])
      
      setSchoolProfile(profile)
      setFeaturedNews(news)
      setAllPublishedNews(published) // Simpan semua berita
      setPublishedNews(published.slice(0, 3)) // Tampilkan 3 berita pertama
      setSkills(skillsData.slice(0, 3)) // Ambil 3 skills teratas
      setAllGallery(galleryData) // Simpan semua galeri
      setGallery(galleryData.slice(0, 3)) // Tampilkan 3 galeri pertama
    } catch (error) {
      console.error('Error fetching home data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLoadMoreNews = async () => {
    setLoadingMoreNews(true)
    try {
      const newCount = newsDisplayCount + 6
      const moreNews = allPublishedNews.slice(0, newCount)
      setPublishedNews(moreNews)
      setNewsDisplayCount(newCount)
    } catch (error) {
      console.error('Error loading more news:', error)
    } finally {
      setLoadingMoreNews(false)
    }
  }

  const handleLoadMoreGallery = async () => {
    setLoadingMoreGallery(true)
    try {
      const newCount = galleryDisplayCount + 6
      const moreGallery = allGallery.slice(0, newCount)
      setGallery(moreGallery)
      setGalleryDisplayCount(newCount)
    } catch (error) {
      console.error('Error loading more gallery:', error)
    } finally {
      setLoadingMoreGallery(false)
    }
  }

  if (loading) {
    return <Loading text="Memuat halaman..." />
  }

  return (
    <div className="home-page">
      {/* Hero Section */}
      <Hero
        title={schoolProfile?.name || 'Selamat Datang'}
        subtitle={schoolProfile?.description || 'Mencerdaskan generasi bangsa dengan pendidikan berkualitas'}
        backgroundImage={schoolProfile?.header_image_url}
      >
        <div className="d-flex gap-3 justify-content-center flex-wrap">
          <Link to={ROUTES.PPDB} className="btn btn-light btn-lg btn-custom">
            Daftar Sekarang
          </Link>
          <Link to={ROUTES.PROFILE} className="btn btn-outline-light btn-lg btn-custom">
            Pelajari Lebih Lanjut
          </Link>
        </div>
      </Hero>

      {/* Stats Section */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="row text-center">
            <div className="col-md-3 mb-4">
              <div className="bg-white p-4 rounded shadow-sm">
                <h2 className="text-primary fw-bold mb-2">
                  {schoolProfile?.established_year ? 
                    new Date().getFullYear() - schoolProfile.established_year : '25'
                  }+
                </h2>
                <p className="text-muted mb-0">Tahun Berpengalaman</p>
              </div>
            </div>
            <div className="col-md-3 mb-4">
              <div className="bg-white p-4 rounded shadow-sm">
                <h2 className="text-primary fw-bold mb-2">1000+</h2>
                <p className="text-muted mb-0">Alumni Sukses</p>
              </div>
            </div>
            <div className="col-md-3 mb-4">
              <div className="bg-white p-4 rounded shadow-sm">
                <h2 className="text-primary fw-bold mb-2">{skills.length}</h2>
                <p className="text-muted mb-0">Kompetensi Keahlian</p>
              </div>
            </div>
            <div className="col-md-3 mb-4">
              <div className="bg-white p-4 rounded shadow-sm">
                <h2 className="text-primary fw-bold mb-2">
                  {schoolProfile?.accreditation || 'A'}
                </h2>
                <p className="text-muted mb-0">Akreditasi</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured News */}
      {featuredNews.length > 0 && (
        <section className="py-5">
          <div className="container">
            <div className="row mb-5">
              <div className="col-12 text-center">
                <h2 className="fw-bold mb-3">Berita & Pengumuman Unggulan</h2>
                <p className="text-muted">Berita dan pengumuman penting dari sekolah kami</p>
              </div>
            </div>
            <div className="row">
              {featuredNews.map((news) => (
                <div key={news.id} className="col-lg-4 mb-4">
                  <Card
                    image={news.featured_image_url}
                    title={news.title}
                    description={news.excerpt}
                    footer={
                      <div className="d-flex justify-content-between align-items-center">
                        <small className="text-muted">
                          {formatDate(news.published_at)}
                        </small>
                        <span className="badge bg-primary">{news.category}</span>
                      </div>
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Published News */}
      {publishedNews.length > 0 && (
        <section className="py-5 bg-light">
          <div className="container">
            <div className="row mb-5">
              <div className="col-12 text-center">
                <h2 className="fw-bold mb-3">Berita Terbaru</h2>
                <p className="text-muted">Informasi dan berita terkini dari sekolah kami</p>
              </div>
            </div>
            <div className="row">
              {publishedNews.map((news) => (
                <div key={news.id} className="col-lg-4 mb-4">
                  <Card
                    image={news.featured_image_url}
                    title={news.title}
                    description={news.excerpt}
                    footer={
                      <div className="d-flex justify-content-between align-items-center">
                        <small className="text-muted">
                          {formatDate(news.published_at)}
                        </small>
                        <span className="badge bg-secondary">{news.category}</span>
                      </div>
                    }
                  />
                </div>
              ))}
            </div>
            {publishedNews.length < allPublishedNews.length && (
              <div className="text-center mt-4">
                <button 
                  onClick={handleLoadMoreNews}
                  disabled={loadingMoreNews}
                  className="btn btn-primary btn-lg"
                >
                  {loadingMoreNews ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Memuat...
                    </>
                  ) : (
                    `Lihat Berita Lainnya (${Math.min(6, allPublishedNews.length - publishedNews.length)} berita)`
                  )}
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Skills Preview */}
      <section className="py-5">
        <div className="container">
          <div className="row mb-5">
            <div className="col-12 text-center">
              <h2 className="fw-bold mb-3">Kompetensi Keahlian</h2>
              <p className="text-muted">Program keahlian yang tersedia di sekolah kami</p>
            </div>
          </div>
          <div className="row">
            {skills.map((skill) => (
              <div key={skill.id} className="col-lg-4 mb-4">
                <Card
                  image={skill.image_url}
                  title={skill.name}
                  description={skill.description}
                  footer={
                    <div className="d-flex justify-content-between align-items-center">
                      <small className="text-muted">
                        {skill.duration_years} Tahun
                      </small>
                      <Link to={ROUTES.SKILLS} className="btn btn-primary btn-sm">
                        Lihat Detail
                      </Link>
                    </div>
                  }
                />
              </div>
            ))}
          </div>
          <div className="text-center mt-4">
            <Link to={ROUTES.SKILLS} className="btn btn-primary btn-lg">
              Lihat Semua Kompetensi Keahlian
            </Link>
          </div>
        </div>
      </section>

      {/* Gallery Preview */}
      {gallery.length > 0 && (
        <section className="py-5 bg-light">
          <div className="container">
            <div className="row mb-5">
              <div className="col-12 text-center">
                <h2 className="fw-bold mb-3">Galeri Sekolah</h2>
                <p className="text-muted">Dokumentasi kegiatan dan fasilitas sekolah</p>
              </div>
            </div>
            <div className="row">
              {gallery.map((item) => (
                <div key={item.id} className="col-lg-4 col-md-6 mb-4">
                  <Card
                    image={item.thumbnail_url || item.media_url}
                    title={item.title}
                    description={item.description}
                    footer={
                      <div className="d-flex justify-content-between align-items-center flex-wrap">
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <span className="badge bg-secondary">{item.category}</span>
                          {item.is_featured && (
                            <span className="badge bg-warning text-dark">
                              <i className="fas fa-star me-1"></i>
                              Unggulan
                            </span>
                          )}
                        </div>
                        <small className="text-muted">
                          {formatDate(item.created_at)}
                        </small>
                      </div>
                    }
                  />
                </div>
              ))}
            </div>
            {gallery.length < allGallery.length && (
              <div className="text-center mt-4">
                <button 
                  onClick={handleLoadMoreGallery}
                  disabled={loadingMoreGallery}
                  className="btn btn-primary btn-lg"
                >
                  {loadingMoreGallery ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Memuat...
                    </>
                  ) : (
                    `Lihat Galeri Lainnya (${Math.min(6, allGallery.length - gallery.length)} item)`
                  )}
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-5 bg-primary text-white">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-8">
              <h3 className="fw-bold mb-3">Siap Bergabung dengan Kami?</h3>
              <p className="mb-0">
                Daftarkan diri Anda sekarang dan wujudkan masa depan yang cerah bersama kami.
              </p>
            </div>
            <div className="col-lg-4 text-lg-end">
              <Link to={ROUTES.PPDB} className="btn btn-light btn-lg btn-custom">
                Daftar PPDB Online
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home