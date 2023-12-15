'use server';

import { Frequency } from '@prisma/client';
import * as z from 'zod';

import { db } from '@/lib/db';

type RangeAllocateOutput = { error: string } | { data: number[] };

const rangeAllocateSchema = z
  .object({
    from: z.coerce.number().positive(),
    to: z.coerce.number().min(1),
    spacing: z.coerce.number().min(1),
    start: z.coerce.number(),
    end: z.coerce.number(),
    userId: z.string(),
    email: z.string(),
    latitude: z.coerce.number().min(-90).max(90),
    longitude: z.coerce.number().min(-180).max(180),
  })
  .refine(
    (data) =>
      data.from < data.to &&
      data.spacing < data.to - data.from &&
      data.start <= data.end &&
      data.start >= data.from &&
      data.start <= data.to &&
      data.end >= data.from &&
      data.end <= data.to
  );

export async function rangeAllocate(
  data: z.infer<typeof rangeAllocateSchema>
): Promise<RangeAllocateOutput> {
  try {
    const { from, spacing, start, end, userId, email, latitude, longitude } =
      rangeAllocateSchema.parse(data);

    const availableFrequencies = await db.$transaction(async (db) => {
      const frequencies = await db.frequency.findMany({
        where: { value: { gte: start, lte: end } },
      });

      const frequenciesMap = new Map<number, Frequency>();
      frequencies.forEach((f) => frequenciesMap.set(f.value, f));

      const availableFrequencies = [];
      for (
        let i = from + Math.ceil((start - from) / spacing) * spacing;
        i <= end;
        i += spacing
      ) {
        if (!frequenciesMap.has(i)) {
          availableFrequencies.push(i);
        }
      }

      const newData = availableFrequencies.map((value) => ({
        value,
        userId,
        email,
        latitude,
        longitude,
      }));

      await db.frequency.createMany({ data: newData });
      if (userId !== 'forbidden') {
        await db.frequencyLocation.createMany({ data: newData });
      }

      return availableFrequencies;
    });

    return { data: availableFrequencies };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: JSON.stringify(error.issues) };
    }

    return { error: 'Something went wrong!' };
  }
}
