import { useState } from 'react'
import axios from 'axios'
import './App.css'

function App() {
  const [city, setCity] = useState('')
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('daylight-theme')
    return savedTheme ? savedTheme === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches
  })
  const apiKey = import.meta.env.VITE_WEATHER_API_KEY

  const toggleTheme = () => {
    setDarkMode((isDark) => {
      const nextIsDark = !isDark
      localStorage.setItem('daylight-theme', nextIsDark ? 'dark' : 'light')
      return nextIsDark
    })
  }

  const fetchWeather = async (query) => {
    setLoading(true)
    setError(null)
    setWeather(null)

    try {
      const response = await axios.get('https://api.weatherapi.com/v1/current.json', {
        params: { key: apiKey, q: query },
      })
      setWeather(response.data)
    } catch {
      setError('API Error or city not found')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (event) => {
    event.preventDefault()
    const searchCity = city.trim()
    if (searchCity) fetchWeather(searchCity)
  }

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser')
      return
    }

    setLoading(true)
    setError(null)
    setWeather(null)
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => fetchWeather(`${coords.latitude},${coords.longitude}`),
      () => {
        setError('Unable to get your location. Check your browser permissions and try again.')
        setLoading(false)
      },
    )
  }

  return (
    <main className={`weather-app${darkMode ? ' dark-mode' : ''}`}>
      <header className="topbar">
        <a className="wordmark" href="#top" aria-label="Daylight home">
          <span className="wordmark-mark" aria-hidden="true">☀</span>
          daylight
        </a>
        <div className="topbar-tools">
          <span className="topbar-note">Your local forecast</span>
          <button
            className="theme-toggle"
            type="button"
            onClick={toggleTheme}
            aria-label={`Switch to ${darkMode ? 'light' : 'dark'} mode`}
            title={`Switch to ${darkMode ? 'light' : 'dark'} mode`}
          >
            <span aria-hidden="true">{darkMode ? '☼' : '☾'}</span>
          </button>
        </div>
      </header>

      <section className="weather-content" id="top">
        <div className="intro">
          <p className="eyebrow">WEATHER, AT A GLANCE</p>
          <h1>A little more<br />in tune with today.</h1>
          <p className="intro-copy">Find the forecast for wherever you are, or wherever you’re headed.</p>
        </div>

        <form className="search-form" onSubmit={handleSearch}>
          <label className="visually-hidden" htmlFor="city-search">City or location</label>
          <input
            id="city-search"
            type="search"
            placeholder="Search a city..."
            value={city}
            onChange={(event) => setCity(event.target.value)}
          />
          <button className="search-button" type="submit" disabled={loading || !city.trim()}>
            Search
          </button>
          <span className="search-divider" aria-hidden="true" />
          <button
            className="location-button"
            type="button"
            onClick={getCurrentLocation}
            disabled={loading}
            aria-label="Use my current location"
            title="Use my current location"
          >
            ⌖
          </button>
        </form>

        {error && <p className="error-message" role="alert">{error}</p>}

        {loading && (
          <section className="weather-card skeleton-card" aria-label="Loading weather" aria-busy="true">
            <div className="skeleton-topline">
              <span className="skeleton-block skeleton-location" />
              <span className="skeleton-block skeleton-date" />
            </div>
            <div className="skeleton-current">
              <span className="skeleton-block skeleton-icon" />
              <span className="skeleton-block skeleton-temperature" />
              <span className="skeleton-block skeleton-condition" />
            </div>
            <div className="skeleton-metrics">
              <span className="skeleton-block" />
              <span className="skeleton-block" />
              <span className="skeleton-block" />
            </div>
            <span className="visually-hidden">Loading weather forecast...</span>
          </section>
        )}

        {weather && !loading && (
          <section className="weather-card" aria-live="polite">
            <div className="weather-card-heading">
              <div>
                <p className="card-label">CURRENT WEATHER</p>
                <h2>{weather.location.name}<span>, {weather.location.country}</span></h2>
              </div>
              <p className="local-time">Local time <strong>{weather.location.localtime.split(' ')[1]}</strong></p>
            </div>

            <div className="current-weather">
              <img
                className="condition-icon"
                src={`https:${weather.current.condition.icon}`}
                alt=""
              />
              <div className="temperature">{Math.round(weather.current.temp_c)}<span>°</span></div>
              <div className="condition-copy">
                <p>{weather.current.condition.text}</p>
                <span>Feels like {Math.round(weather.current.feelslike_c)}°</span>
              </div>
            </div>

            <div className="weather-metrics">
              <div className="metric">
                <span className="metric-icon" aria-hidden="true">◌</span>
                <div><span>Humidity</span><strong>{weather.current.humidity}%</strong></div>
              </div>
              <div className="metric">
                <span className="metric-icon" aria-hidden="true">↗</span>
                <div><span>Wind</span><strong>{weather.current.wind_kph} <small>km/h</small></strong></div>
              </div>
              <div className="metric">
                <span className="metric-icon" aria-hidden="true">⌁</span>
                <div><span>Feels like</span><strong>{Math.round(weather.current.feelslike_c)}°<small>C</small></strong></div>
              </div>
            </div>
          </section>
        )}

        {!weather && !loading && !error && (
          <div className="empty-state">
            <span className="empty-sun" aria-hidden="true">☼</span>
            <p>Your forecast will find its place here.</p>
          </div>
        )}
      </section>

      <footer className="page-footer">
        <span>Make room for whatever the day brings.</span>
        <span>WEATHER DATA BY WEATHERAPI</span>
      </footer>
    </main>
  )
}

export default App
