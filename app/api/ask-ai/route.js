import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request) {
  try {
    const body = await request.json();
    const { action, query, city, weatherData } = body;

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY || process.env.GOOGLE_API_KEY;
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    if (action === 'extract_city') {
      const prompt = `Extract the city name from the following question. Return ONLY the city name. If no city is mentioned, return "NONE".\n\nQuestion: "${query}"`;
      const result = await model.generateContent(prompt);
      const extracted = result.response.text().trim();
      return NextResponse.json({ city: extracted === 'NONE' ? null : extracted });
    }

    if (action === 'get_advice') {
      let weatherContext = "No weather data available.";
      if (city && weatherData) {
        weatherContext = `
        City: ${city}
        Local Weather:
        - Temperature: ${weatherData.temperature}
        - Condition: ${weatherData.condition}
        - Humidity: ${weatherData.humidity}
        - Wind Speed: ${weatherData.windSpeed}
        `;
      }

      const prompt = `
      You are a helpful travel and weather assistant. The user asked:
      "${query}"

      Context:
      ${weatherContext}

      Give practical advice answering the user's question in 2 to 4 short lines.
      `;

      const result = await model.generateContent(prompt);
      const text = result.response.text();

      return NextResponse.json({ text });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch (error) {
    console.error("Error generating AI response:", error);
    return NextResponse.json(
      { error: "Failed to generate response." },
      { status: 500 }
    );
  }
}




