'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { Button } from './ui/button';

export default function GoBack() {
  const router = useRouter();

  return (
    <Button
      variant='ghost'
      className='flex items-center hover:bg-neutral-200'
      onClick={() => router.back()}
    >
      <ArrowLeft className='h-4 w-4' /> Go back
    </Button>
  );
}
