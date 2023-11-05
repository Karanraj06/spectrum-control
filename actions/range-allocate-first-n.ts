'use server';

import { Frequency } from '@prisma/client';
import * as z from 'zod';

import { db } from '@/lib/db';

type RangeAllocateFirstNOutput = { error: string } | { data: number[] };

const rangeAllocateFirstNSchema = z
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
    n: z.coerce.number().int().min(1),
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

export async function rangeAllocateFirstN(
  data: z.infer<typeof rangeAllocateFirstNSchema>
): Promise<RangeAllocateFirstNOutput> {
  try {
    const { from, spacing, start, end, userId, email, latitude, longitude, n } =
      rangeAllocateFirstNSchema.parse(data);

    return await db.$transaction(async (db) => {
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

      if (availableFrequencies.length < n) {
        return {
          error: `Available ${availableFrequencies.length}, requesting ${n}`,
        };
      }

      const firstNFrequencies = availableFrequencies.slice(0, n);

      const newData = firstNFrequencies.map((value) => ({
        value,
        userId,
        email,
        latitude,
        longitude,
      }));

      await db.frequency.createMany({ data: newData });
      await db.frequencyLocation.createMany({ data: newData });

      return { data: firstNFrequencies };
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: JSON.stringify(error.issues) };
    }

    return { error: 'Something went wrong!' };
  }
}
