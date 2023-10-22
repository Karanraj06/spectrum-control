import { NextRequest, NextResponse } from 'next/server';
import * as z from 'zod';

import { db } from '@/lib/db';

const routeContextSchema = z.object({
  params: z.object({
    value: z.coerce.number(),
  }),
});

export async function DELETE(
  request: NextRequest,
  context: z.infer<typeof routeContextSchema>
) {
  try {
    const { params } = routeContextSchema.parse(context);

    await db.frequency.delete({ where: { value: params.value } });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.issues), { status: 422 });
    }
    console.log(error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
