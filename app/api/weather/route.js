import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get("city");

  if (!city) {
    return NextResponse.json({ error: "City is required" }, { status: 400 });
  }

  try {
    // 1. Get coordinates for the city using geocoding API
    const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
    const geoData = await geoRes.json();

    if (!geoData.results || geoData.results.length === 0) {
      return NextResponse.json({ error: "City not found." }, { status: 404 });
    }

    const { latitude, longitude, name, country } = geoData.results[0];

    // 2. Fetch daily forecast using Open-Meteo
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=rain_sum,precipitation_sum,snowfall_sum,precipitation_probability_max,showers_sum,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,weather_code&timezone=auto`;
    const weatherRes = await fetch(weatherUrl);
    const weatherData = await weatherRes.json();

    return NextResponse.json({
      location: `${name}, ${country}`,
      daily: weatherData.daily
    });
  } catch (error) {
    console.error("Error fetching weather:", error);
    return NextResponse.json(
      { error: "Failed to fetch weather data." },
      { status: 500 }
    );
  }
}
