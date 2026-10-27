import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const q = searchParams.get('q');
  const apiKey = process.env.HERE_API_KEY!;

  if(!q) {
    return Response.json({
      error: 'please include query text in your request'
    }, {
      status: 400
    });
  }
  const query = new URLSearchParams({q}).toString();

  try {
    const response = await fetch(
      `https://geocode.search.hereapi.com/v1/
        geocode?${query}&apiKey=${apiKey}`
    );

    if(!response.ok)
      throw new Error('Failed to fetch details for this location');

    const { items }: {
      items: { title: string, position: { lat: number, lng: number }}[]
    } = await response.json();
    const data = items.map(d => ({
      coords: { latitude: d.position.lat, longitude: d.position.lng },
      name: d.title,
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
