'use client';

import { FC, useState } from 'react';
import { useRouter } from 'next/navigation';
import { rangeAllocateFirstN } from '@/actions/range-allocate-first-n';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

import { useLocationStore } from '@/hooks/use-location-store';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

import { Button } from './ui/button';
import { Input } from './ui/input';

interface RangeAllocateFirstNProps {
  from: number;
  to: number;
  spacing: number;
  userId: string;
  email: string;
}

const RangeAllocateFirstN: FC<RangeAllocateFirstNProps> = ({
  from,
  to,
  spacing,
  userId,
  email,
}) => {
  const [open, setOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

  const { latitude, longitude } = useLocationStore();

  const rangeAllocateFirstNSchema = z
    .object({
      from: z.coerce
        .number()
        .min(from / 1000000)
        .max(to / 1000000),
      to: z.coerce
        .number()
        .min(from / 1000000)
        .max(to / 1000000),
      n: z.coerce.number().int().min(1),
    })
    .refine((data) => data.from < data.to, {
      message: '(From) must be less than (To)',
      path: ['from'],
    })
    .refine((data) => data.from < data.to, {
      message: '(From) must be less than (To)',
      path: ['to'],
    });

  type RangeAllocateFirstNFormValues = z.infer<
    typeof rangeAllocateFirstNSchema
  >;

  const form = useForm<RangeAllocateFirstNFormValues>({
    resolver: zodResolver(rangeAllocateFirstNSchema),
    mode: 'onChange',
  });

  async function onSubmit(data: RangeAllocateFirstNFormValues) {
    if (!latitude || !longitude) {
      return toast.error('Allow access to your location to continue');
    }

    setIsLoading(true);

    const res = await rangeAllocateFirstN({
      from,
      to,
      spacing,
      start: data.from * 1000000,
      end: data.to * 1000000,
      userId,
      email,
      latitude,
      longitude,
      n: data.n,
    });

    if ('error' in res) {
      setIsLoading(false);
      return toast.error(res.error);
    }

    toast.success('Frequencies acquired successfully');
    setOpen(false);
    router.refresh();
    setIsLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={() => setOpen(!open)}>
      <DialogTrigger asChild>
        <Button variant='outline' className='flex gap-2'>
          Choose in Range
        </Button>
      </DialogTrigger>
      <DialogContent className='max-h-screen overflow-y-scroll sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Acquire first n in Range</DialogTitle>
          <DialogDescription>
            Acquire the first n available frequencies in a range. Click submit
            when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
            <FormField
              control={form.control}
              name='from'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Frequency Range (From)</FormLabel>
                  <FormControl>
                    <Input type='number' placeholder='From' {...field} />
                  </FormControl>
                  <FormDescription>
                    Enter the start frequency of the range in MHz
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='to'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Frequency Range (To)</FormLabel>
                  <FormControl>
                    <Input type='number' placeholder='To' {...field} />
                  </FormControl>
                  <FormDescription>
                    Enter the end frequency of the range in MHz
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='n'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of frequencies to allocate</FormLabel>
                  <FormControl>
                    <Input type='number' placeholder='n' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type='submit' className='w-20' disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className='h-6 w-6 animate-spin text-zinc-500' />
                ) : (
                  'Submit'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default RangeAllocateFirstN;
