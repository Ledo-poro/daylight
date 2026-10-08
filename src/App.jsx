import { useState } from 'react'
import axios from 'axios'
import './App.css'

function App() {
  const [city, setCity] = useState("")
  const [weather , setWeather] = useState(null)
  const [loading , setLoading] = useState(false)
  const [error  , setError] = useState(null)
  const API_Key = import.meta.env.VITE_WEATHER_API_KEY
  const fetchWeather = async () => {
    if(!city){
      return;
    }
    setLoading(true)
    setError(null)
    try{
      const response = await axios(`http://api.weatherapi.com/v1/current.json?key=${API_Key}&q=${city}`)

      console.log(response.data)
      setWeather(response.data)
      setLoading(false)
    }catch(err){
      setError(err.message)
      setWeather(null)
      setLoading(false)
    }
  }

  const getCurrentLocation = () => {
    if(!navigator.geolocation){
      setError("Geolocation  is not supported by your browser")
      return;
    }
    setLoading(true)
    setError(null)
    setWeather(null)
    
    navigator.geolocation.getCurrentPosition(async (position) => {
      const {latitude , longitude} = position.coords
      try{
        const response = await axios(`http://api.weatherapi.com/v1/current.json?key=${API_Key}&q=${latitude},${longitude}`)
        setWeather(response.data)
        setLoading(false)
      }catch(err){
        setError(err.message)
        setLoading(false)
      }
    })
  }

  return (
    <>
    <h1>Weather App</h1>
    <input type="text" placeholder='Enter city name' onChange={(e) => setCity(e.target.value)}/>
    <button onClick={fetchWeather} disabled={loading}>Search</button>
    <button onClick={getCurrentLocation}>Search by location</button>
    {error && <p role="alert" style={{ color: 'red', fontWeight: 'bold' }}>API Error or city not found</p>}
    {weather && (
      <div>
        <h2>{weather.location.name}, {weather.location.country}</h2>
        <p><img src={weather.current.condition.icon} alt={weather.current.condition.text} /> {weather.current.condition.text}</p>
        <p>Temp: {weather.current.temp_c}C / {weather.current.temp_f}F</p>
        <p>Humidity: {weather.current.humidity}</p>
        <p>Wind: {weather.current.wind_kph} kph</p>
      </div>
    )}
    </>
  )
}

export default App
