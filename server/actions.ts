'use server';

import { Frequency } from '@prisma/client';
import * as z from 'zod';

import { db } from '@/lib/db';

type rangeAllocateOuput = { error: string } | { data: number[] };

const rangeAllocateSchema = z
  .object({
    from: z.coerce.number().positive(),
    to: z.coerce.number().min(1),
    spacing: z.coerce.number().min(1),
    start: z.coerce.number(),
    end: z.coerce.number(),
    userId: z.string(),
    email: z.string().email(),
    latitude: z.coerce.number(),
    longitude: z.coerce.number(),
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

export async function rangeAllocate(
  data: z.infer<typeof rangeAllocateSchema>
): Promise<rangeAllocateOuput> {
  try {
    const { from, spacing, start, end, userId, email, latitude, longitude } =
      rangeAllocateSchema.parse(data);

    const available_frequencies = await db.$transaction(async (db) => {
      const frequencies = await db.frequency.findMany({
        where: { value: { gte: start, lte: end } },
      });

      const frequencies_map = new Map<number, Frequency>();
      frequencies.forEach((f) => frequencies_map.set(f.value, f));

      const available_frequencies = [];
      for (
        let i = from + Math.ceil((start - from) / spacing) * spacing;
        i <= end;
        i += spacing
      ) {
        if (!frequencies_map.has(i)) {
          available_frequencies.push(i);
        }
      }

      const data = available_frequencies.map((value) => ({
        value,
        userId,
        email,
        latitude,
        longitude,
      }));

      await db.frequency.createMany({ data });
      await db.frequencyLocation.createMany({ data });

      return available_frequencies;
    });

    return { data: available_frequencies };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: JSON.stringify(error.issues) };
    }

    return { error: 'Something went wrong!' };
  }
}

export async function rangeDelete(
  data: z.infer<typeof rangeDeleteSchema>
): Promise<{
  error: string;
} | null> {
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
