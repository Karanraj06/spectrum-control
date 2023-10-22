import * as z from 'zod';

const bandSchema = z
  .object({
    from: z.coerce.number(),
    to: z.coerce.number(),
    spacing: z.coerce.number(),
    name: z.string(),
  })
  .refine((data) => data.from >= 0, {
    message: '(From) must be greater than or equal to 0',
    path: ['from'],
  })
  .refine((data) => data.to > 0, {
    message: '(To) must be greater than 0',
    path: ['to'],
  })
  .refine((data) => data.spacing > 0, {
    message: '(Spacing) must be greater than 0',
    path: ['spacing'],
  })
  .refine((data) => data.from < data.to, {
    message: '(From) must be less than (To)',
    path: ['from'],
  })
  .refine((data) => data.from < data.to, {
    message: '(From) must be less than (To)',
    path: ['to'],
  });

export const bandSchemaClient = bandSchema.refine(
  (data) => data.spacing < (data.to - data.from) * 1000,
  { message: '(Spacing) must be less than (To - From)', path: ['spacing'] }
);

export const bandSchemaServer = bandSchema.refine(
  (data) => data.spacing < data.to - data.from,
  { message: '(Spacing) must be less than (To - From)', path: ['spacing'] }
);
