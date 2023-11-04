'use client';

import { FC } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import { Input } from './ui/input';

interface SearchFrequencyProps {
  perPage: number;
  from: number;
  to: number;
  spacing: number;
}

const SearchFrequency: FC<SearchFrequencyProps> = ({
  perPage,
  from,
  to,
  spacing,
}) => {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className='flex w-full flex-col items-center justify-between gap-4 overflow-auto px-2 py-1 sm:flex-row sm:gap-8'>
      <div className='flex flex-1 items-center space-x-2'>
        <p className='whitespace-nowrap text-sm font-medium'>
          Search a frequency
        </p>
        <Input
          type='number'
          placeholder='Enter in MHz...'
          min={from}
          max={to}
          className='h-8 w-[150px] lg:w-[250px]'
          onChange={(e) => {
            const frequency = parseFloat(e.target.value) * 1000000;

            if (frequency < from || frequency > to) {
              return;
            }

            const pageCount = Math.ceil(
              (Math.floor((to - from) / spacing) + 1) / perPage
            );

            const page = Math.ceil(
              (Math.floor((frequency - from) / spacing) + 1) / perPage
            );

            if (page > 0 && page <= pageCount) {
              router.push(`${pathname}?page=${page}&per_page=${perPage}`);
            }
          }}
        />
      </div>
    </div>
  );
};

export default SearchFrequency;
