'use server';

import { Frequency } from '@prisma/client';
import * as z from 'zod';

import { db } from '@/lib/db';

const chooseRangeSchema = z
  .object({
    from: z.coerce.number().positive(),
    to: z.coerce.number().min(1),
    spacing: z.coerce.number().min(1),
    start: z.coerce.number(),
    end: z.coerce.number(),
    _spacing: z.coerce.number(),
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

export async function chooseRange(
  data: z.infer<typeof chooseRangeSchema>
): Promise<
  | { state: 'success'; message: string; data: number[] }
  | { state: 'error'; message: string }
> {
  try {
    const { from, spacing, start, end, _spacing, n } =
      chooseRangeSchema.parse(data);

    return await db.$transaction(async (db) => {
      const frequencies = await db.frequency.findMany({
        where: { value: { gte: start, lte: end } },
      });

      const frequenciesMap = new Map<number, Frequency>();
      frequencies.forEach((f) => frequenciesMap.set(f.value, f));

      let availableFrequencies = [];
      for (
        let i = from + Math.ceil((start - from) / spacing) * spacing;
        i <= end;

      ) {
        if (!frequenciesMap.has(i)) {
          availableFrequencies.push(i);
          i += _spacing;
        } else {
          i += spacing;
        }
      }

      if (availableFrequencies.length >= n) {
        return {
          state: 'success',
          message: `Acquire ${n} frequencies ${_spacing / 1000000} MHz apart.`,
          data: availableFrequencies.slice(0, n),
        };
      }

      availableFrequencies = [];
      for (
        let i = from + Math.ceil((start - from) / spacing) * spacing;
        i <= end;
        i += spacing
      ) {
        if (!frequenciesMap.has(i)) {
          availableFrequencies.push(i);
        }
      }

      const m = availableFrequencies.length;
      if (m < n) {
        return {
          state: 'error',
          message: `Available ${availableFrequencies.length}, requesting ${n}`,
        };
      }

      const delta = Math.floor(m / n),
        _data = [];
      for (let i = 0; _data.length < n; i += delta) {
        _data.push(availableFrequencies[i]);
      }

      return {
        state: 'success',
        message:
          'Unable to get requested frequencies, returning closest match.',
        data: _data,
      };
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { state: 'error', message: JSON.stringify(error.issues) };
    }

    return { state: 'error', message: 'Something went wrong!' };
  }
}

export async function updateDB(
  userId: string,
  email: string,
  latitude: number,
  longitude: number,
  data: number[]
): Promise<{ state: 'success' | 'error'; message: string }> {
  const newData = data.map((value) => ({
    value,
    userId,
    email,
    latitude,
    longitude,
  }));
  try {
    await db.frequency.createMany({ data: newData });
    await db.frequencyLocation.createMany({ data: newData });
    return { state: 'success', message: 'Frequencies acquired successfully!' };
  } catch (error) {
    return { state: 'error', message: 'Something went wrong!' };
  }
}
