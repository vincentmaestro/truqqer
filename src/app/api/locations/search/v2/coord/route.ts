import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  const apiKey = process.env.HERE_API_KEY!;

  if(!lat || !lng) {
    return Response.json({
      error: 'provide lat and lng values via query params to complete this request'
    }, {
      status: 400
    });
  }

  try {
    const response = await fetch(
      `https://revgeocode.search.hereapi.com/v1/
        revgeocode
        ?at=${lat}%2C${lng}
        &lang=en-US
        &apiKey=${apiKey}`
    );

    if(!response.ok)
      throw new Error('Failed to fetch details for this location');

    const result = await response.json();
    const data = result.items[0];

    return Response.json({
      name: data.title,
      position: { ...data.position }
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
