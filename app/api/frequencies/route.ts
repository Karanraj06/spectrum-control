import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs';
import * as z from 'zod';

import { db } from '@/lib/db';

export async function DELETE(request: NextRequest) {
  const user = await currentUser();

  if (!user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    await db.frequency.deleteMany({ where: { userId: user.id } });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.issues), { status: 422 });
    }
    console.log(error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
