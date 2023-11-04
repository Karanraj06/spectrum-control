import { NextRequest, NextResponse } from 'next/server';
import * as z from 'zod';

import { db } from '@/lib/db';

const frequencySchema = z.object({
  value: z.coerce.number(),
  userId: z.string(),
  email: z.string().email(),
  latitude: z.coerce.number(),
  longitude: z.coerce.number(),
});

export async function POST(request: NextRequest) {
  const data = await request.json();

  try {
    const { value, userId, email, latitude, longitude } =
      frequencySchema.parse(data);

    const frequency_location = await db.$transaction(async (db) => {
      await db.frequency.create({
        data: { value, userId, email, latitude, longitude },
      });

      const frequency_location = await db.frequencyLocation.create({
        data: { value, userId, email, latitude, longitude },
      });

      return frequency_location;
    });

    return NextResponse.json(frequency_location);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.issues), { status: 422 });
    }

    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
