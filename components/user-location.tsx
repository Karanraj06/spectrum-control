'use client';

import { useState } from 'react';
import { MapPin } from 'lucide-react';
import { toast } from 'sonner';

import { useLocationStore } from '@/hooks/use-location-store';

import { Button } from './ui/button';

export default function UserLocation() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { latitude, longitude, setLatitude, setLongitude } = useLocationStore();

  if (latitude && longitude) {
    return null;
  }

  function getGeolocationData() {
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
    <Button
      variant='outline'
      className='flex gap-2'
      onClick={getGeolocationData}
      disabled={isLoading}
    >
      <MapPin className='h-4 w-4' /> Allow location access
    </Button>
  );
}
