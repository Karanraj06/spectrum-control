'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { MoreHorizontal } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function MenuItem() {
  const [hydrated, setHydrated] = useState<boolean>(false);
  const { user } = useUser();

  useEffect(() => {
    setHydrated(true);
  }, []);

  if (!hydrated) {
    return (
      <Button variant='ghost' size='icon' className='hover:bg-neutral-200'>
        <MoreHorizontal className='h-4 w-4 stroke-gray-700' />
      </Button>
    );
  }

  if (!user) {
    return null;
  }

  return (
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
            <DropdownMenuItem>Update</DropdownMenuItem>
            <DropdownMenuItem>Delete</DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
