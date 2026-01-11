import { db } from "../db";
import { sql } from 'drizzle-orm';
import { driverCurrentLocation, userCurrentLocation } from '../db/schemas/locations';

/**
 * Performs a query to find available drivers within a given range/radius relative to the caller's location.
 * All numeric values e.g. range, radius, proximity are in meters.
 * @param myLocation - user provided location data (latitude and longitude) from client/map.
 * @param withinRadius - numeric value (in meters) specified by the caller within which they wish to search for drivers.
 * @returns Array of available drivers with location and proximity data
 */

export async function nearbyDrivers(myLocation: { lat: number; lng: number }, withinRadius: number) {
    const driverLocations = await db.select({
        driverId: driverCurrentLocation.driverId,
        latitude: sql<number>`ST_Y(${driverCurrentLocation.location})`,
        longitude: sql<number>`ST_X(${driverCurrentLocation.location})`,
        proximity: sql<number>`ST_Distance(
            ${driverCurrentLocation.location}::geography,
            ST_SetSRID(ST_MakePoint(${myLocation.lng}, ${myLocation.lat}), 4326)::geography
        )`
    })
    .from(driverCurrentLocation)
    .where(sql`
        ${driverCurrentLocation.location} IS NOT NULL
        AND ST_DWithin(
            ${driverCurrentLocation.location}::geography,
            ST_SetSRID(ST_MakePoint(${myLocation.lng}, ${myLocation.lat}), 4326)::geography,
            ${withinRadius}
        )
    `)
    // .orderBy(sql`ST_Distance(
    //     ${driverCurrentLocation.location}::geography,
    //     ST_SetSRID(ST_MakePoint(${myLocation.lng}, ${myLocation.lat}), 4326)::geography
    // )`)
    .limit(10);

    if(driverLocations.length === 0)
        return [];

    const driverIds = driverLocations.map(driver => driver.driverId);

    const driverDetails = await db.query.driver.findMany({
        where: (driver, { and, eq, inArray }) => and(
            inArray(driver.id, driverIds),
            eq(driver.isAvailable, true),
            eq(driver.approved, true),
            eq(driver.suspended, false),
        ),
        columns: {
            id: true,
            gender: true,
            name: true,
            phone: true,
            photo: true,
            rating: true
        }
    });

    const availableDrivers = driverLocations.map(location => {
        const driver = driverDetails.find(details => details.id === location.driverId);

        return {
            ...driver,
            latitude: location.latitude,
            longitude: location.longitude,
            proximity: location.proximity
        };
    })
    .filter(d => d.id);

    return availableDrivers;
}

