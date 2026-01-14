import { db } from "../db";
import { sql } from 'drizzle-orm';
import { driverLocations } from '../db/schemas/user-and-driver';

/**
 * Performs a query to find available drivers within a given range/radius relative to the caller's location.
 * All numeric values e.g. range, radius, proximity are in meters.
 * @param myLocation - user provided location data (latitude and longitude) from client/map.
 * @param withinRadius - numeric value (in meters) specified by the caller within which they wish to search for drivers.
 * @returns Array of available drivers with location and proximity data
 */

export async function nearbyDrivers(myLocation: { lat: number; lng: number }, withinRadius: number) {
    const nearbyDriverLocations = await db.select({
        driverId: driverLocations.driverId,
        latitude: sql<number>`ST_Y(${driverLocations.location})`,
        longitude: sql<number>`ST_X(${driverLocations.location})`,
        proximity: sql<number>`ST_Distance(
            ${driverLocations.location}::geography,
            ST_SetSRID(ST_MakePoint(${myLocation.lng}, ${myLocation.lat}), 4326)::geography
        )`
    })
    .from(driverLocations)
    .where(sql`
        ${driverLocations.location} IS NOT NULL
        AND ST_DWithin(
            ${driverLocations.location}::geography,
            ST_SetSRID(ST_MakePoint(${myLocation.lng}, ${myLocation.lat}), 4326)::geography,
            ${withinRadius}
        )
    `)
    // .orderBy(sql`ST_Distance(
    //     ${driverLocations.location}::geography,
    //     ST_SetSRID(ST_MakePoint(${myLocation.lng}, ${myLocation.lat}), 4326)::geography
    // )`)
    .limit(10);

    if(nearbyDriverLocations.length === 0)
        return [];

    const driverIds = nearbyDriverLocations.map(driver => driver.driverId);

    const driverDetails = await db.query.drivers.findMany({
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

    const availableDrivers = nearbyDriverLocations.map(location => {
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

