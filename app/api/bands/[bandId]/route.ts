import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs';
import * as z from 'zod';

import { db } from '@/lib/db';
import { bandSchemaServer } from '@/lib/validations/band';

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
    const { from, to, spacing, name } = bandSchemaServer.parse(data);
    const { params } = routeContextSchema.parse(context);

    const band = await db.band.update({
      where: { id: params.bandId },
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
