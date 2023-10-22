'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import axios, { AxiosError } from 'axios';
import { Loader2, PlusCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

import { bandSchemaClient } from '@/lib/validations/band';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { Input } from './ui/input';

type BandFormValues = z.infer<typeof bandSchemaClient>;

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
    resolver: zodResolver(bandSchemaClient),
    defaultValues,
    mode: 'onChange',
  });

  async function onSubmit(data: BandFormValues) {
    setIsLoading(true);
    try {
      await axios.post('/api/bands', {
        from: data.from * 1000000,
        to: data.to * 1000000,
        spacing: data.spacing * 1000,
        name: data.name,
      });

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
      <DialogContent className='max-h-screen overflow-y-scroll sm:max-w-[425px]'>
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
                    <Input type='number' placeholder='From' {...field} />
                  </FormControl>
                  <FormDescription>
                    Enter the start frequency of the band in MHz
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
                    Enter the end frequency of the band in MHz
                  </FormDescription>
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
                    <Input type='number' placeholder='Spacing' {...field} />
                  </FormControl>
                  <FormDescription>
                    Enter the channel spacing in kHz
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Band Name</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select a band name to display' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value='VHF'>VHF</SelectItem>
                      <SelectItem value='HF'>HF</SelectItem>
                      <SelectItem value='UHF - I'>UHF - I</SelectItem>
                      <SelectItem value='UHF - II'>UHF - II</SelectItem>
                      <SelectItem value='UHF - III'>UHF - III</SelectItem>
                    </SelectContent>
                  </Select>
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
