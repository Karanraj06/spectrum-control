'use client';

import { FC, useState } from 'react';
import { useRouter } from 'next/navigation';
import { chooseRange, updateDB } from '@/actions/choose-range';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

import { useLocationStore } from '@/hooks/use-location-store';
import { Button } from '@/components/ui/button';
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
import { Input } from '@/components/ui/input';

interface ChooseRangeProps {
  from: number;
  to: number;
  spacing: number;
  userId: string;
  email: string;
  name: string;
}

const ChooseRange: FC<ChooseRangeProps> = ({
  from,
  to,
  spacing,
  userId,
  email,
  name,
}) => {
  const [open, setOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

  const _spacing = name === 'VHF' ? 1000000 : name === 'HF' ? 500000 : 1500000;
  const [frequencyArray, setFrequencyArray] = useState<number[]>([]);
  const [message, setMessage] = useState<string>('');

  const { latitude, longitude } = useLocationStore();

  const ChooseRangeSchema = z
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

  type ChooseRangeFormValues = z.infer<typeof ChooseRangeSchema>;

  const form = useForm<ChooseRangeFormValues>({
    resolver: zodResolver(ChooseRangeSchema),
    mode: 'onChange',
  });

  async function onSubmit(data: ChooseRangeFormValues) {
    if (latitude === null || longitude === null) {
      return toast.error('Allow access to your location to continue');
    }

    setIsLoading(true);

    const res = await chooseRange({
      from,
      to,
      spacing,
      start: data.from * 1000000,
      end: data.to * 1000000,
      _spacing,
      n: data.n,
    });

    if (res.state === 'error') {
      setIsLoading(false);
      return toast.error(res.message);
    }

    setFrequencyArray(res.data);
    setMessage(res.message);
    setIsLoading(false);
  }

  async function onConfirm() {
    setIsLoading(true);

    const res = await updateDB(
      userId,
      email,
      latitude as number,
      longitude as number,
      frequencyArray
    );

    setIsLoading(false);
    setOpen(false);

    if (res.state === 'error') {
      return toast.error(res.message);
    } else {
      router.refresh();
      return toast.success(res.message);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={() => {
        setFrequencyArray([]);
        setMessage('');
        setOpen(!open);
      }}
    >
      <DialogTrigger asChild>
        <Button variant='outline' className='flex gap-2'>
          Choose in Range
        </Button>
      </DialogTrigger>
      {!frequencyArray.length ? (
        <DialogContent className='max-h-screen overflow-y-scroll sm:max-w-[425px]'>
          <DialogHeader>
            <DialogTitle>Choose in Range</DialogTitle>
            <DialogDescription>
              Acquire the first n available frequencies which are{' '}
              {_spacing / 1000000} MHz apart.
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
      ) : (
        <DialogContent className='max-h-screen overflow-y-scroll sm:max-w-[425px]'>
          <DialogHeader>
            <DialogTitle>{message}</DialogTitle>
            <DialogDescription className='max-h-[300px] overflow-y-scroll'>
              <div className='grid place-content-center'>
                {frequencyArray.map((f) => (
                  <div key={f}>{f / 1000000} MHz</div>
                ))}
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type='submit'
              className='w-20'
              onClick={onConfirm}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className='h-6 w-6 animate-spin text-zinc-500' />
              ) : (
                'Confirm'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      )}
    </Dialog>
  );
};

export default ChooseRange;
