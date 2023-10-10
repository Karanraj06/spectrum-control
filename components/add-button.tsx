'use client';

import { useUser } from '@clerk/nextjs';
import { PlusCircle } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';

export default function AddButton() {
  const { user } = useUser();

  if (!user) return null;

  function handleOnClick() {
    if (user?.publicMetadata?.role !== 'admin') {
      return toast.error('You do not have permission to add bands');
    }
  }

  return (
    <Button
      variant='outline'
      className='mb-2 mt-10 flex gap-2'
      onClick={handleOnClick}
    >
      <PlusCircle className='h-4 w-4' /> Add Band
    </Button>
  );
}
