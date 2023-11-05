'use server';

import * as z from 'zod';

import { db } from '@/lib/db';

const rangeDeleteSchema = z
  .object({
    from: z.coerce.number().positive(),
    to: z.coerce.number().min(1),
    spacing: z.coerce.number().min(1),
    start: z.coerce.number(),
    end: z.coerce.number(),
    userId: z.string(),
  })
  .refine(
    (data) =>
      data.from < data.to &&
      data.spacing < data.to - data.from &&
      data.start < data.end &&
      data.start >= data.from &&
      data.start <= data.to &&
      data.end >= data.from &&
      data.end <= data.to
  );

export async function rangeDelete(
  data: z.infer<typeof rangeDeleteSchema>
): Promise<{ error: string } | null> {
  try {
    const { start, end, userId } = rangeDeleteSchema.parse(data);

    await db.frequency.deleteMany({
      where: { value: { gte: start, lte: end }, userId },
    });

    return null;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: JSON.stringify(error.issues) };
    }

    return { error: 'Something went wrong!' };
  }
}
