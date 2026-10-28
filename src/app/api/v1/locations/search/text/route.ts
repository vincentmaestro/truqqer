import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');

  if(!query) {
    return Response.json({
      error: 'please include query text in your request'
    }, {
      status: 400
    });
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=10&accept-language=en&countrycodes=ng&q=${query}`, {
        headers: {
          "User-Agent": "Truqqer-co/1.0",
          "Accept": "application/json",
        }
      }
    );

    if(!response.ok)
      throw new Error('Failed to fetch details for this location');

    const results: { lat: string; lon: string; display_name: string }[] = await response.json();
    const data = results.map(d => ({
      coords: { latitude: Number(d.lat), longitude: Number(d.lon) },
      name: d.display_name,
    }));

    return Response.json({ data });
  }
  catch(err) {
    console.error(err instanceof Error ? err.message : String(err));
    return Response.json({
      error: err instanceof Error ? err.message : String(err)
    }, {
      status: 500
    });
  }
}
