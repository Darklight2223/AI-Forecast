"use client";


import { useState } from 'react'

const page = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [query, setQuery] = useState('');
  const [detectedCity, setDetectedCity] = useState('');
  const [error, setError] = useState(null);
  const [ans, setans] = useState(null);

  async function handleAsk() {
    if (!query) return;

    setans("Thinking...");
    setError(null);
    setWeatherData(null);
    setDetectedCity('');

    try {
      // 1. Ask AI to extract the city from the user's general query
      const extractRes = await fetch('/api/ask-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'extract_city', query }),
      });
      
      if (!extractRes.ok) throw new Error("Failed to extract city");
      const extractData = await extractRes.json();
      const extractedCity = extractData.city;

      let fetchedWeather = null;

      // 2. If a city was found in the text, fetch its weather
      if (extractedCity) {
        setDetectedCity(extractedCity);
        const weatherRes = await fetch(`/api/weather?city=${encodeURIComponent(extractedCity)}`);
        
        if (weatherRes.ok) {
          fetchedWeather = await weatherRes.json();
          setWeatherData(fetchedWeather);
        } else {
          const wError = await weatherRes.json();
          setError(wError.error || 'City not found in our database.');
        }
      } else {
        setError('Could not detect a specific city in your question.');
      }

      // 3. Ask AI for the final advice, passing the query and (optional) weather
      const adviceRes = await fetch('/api/ask-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'get_advice', 
          query, 
          city: extractedCity, 
          weatherData: fetchedWeather 
        }),
      });

      if (!adviceRes.ok) throw new Error("Failed to get AI advice");
      const adviceData = await adviceRes.json();
      setans(adviceData.text || adviceData.error);

    } catch (err) {
      console.error("Error processing request:", err);
      setans("An error occurred while getting your answer.");
    }
  }

  return (
    <div>
      <div className="p-4 text-center text-white bg-blue-500 font-bold">Weather app</div>
      <div className="p-4 text-center">
        <h1>Ask a question : </h1>
        <input
          type="text"
          className="border-2 border-gray-300 p-2 rounded-lg w-1/2"
          placeholder="e.g. Should I travel to Mumbai today?"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          onClick={handleAsk}
        >
          Ask AI
        </button>
      </div>

      {/* Weather Information */}
      <div>
        {weatherData && detectedCity && (
          <div className="p-4 text-center">
            <h2>Current Weather in {detectedCity}</h2>
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