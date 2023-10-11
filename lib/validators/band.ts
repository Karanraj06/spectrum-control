import * as z from 'zod';

export const bandSchema = z.object({
  from: z.coerce.number(),
  to: z.coerce.number(),
  spacing: z.coerce.number(),
});
