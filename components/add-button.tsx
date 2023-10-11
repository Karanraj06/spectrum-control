'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import axios, { AxiosError } from 'axios';
import { Loader2, PlusCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

import { bandSchema } from '@/lib/validators/band';
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

import { Input } from './ui/input';

type BandFormValues = z.infer<typeof bandSchema>;

const defaultValues: Partial<BandFormValues> = {
  from: 0,
  to: 0,
  spacing: 0,
};

export default function AddButton() {
  const [open, setOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

  const form = useForm<BandFormValues>({
    resolver: zodResolver(bandSchema),
    defaultValues,
    mode: 'onChange',
  });

  async function onSubmit(data: BandFormValues) {
    setIsLoading(true);
    try {
      await axios.post('/api/bands', data);

      toast.success('Band added successfully');
      setOpen(false);
      router.refresh();
    } catch (error) {
      console.log(error);
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) {
          return toast.error('You are not authorized to add a band');
        }

        return toast.error(error.response?.data);
      }
      toast.error('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={() => setOpen(!open)}>
      <DialogTrigger asChild>
        <Button variant='outline' className='mb-2 mt-10 flex gap-2'>
          <PlusCircle className='h-4 w-4' /> Add Band
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Create New Band</DialogTitle>
          <DialogDescription>
            Add a new frequency band here. Click submit when you&apos;re done.
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
                    <Input type='number' placeholder='from' {...field} />
                  </FormControl>
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
                    <Input type='number' placeholder='to' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='spacing'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Channel Spacing</FormLabel>
                  <FormControl>
                    <Input type='number' placeholder='spacing' {...field} />
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
}
