import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs';
import * as z from 'zod';

import { db } from '@/lib/db';
import { bandSchema } from '@/lib/validators/band';

const routeContextSchema = z.object({
  params: z.object({
    bandId: z.string(),
  }),
});

export async function DELETE(
  request: NextRequest,
  context: z.infer<typeof routeContextSchema>
) {
  const user = await currentUser();

  if (!user || user.publicMetadata?.role !== 'admin') {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const { params } = routeContextSchema.parse(context);

    await db.band.delete({
      where: { id: params.bandId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.issues), { status: 422 });
    }

    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  context: z.infer<typeof routeContextSchema>
) {
  const user = await currentUser();

  if (!user || user.publicMetadata?.role !== 'admin') {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const data = await request.json();

  try {
    const { from, to, spacing } = bandSchema.parse(data);
    const { params } = routeContextSchema.parse(context);

    if (from >= to || spacing >= to - from) {
      return new NextResponse('Invalid band parameters', { status: 400 });
    }

    const band = await db.band.update({
      where: { id: params.bandId },
      data: { from, to, spacing },
    });

    return NextResponse.json(band);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.issues), { status: 422 });
    }

    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
