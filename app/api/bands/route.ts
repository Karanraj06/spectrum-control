import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs';
import { z } from 'zod';

import { db } from '@/lib/db';
import { bandSchemaServer } from '@/lib/validations/band';

export async function POST(request: NextRequest) {
  const user = await currentUser();

  if (!user || user.publicMetadata?.role !== 'admin') {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const data = await request.json();

  try {
    const { from, to, spacing, name } = bandSchemaServer.parse(data);

    const band = await db.band.create({
      data: { from, to, spacing, name },
    });

    return NextResponse.json(band);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.issues), { status: 422 });
    }

    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
