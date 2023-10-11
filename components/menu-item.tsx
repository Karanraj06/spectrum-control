'use client';

import { FC, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { zodResolver } from '@hookform/resolvers/zod';
import { Band } from '@prisma/client';
import axios, { AxiosError } from 'axios';
import { Loader2, MoreHorizontal } from 'lucide-react';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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

const MenuItem: FC<Band> = ({ id, from, to, spacing }) => {
  const [hydrated, setHydrated] = useState<boolean>(false);
  const [menuItem, setMenuItem] = useState<string>('');
  const [open, setOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();
  const { user } = useUser();

  const defaultValues: Partial<BandFormValues> = {
    from: from,
    to: to,
    spacing: spacing,
  };

  const form = useForm<BandFormValues>({
    resolver: zodResolver(bandSchema),
    defaultValues,
    mode: 'onChange',
  });

  useEffect(() => {
    setHydrated(true);
  }, []);

  if (!hydrated || !user) {
    return (
      <Button variant='ghost' size='icon' className='hover:bg-neutral-200'>
        <MoreHorizontal className='h-4 w-4 stroke-gray-700' />
      </Button>
    );
  }

  async function onSubmit(data: BandFormValues) {
    setIsLoading(true);
    try {
      await axios.patch(`/api/bands/${id}`, data);

      toast.success('Band updated successfully');
      setOpen(false);
      router.refresh();
    } catch (error) {
      console.log(error);
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) {
          return toast.error('You are not authorized to update a band');
        }

        return toast.error(error.response?.data);
      }
      toast.error('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleOnDelete() {
    setIsLoading(true);
    try {
      await axios.delete(`/api/bands/${id}`);

      toast.success('Band deleted successfully');
      setOpen(false);
      router.refresh();
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) {
          return toast.error('You are not authorized to delete a band');
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
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button variant='ghost' size='icon' className='hover:bg-neutral-200'>
            <MoreHorizontal className='h-4 w-4 stroke-gray-700' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuItem>Generate Frequencies</DropdownMenuItem>
          {user?.publicMetadata?.role === 'admin' && (
            <>
              <DropdownMenuSeparator />
              <DialogTrigger asChild>
                <DropdownMenuItem onClick={() => setMenuItem('update')}>
                  Update
                </DropdownMenuItem>
              </DialogTrigger>
              <DialogTrigger asChild>
                <DropdownMenuItem onClick={() => setMenuItem('delete')}>
                  Delete
                </DropdownMenuItem>
              </DialogTrigger>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      {menuItem === 'delete' && (
        <DialogContent className='sm:max-w-[425px]'>
          <DialogHeader>
            <DialogTitle>Are you sure absolutely sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. Are you sure you want to permanently
              delete this band from our servers?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type='submit'
              className='w-20'
              onClick={handleOnDelete}
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
      {menuItem === 'update' && (
        <DialogContent className='sm:max-w-[425px]'>
          <DialogHeader>
            <DialogTitle>Update Band</DialogTitle>
            <DialogDescription>
              Update this band here. Click submit when you&apos;re done.
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
      )}
    </Dialog>
  );
};

export default MenuItem;
