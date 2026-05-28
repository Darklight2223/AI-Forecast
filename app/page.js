"use client";


import { useState } from 'react'

const page = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [city, setCity] = useState('');
  const [error, setError] = useState(null);
  const [ans, setans] = useState(null);

  async function askAI(city, weatherData) {

    if (!weatherData) {
      setans("No weather data available.");
      return;
    }

    try {
      const response = await fetch('/api/ask-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city, weatherData }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      setans(data.text || data.error);

    } catch (error) {

      console.error("Error fetching AI response:", error);

      setans("AI failed.");
    }
  }



  async function fetchWeather(city) {
    if (!city) return;
    
    try {
      const response = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);
      const data = await response.json();

      if (!response.ok) {
        setWeatherData(null);
        setError(data.error || 'City not found.');
        setans(null);
        return;
      }

      setWeatherData(data);
      setError(null);
      await askAI(city, data);
    } catch (err) {
      console.error("Error fetching weather:", err);
      setWeatherData(null);
      setError('Failed to fetch weather data.');
      setans(null);
    }
  }

  return (
    <div>
      <div className="p-4 text-center text-white bg-blue-500 font-bold">Weather app</div>
      <div className="p-4 text-center">
        <h1>Enter City : </h1>
        <input
          type="text"
          className="border-2 border-gray-300 p-2 rounded-lg"
          placeholder="Ask anything"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <button
          className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          onClick={() => fetchWeather(city)}
        >
          Get Weather
        </button>
      </div>

      {/* Weather Information */}
      <div>
        {weatherData && (
          <div className="p-4 text-center">
            <h2>Weather in {city.toLocaleLowerCase()}</h2>
            <p>Temperature: {weatherData.temperature}</p>
            <p>Condition: {weatherData.condition}</p>
            <p>Humidity: {weatherData.humidity}</p>
            <p>Wind Speed: {weatherData.windSpeed}</p>
          </div>
        )}
        {error && (
          <div className="p-4 text-center text-red-500">
            {error}
          </div>
        )}
        {ans && !error && (
          <div className="p-4 text-center text-green-700 font-medium whitespace-pre-wrap">
            {ans}
          </div>
        )}
      </div>
    </div>

  )
}

export default page