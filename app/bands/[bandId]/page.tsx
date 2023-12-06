import { FC } from 'react';
import Link from 'next/link';
import { currentUser } from '@clerk/nextjs';
import { Frequency } from '@prisma/client';
import { FunctionSquare } from 'lucide-react';

import { db } from '@/lib/db';
import { cn } from '@/lib/utils';
import { searchParamsSchema } from '@/lib/validations/params';
import { buttonVariants } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import FrequencyAction from '@/components/frequency-action';
import Navbar from '@/components/nav';
import RangeAllocate from '@/components/range-allocate';
import RangeAllocateFirstN from '@/components/range-allocate-first-n';
import RangeDelete from '@/components/range-delete';
import RedirectButton from '@/components/redirect-button';
import SearchFrequency from '@/components/search-frequency';
import TablePagination from '@/components/table-pagination';
import UserLocation from '@/components/user-location';
import Wrapper from '@/components/wrapper';

interface PageProps {
  params: { bandId: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

const Page: FC<PageProps> = async ({ params, searchParams }) => {
  const user = await currentUser();

  if (!user) {
    return null;
  }

  const email =
    user.emailAddresses.find((email) => email.id === user.primaryEmailAddressId)
      ?.emailAddress || 'N/A';

  // Parse search params using zod schema
  const { page, per_page } = searchParamsSchema.parse(searchParams);

  const pageAsNumber = Number(page);
  // Fallback page for invalid page numbers
  const fallbackPage =
    isNaN(pageAsNumber) || pageAsNumber < 1 ? 1 : pageAsNumber;

  // Number of items per page
  const perPageAsNumber = Number(per_page);
  const limit = isNaN(perPageAsNumber) ? 10 : perPageAsNumber;

  // Number of items to skip
  const offset = fallbackPage > 0 ? (fallbackPage - 1) * limit : 0;

  const { table_rows, pageCount, from, to, spacing } = await db.$transaction(
    async (db) => {
      const band = await db.band.findUnique({ where: { id: params.bandId } });
      const { from, to, spacing } = band!;

      const pageCount = Math.ceil(
        (Math.floor((to - from) / spacing) + 1) / limit
      );

      const start = from + offset * spacing;
      const _end = from + (offset + limit - 1) * spacing;
      const end = _end > to ? to : _end;

      const frequencies = await db.frequency.findMany({
        where: { value: { gte: start, lte: end } },
      });

      const frequencies_map = new Map<number, Frequency>();
      frequencies.forEach((f) => frequencies_map.set(f.value, f));

      const f = new Intl.DateTimeFormat('en-uk', {
        dateStyle: 'short',
        timeStyle: 'short',
        timeZone: 'Asia/Kolkata',
      });

      const table_rows = [];
      for (let i = start; i <= end; i += spacing) {
        if (frequencies_map.has(i)) {
          const frequency = frequencies_map.get(i)!;
          table_rows.push({
            frequency: frequency.value,
            emailAddress: frequency.email,
            location: `${frequency.latitude}, ${frequency.longitude}`,
            createdAt: f.format(frequency.createdAt),
          });
        } else {
          table_rows.push({
            frequency: i,
            emailAddress: 'N/A',
            location: 'N/A',
            createdAt: 'N/A',
          });
        }
      }

      return { table_rows, pageCount, from, to, spacing };
    }
  );

  return (
    <>
      <Navbar />
      <Wrapper>
        <div className='mb-2 mt-10 flex flex-col items-center gap-4 px-2 py-1 sm:flex-row sm:gap-6 lg:gap-8'>
          <Link
            href='/frequencies'
            className={cn(buttonVariants({ variant: 'outline' }), 'flex gap-2')}
          >
            <FunctionSquare className='h-4 w-4' /> Your frequencies
          </Link>
          <UserLocation />
        </div>
        <div className='my-4'>
          <SearchFrequency
            perPage={perPageAsNumber}
            from={from}
            to={to}
            spacing={spacing}
          />
        </div>
        <div className='my-4 flex flex-col items-center gap-4 px-2 py-1 sm:flex-row sm:gap-6 lg:gap-8'>
          <RangeAllocate
            from={from}
            to={to}
            spacing={spacing}
            userId={user.id}
            email={email}
          />
          <RangeDelete
            from={from}
            to={to}
            spacing={spacing}
            userId={user.id}
            email={email}
          />
          <RangeAllocateFirstN
            from={from}
            to={to}
            spacing={spacing}
            userId={user.id}
            email={email}
          />
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Frequency</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Location (Latitude, Longitude)</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className='text-right'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          {table_rows.length === 0 ? (
            <TableCaption>No results.</TableCaption>
          ) : (
            <>
              <TableCaption>A list of available frequencies.</TableCaption>
              <TableBody>
                {table_rows.map((row) => (
                  <TableRow key={row.frequency}>
                    <TableCell className='font-medium'>
                      <RedirectButton value={row.frequency} />
                    </TableCell>
                    <TableCell>{row.emailAddress}</TableCell>
                    <TableCell>{row.location}</TableCell>
                    <TableCell>{row.createdAt}</TableCell>
                    <TableCell className='text-right'>
                      {row.emailAddress !== 'N/A' &&
                      row.emailAddress !== email ? (
                        <div className='inline-flex h-9 w-24 items-center justify-center rounded-md bg-[hsl(359,_100%,_97%)] px-3 text-sm font-medium text-[hsl(360,_100%,_45%)] ring-offset-background'>
                          Unavaliable
                        </div>
                      ) : (
                        <FrequencyAction
                          frequency={row.frequency}
                          userId={user.id}
                          email={email}
                          emailAddress={row.emailAddress}
                        />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </>
          )}
        </Table>
        <div className='mb-10 mt-2'>
          <TablePagination
            pageNumber={fallbackPage}
            perPage={limit}
            pageCount={pageCount}
          />
        </div>
      </Wrapper>
    </>
  );
};

export default Page;
