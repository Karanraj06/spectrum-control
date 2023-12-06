'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios, { AxiosError } from 'axios';
import { Delete, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

import { Button } from './ui/button';

export default function DeleteAllButton() {
  const [open, setOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

  async function handleOnDelete() {
    setIsLoading(true);
    try {
      await axios.delete('/api/frequencies?role=admin');

      toast.success('All frequencies deleted successfully');
      setOpen(false);
      router.refresh();
    } catch (error) {
      if (error instanceof AxiosError) {
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
        <Button variant='outline' className='flex gap-2'>
          <Delete className='h-4 w-4' /> Delete all
        </Button>
      </DialogTrigger>
      <DialogContent className='max-h-screen overflow-y-scroll sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            This action releases all frequencies acquired by any user from our
            servers.
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
    </Dialog>
  );
}
