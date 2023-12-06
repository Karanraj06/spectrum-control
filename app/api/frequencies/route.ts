import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs';
import * as z from 'zod';

import { db } from '@/lib/db';

export async function DELETE(request: NextRequest) {
  const user = await currentUser();
  const searchParams = request.nextUrl.searchParams;
  const role = searchParams.get('role');

  if (!user || (role === 'admin' && user.publicMetadata?.role !== 'admin')) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    if (role === 'admin') {
      await db.frequency.deleteMany({});
    } else {
      await db.frequency.deleteMany({ where: { userId: user.id } });
    }
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.issues), { status: 422 });
    }
    console.log(error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
