'use client';

import { PlusCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';

export default function AddButton() {
  return (
    <Button variant='outline' className='mb-2 mt-10 flex gap-2'>
      <PlusCircle className='h-4 w-4' /> Add Band
    </Button>
  );
}
