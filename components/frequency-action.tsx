'use client';

import { FC, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';

interface FrequencyActionProps {
  frequency: number;
  userId: string;
  email: string;
  emailAddress: string;
}

const FrequencyAction: FC<FrequencyActionProps> = ({
  frequency,
  userId,
  email,
  emailAddress,
}) => {
  const [open, setOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

  async function handleOnClick() {}

  if (emailAddress === 'N/A') {
    return (
      <Dialog open={open} onOpenChange={() => setOpen(!open)}>
        <DialogTrigger asChild>
          {emailAddress === 'N/A' ? (
            <button
              type='button'
              className='inline-flex h-9 items-center justify-center rounded-md bg-[hsl(143,_85%,_96%)] px-3 text-sm font-medium text-[hsl(140,_100%,_27%)] ring-offset-background transition-colors hover:bg-green-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'
            >
              Acquire
            </button>
          ) : (
            <button
              type='submit'
              className='inline-flex h-9 items-center justify-center rounded-md bg-[hsl(359,_100%,_97%)] px-3 text-sm font-medium text-[hsl(360,_100%,_45%)] ring-offset-background transition-colors hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'
            >
              Unacquire
            </button>
          )}
        </DialogTrigger>
        <DialogContent className='max-h-screen overflow-y-scroll sm:max-w-[425px]'>
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              {emailAddress === 'N/A'
                ? 'Are you sure you want to acquire this frequency?'
                : 'Are you sure you want to unacquire this frequency?'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type='submit'
              className='w-20'
              onClick={handleOnClick}
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
};

export default FrequencyAction;
