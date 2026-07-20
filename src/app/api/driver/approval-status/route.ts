import { verifyToken } from '@/lib/helpers';
import { ipThrottle } from '@/lib/redis/throttle/ip-address';
import { db } from '@/lib/db';
import redis from '@/lib/redis';
import { NextRequest } from 'next/server';
import loggerFor from "@/lib/utils/logger";
import { captureException } from '@sentry/nextjs';

export async function GET(request: NextRequest) {
  const logger = loggerFor('Driver approval status')
  try {
    // const { searchParams } = new URL(request.url);
    // const token = searchParams.get('token');
    const token = request.nextUrl.searchParams.get('token');
    if (!token) {
      return Response.json(
        { success: false, message: 'Tracking ID is required' },
        { status: 400 }
      );
    }

    const validToken = verifyToken(token, process.env.NEW_DRIVER_REG_SECRET!);
    if(!validToken.success) {
      return Response.json(
        { success: false, message: 'Invalid tracking ID.' },
        { status: 400 }
      );
    }

    const { driverId } = validToken.data!

    const isCached = await redis.get(`driver-approved:${driverId}`);
    
    if(isCached) {
      return Response.json(
        {
          success: true,
          data: {
            approved: isCached === 'true',
            message: isCached === 'true'
              ? 'Your application has been approved!'
              : 'Your application is under review',
          },
        },
        { status: 200 }
      );
    }

    const driverRecord = await db.query.drivers.findFirst({
      // where: eq(drivers.driverId, driverId as string),
      where: (driver, { eq }) => eq(driver.id, driverId),
      columns: { approved: true }
    });

    if (!driverRecord) {
      return Response.json(
        { success: false, message: 'No record found for this ID. Please start a new application.' },
        { status: 404 }
      );
    }

    await redis.set(`driver-approved:${driverId}`, String(driverRecord.approved), {
      expiration: { type: 'EX', value: 7200 },
      condition: 'NX'
    });

    return Response.json(
      {
        success: true,
        data: {
          approved: driverRecord.approved,
          message: driverRecord.approved
            ? 'Your application has been approved!'
            : 'Your application is under review',
        },
      },
      { status: 200 }
    );

  } catch (error) {
    logger.error('Approval status check error:', error);
    captureException(error, {
      tags: {
        note: 'Approval status check error',
      },
      level: 'error'
    });

    return Response.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
