import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');

  if(!lat || !lng) {
    return Response.json({
      error: 'provide lat and lng values via query params to complete this request'
    }, {
      status: 400
    });
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`, {
        headers: {
          "User-Agent": "Truqqer-co/1.0",
          "Accept": "application/json",
        }
      }
    );

    if(!response.ok)
      throw new Error('Failed to fetch details for this location');

    const data = await response.json();
    const { display_name } = data;

    return Response.json({
      name: display_name,
      position: {
        lat: data.lat,
        lon: data.lon
      }
    });
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
