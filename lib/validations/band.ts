import * as z from 'zod';

// For client, assuming from, to in MHz and spacing in KHz
export const bandSchema = z
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
  .refine((data) => data.spacing < (data.to - data.from) * 1000, {
    message: '(Spacing) must be less than (To - From)',
    path: ['spacing'],
  });
