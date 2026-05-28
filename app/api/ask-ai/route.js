import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request) {
  try {
    const body = await request.json();
    const { city, weatherData } = body;

    if (!city || !weatherData) {
      return NextResponse.json(
        { error: "Missing city or weatherData." },
        { status: 400 }
      );
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY || process.env.GOOGLE_API_KEY;
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    const prompt = `
    You are a weather assistant.

    City: ${city}

    Weather:
    - Temperature: ${weatherData?.temperature}
    - Condition: ${weatherData?.condition}
    - Humidity: ${weatherData?.humidity}
    - Wind Speed: ${weatherData?.windSpeed}

    Give practical advice in 2 short lines.
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return NextResponse.json({ text });
  } catch (error) {
    console.error("Error generating AI response:", error);
    return NextResponse.json(
      { error: "Failed to generate response." },
      { status: 500 }
    );
  }
}




