'use client';

import { FC } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from './ui/button';

interface RedirectButtonProps {
  value: number;
}

const RedirectButton: FC<RedirectButtonProps> = ({ value }) => {
  const router = useRouter();

  return (
    <Button
      variant='ghost'
      className='hover:bg-neutral-200'
      onClick={() => router.push(`/frequencies/${value}`)}
    >
      {value / 1000000} MHz
    </Button>
  );
};

export default RedirectButton;
