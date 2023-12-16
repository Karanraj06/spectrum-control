'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { MapPin } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

import { useLocationStore } from '@/hooks/use-location-store';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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

import { Button } from './ui/button';
import { Input } from './ui/input';

const userLocationSchema = z.object({
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
});

type UserLocationFormValues = z.infer<typeof userLocationSchema>;

export default function UserLocation() {
  const [open, setOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { latitude, longitude, setLatitude, setLongitude } = useLocationStore();

  const form = useForm<UserLocationFormValues>({
    resolver: zodResolver(userLocationSchema),
    mode: 'onChange',
  });

  if (latitude !== null && longitude !== null) {
    return null;
  }

  function onSubmit(data: UserLocationFormValues) {
    setLatitude(data.latitude);
    setLongitude(data.longitude);
    setOpen(false);
  }

  function getGeolocationData() {
    setOpen(false);
    setIsLoading(true);

    const promise = () =>
      new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLatitude(parseFloat(position.coords.latitude.toFixed(4)));
            setLongitude(parseFloat(position.coords.longitude.toFixed(4)));
            resolve(position);
          },
          (error) => reject(error)
        );
      }).finally(() => setIsLoading(false));

    toast.promise(promise, {
      loading: 'Fetching location...',
      success: 'Location fetched successfully',
      error: 'Location fetch failed',
    });
  }

  return (
    <Dialog open={open} onOpenChange={() => setOpen(!open)}>
      <DialogTrigger asChild>
        <Button variant='outline' className='flex gap-2' disabled={isLoading}>
          <MapPin className='h-4 w-4' /> Allow location access
        </Button>
      </DialogTrigger>
      <DialogContent className='max-h-screen overflow-y-scroll sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>What is your location?</DialogTitle>
          <DialogDescription>
            Please tell us your coordinatess or allow location access
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
            <FormField
              control={form.control}
              name='latitude'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Latitue</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      placeholder='in decimal degrees'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='longitude'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Longitude</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      placeholder='in decimal degrees'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type='submit' className='w-full'>
              Submit
            </Button>
          </form>
        </Form>
        <div className='relative'>
          <div className='absolute inset-0 flex items-center'>
            <span className='w-full border-t' />
          </div>
          <div className='relative flex justify-center text-xs uppercase'>
            <span className='bg-background px-2 text-muted-foreground'>Or</span>
          </div>
        </div>
        <Button className='flex gap-2' onClick={getGeolocationData}>
          <MapPin className='h-4 w-4' /> Allow location access
        </Button>
      </DialogContent>
    </Dialog>
  );
}
