import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs';
import * as z from 'zod';

import { db } from '@/lib/db';

// For server, assuming from, to, spacing in Hz
const bandSchema = z
  .object({
    from: z.coerce.number(),
    to: z.coerce.number(),
    spacing: z.coerce.number(),
    name: z.string(),
  })
  .refine((data) => data.from < data.to, {
    message: '(From) must be less than (To)',
    path: ['from'],
  })
  .refine((data) => data.from < data.to, {
    message: '(From) must be less than (To)',
    path: ['to'],
  })
  .refine((data) => data.spacing < data.to - data.from, {
    message: '(Spacing) must be less than (To - From)',
    path: ['spacing'],
  });

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
    const { from, to, spacing, name } = bandSchema.parse(data);
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
