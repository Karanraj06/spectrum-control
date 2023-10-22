'use client';

import { FC } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from '@radix-ui/react-icons';

import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

interface TablePaginationProps {
  pageNumber: number;
  perPage: number;
  pageCount: number;
}

const TablePagination: FC<TablePaginationProps> = ({
  pageNumber,
  perPage,
  pageCount,
}) => {
  const pageSizeOptions = [10, 20, 30, 50, 100];

  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className='flex w-full flex-col items-center justify-between gap-4 overflow-auto px-2 py-1 sm:flex-row sm:gap-8'>
      <div></div>
      <div className='flex flex-col items-center gap-4 sm:flex-row sm:gap-6 lg:gap-8'>
        <div className='flex items-center space-x-2'>
          <p className='whitespace-nowrap text-sm font-medium'>Go to page</p>
          <Input
            type='number'
            min={1}
            max={pageCount}
            defaultValue={pageNumber}
            className='h-8 w-[70px]'
            onChange={(e) => {
              const page = parseInt(e.target.value);
              if (page > 0 && page <= pageCount) {
                router.push(`${pathname}?page=${page}&per_page=${perPage}`);
              }
            }}
          />
        </div>
        <div className='flex items-center space-x-2'>
          <p className='whitespace-nowrap text-sm font-medium'>Rows per page</p>
          <Select
            defaultValue={`${perPage}`}
            onValueChange={(value) =>
              router.push(`${pathname}?page=1&per_page=${value}`)
            }
          >
            <SelectTrigger className='h-8 w-[70px]'>
              <SelectValue placeholder={perPage} />
            </SelectTrigger>
            <SelectContent side='top'>
              {pageSizeOptions.map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className='flex w-[100px] items-center justify-center text-sm font-medium'>
          Page {pageNumber} of {pageCount}
        </div>
        <div className='flex items-center space-x-2'>
          <Button
            aria-label='Go to first page'
            variant='outline'
            className='hidden h-8 w-8 p-0 lg:flex'
            onClick={() =>
              router.push(`${pathname}?page=1&per_page=${perPage}`)
            }
            disabled={pageNumber === 1}
          >
            <DoubleArrowLeftIcon className='h-4 w-4' aria-hidden='true' />
          </Button>
          <Button
            aria-label='Go to previous page'
            variant='outline'
            className='h-8 w-8 p-0'
            onClick={() =>
              router.push(
                `${pathname}?page=${pageNumber - 1}&per_page=${perPage}`
              )
            }
            disabled={pageNumber === 1}
          >
            <ChevronLeftIcon className='h-4 w-4' aria-hidden='true' />
          </Button>
          <Button
            aria-label='Go to next page'
            variant='outline'
            className='h-8 w-8 p-0'
            onClick={() =>
              router.push(
                `${pathname}?page=${pageNumber + 1}&per_page=${perPage}`
              )
            }
            disabled={pageNumber === pageCount}
          >
            <ChevronRightIcon className='h-4 w-4' aria-hidden='true' />
          </Button>
          <Button
            aria-label='Go to last page'
            variant='outline'
            className='hidden h-8 w-8 p-0 lg:flex'
            onClick={() =>
              router.push(`${pathname}?page=${pageCount}&per_page=${perPage}`)
            }
            disabled={pageNumber === pageCount}
          >
            <DoubleArrowRightIcon className='h-4 w-4' aria-hidden='true' />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TablePagination;
