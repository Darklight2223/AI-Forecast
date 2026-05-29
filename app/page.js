"use client";

import { useState, useEffect } from 'react'

const TypewriterText = ({ text }) => {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    setDisplayedText("");
    if (!text) return;

    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText(text.substring(0, i + 1));
      i++;
      if (i >= text.length) clearInterval(interval);
    }, 20);

    return () => clearInterval(interval);
  }, [text]);

  return (
    <>
      {displayedText}
      {displayedText.length < text.length && <span className="animate-pulse text-fuchsia-400 ml-0.5 font-bold">|</span>}
    </>
  );
};

const page = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [query, setQuery] = useState('');
  const [detectedCity, setDetectedCity] = useState('');
  const [error, setError] = useState(null);
  const [ans, setans] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const weatherStyles = {
    clear: {
      label: "Clear",
      badge: "border-yellow-500/50 text-yellow-300 bg-yellow-500/20",
      card: "bg-yellow-950/40 border-yellow-900/50 shadow-yellow-900/20",
    },
    clouds: {
      label: "Clouds",
      badge: "border-slate-500/50 text-slate-300 bg-slate-500/20",
      card: "bg-slate-900/60 border-slate-700/50 shadow-slate-900/20",
    },
    fog: {
      label: "Fog",
      badge: "border-gray-500/50 text-gray-300 bg-gray-500/20",
      card: "bg-gray-800/40 border-gray-700/50 shadow-gray-900/20",
    },
    rain: {
      label: "Rain",
      badge: "border-blue-500/50 text-blue-300 bg-blue-500/20",
      card: "bg-blue-950/50 border-blue-900/50 shadow-blue-900/20",
    },
    showers: {
      label: "Showers",
      badge: "border-cyan-500/50 text-cyan-300 bg-cyan-500/20",
      card: "bg-cyan-950/50 border-cyan-800/50 shadow-cyan-900/20",
    },
    snow: {
      label: "Snow",
      badge: "border-indigo-400/50 text-indigo-300 bg-indigo-500/20",
      card: "bg-indigo-950/50 border-indigo-800/50 shadow-indigo-900/20",
    },
    storm: {
      label: "Storm",
      badge: "border-amber-500/50 text-amber-300 bg-amber-500/20",
      card: "bg-amber-950/40 border-amber-900/50 shadow-amber-900/20",
    },
  };

  const getWeatherStyle = (code, rain, snow) => {
    if (snow > 0 || (code >= 71 && code <= 77)) return weatherStyles.snow;
    if (code >= 95) return weatherStyles.storm;
    if (code >= 80 && code <= 82) return weatherStyles.showers;
    if (rain > 0 || (code >= 51 && code <= 67)) return weatherStyles.rain;
    if (code >= 45 && code <= 48) return weatherStyles.fog;
    if (code >= 1 && code <= 3) return weatherStyles.clouds;
    return weatherStyles.clear;
  };

  async function handleAsk() {
    if (!query) return;

    setIsLoading(true);
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

      const extractData = await extractRes.json().catch(() => null);
      if (!extractRes.ok) {
        const message =
          extractData?.error ||
          (extractRes.status === 429
            ? "Gemini API limit hit. Please wait for some time and try again."
            : "Failed to extract city.");
        setError(message);
        setans(null);
        return;
      }

      const extractedCity = extractData?.city;

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

      const adviceData = await adviceRes.json().catch(() => null);
      if (!adviceRes.ok) {
        const message =
          adviceData?.error ||
          (adviceRes.status === 429
            ? "Gemini API limit hit. Please wait for some time and try again."
            : "Failed to get AI advice.");
        setError(message);
        setans(null);
        return;
      }

      setans(adviceData?.text || adviceData?.error);

    } catch (err) {
      console.error("Error processing request:", err);
      setans("An error occurred while getting your answer.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-40" />
      <div className="absolute -top-32 -right-20 h-80 w-80 rounded-full bg-cyan-500/30 blur-3xl float-slow" />
      <div className="absolute top-40 -left-16 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl float-slower" />

      <div className="relative z-10">
        <header className="px-6 py-6">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-cyan-300 to-emerald-300 text-slate-900 font-bold grid place-items-center">
                A
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Weather Intelligence</p>
                <h1 className="text-xl font-semibold">AI Forecast</h1>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-3 text-xs text-slate-300">
              <span className="rounded-full border border-slate-700 px-3 py-1">Open-Meteo</span>
              <span className="rounded-full border border-slate-700 px-3 py-1">7-day view</span>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-6 pb-16">
          <section className="grid gap-6 lg:grid-cols-5">
            <div className="glass-card lg:col-span-3 p-6 md:p-8 fade-in">
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">Ask anything</p>
              <h2 className="text-2xl md:text-3xl font-semibold mt-3">Plan smarter with a location-aware forecast.</h2>
              <p className="text-slate-300 mt-2">
                Ask a travel or planning question. We will detect the city, fetch a 7-day forecast, and return clear guidance.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <input
                  type="text"
                  className="flex-1 rounded-2xl bg-slate-900/70 border border-slate-700 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/60"
                  placeholder="e.g. Should I travel to Mumbai today?"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAsk();
                  }}
                />
                <button
                  className="rounded-2xl bg-gradient-to-r from-cyan-400 to-emerald-400 px-6 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-cyan-500/20 transition hover:-translate-y-0.5 hover:shadow-cyan-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleAsk}
                  disabled={isLoading || !query}
                >
                  {isLoading ? "Working..." : "Ask AI"}
                </button>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-300">
                <span className="rounded-full border border-slate-700 px-3 py-1">Try: "Is Jaipur too hot tomorrow?"</span>
                <span className="rounded-full border border-slate-700 px-3 py-1">Try: "Should I visit Chennai this week?"</span>
              </div>
            </div>

            <div className="glass-card lg:col-span-2 p-6 md:p-8 fade-in">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Status</p>
              <h3 className="text-lg font-semibold mt-3">Signal Center</h3>
              <div className="mt-5 space-y-4">
                <div>
                  <p className="text-xs text-slate-400">Detected city</p>
                  <p className="text-lg font-semibold text-slate-100">
                    {detectedCity || "Waiting for your question"}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${isLoading ? "bg-amber-400 animate-pulse" : weatherData ? "bg-emerald-400" : "bg-slate-600"}`}
                  />
                  <span>
                    {isLoading ? "Fetching forecast" : weatherData ? "Forecast ready" : "Idle"}
                  </span>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-slate-950/80 px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Quick cues</p>
                  <p className="mt-2 text-sm text-slate-200">Mention the city and time window for sharper results.</p>
                  <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-slate-400">
                    <span className="rounded-full border border-slate-800 px-2 py-1">Weekend plans</span>
                    <span className="rounded-full border border-slate-800 px-2 py-1">Business travel</span>
                    <span className="rounded-full border border-slate-800 px-2 py-1">Outdoor events</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {error && (
            <div className="glass-card mt-8 border border-red-500/40 bg-red-950/40 p-4 text-sm text-red-200 fade-in">
              {error}
            </div>
          )}

          {ans && !error && (
            <div className="relative mt-8 rounded-[24px] border border-fuchsia-500/30 bg-gradient-to-br from-fuchsia-950/40 via-purple-900/40 to-slate-900/80 p-6 shadow-[0_0_30px_-5px_rgba(192,38,211,0.15)] fade-in overflow-hidden">
              <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-fuchsia-500/10 blur-2xl"></div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-fuchsia-400 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-fuchsia-500/30 text-xs">
                  ✨
                </div>
                <span className="font-semibold text-fuchsia-100 tracking-wide">AI Guidance</span>
              </div>
              <div className="text-[15px] text-fuchsia-50/90 whitespace-pre-wrap leading-relaxed relative z-10">
                {isLoading ? (
                  <span className="animate-pulse">{ans}</span>
                ) : (
                  <TypewriterText text={ans} />
                )}
              </div>
            </div>
          )}

          {weatherData && detectedCity && (
            <section className="mt-10">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">7-day forecast for {weatherData.location || detectedCity}</h2>
                <span className="text-xs text-slate-400">Local timezone</span>
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {weatherData.daily?.time?.map((date, index) => {
                  const style = getWeatherStyle(
                    weatherData.daily.weather_code[index],
                    weatherData.daily.rain_sum[index],
                    weatherData.daily.snowfall_sum[index]
                  );

                  return (
                  <div
                    key={date}
                    className={`p-5 rounded-[24px] border backdrop-blur-xl shadow-lg transition hover:-translate-y-1 ${style.card}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold">
                          {new Date(date).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                        </p>
                        <p className="text-xs text-slate-400">Weather code: {weatherData.daily.weather_code[index]}</p>
                      </div>
                      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${style.badge}`}>
                        {style.label}
                      </span>
                    </div>
                    <div className="mt-4 space-y-2 text-sm text-slate-200">
                      <div className="flex items-center justify-between">
                        <span>Max / Min</span>
                        <span className="font-semibold">
                          {weatherData.daily.temperature_2m_max[index]}°C / {weatherData.daily.temperature_2m_min[index]}°C
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Rain</span>
                        <span>{weatherData.daily.rain_sum[index]}mm</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Showers</span>
                        <span>{weatherData.daily.showers_sum[index]}mm</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Snowfall</span>
                        <span>{weatherData.daily.snowfall_sum[index]}cm</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-300">
                        <span>Precip chance</span>
                        <span>{weatherData.daily.precipitation_probability_max[index]}%</span>
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>

  )
}

export default page