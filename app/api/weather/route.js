import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get("city");

  if (!city) {
    return NextResponse.json({ error: "City is required" }, { status: 400 });
  }

  const cityLower = city.toLowerCase();

  if (cityLower === "delhi") {
    return NextResponse.json({
      temperature: "30°C",
      condition: "Sunny",
      humidity: "40%",
      windSpeed: "10 km/h",
    });
  } else if (cityLower === "mumbai") {
    return NextResponse.json({
      temperature: "25°C",
      condition: "Cloudy",
      humidity: "60%",
      windSpeed: "15 km/h",
    });
  } else {
    return NextResponse.json(
      { error: 'City not found. Please enter "Delhi" or "Mumbai" for demo purposes.' },
      { status: 404 }
    );
  }
}
