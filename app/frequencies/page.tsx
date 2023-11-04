import { FC } from 'react';
import { currentUser } from '@clerk/nextjs';
import { Delete, PlusCircle } from 'lucide-react';

import { db } from '@/lib/db';
import { searchParamsSchema } from '@/lib/validations/params';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import DeleteAllButton from '@/components/delete-all-button';
import Navbar from '@/components/nav';
import TablePagination from '@/components/table-pagination';
import UnacquireButton from '@/components/unacquire-button';
import Wrapper from '@/components/wrapper';

interface PageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

const Page: FC<PageProps> = async ({ searchParams }) => {
  const user = await currentUser();

  if (!user) {
    return null;
  }

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

  const f = new Intl.DateTimeFormat('en-uk', {
    dateStyle: 'short',
    timeStyle: 'short',
  });

  const { frequencies, pageCount } = await db.$transaction(async (db) => {
    const total_frequencies = await db.frequency.count({
      where: { userId: user.id },
    });

    const frequencies = await db.frequency.findMany({
      where: { userId: user.id },
      orderBy: { value: 'asc' },
      skip: offset,
      take: limit,
    });

    const pageCount = Math.ceil(total_frequencies / limit);

    return { frequencies, pageCount };
  });

  return (
    <>
      <Navbar />
      <Wrapper>
        <div className='mb-2 mt-10 px-2 py-1'>
          <DeleteAllButton />
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Frequency</TableHead>
              <TableHead>Location (Latitude, Longitude)</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className='text-right'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          {frequencies.length === 0 ? (
            <TableCaption>No results.</TableCaption>
          ) : (
            <>
              <TableCaption>A list of your frequencies.</TableCaption>
              <TableBody>
                {frequencies.map((frequency) => (
                  <TableRow key={frequency.value}>
                    <TableCell className='font-medium'>
                      {frequency.value / 1000000} MHz
                    </TableCell>
                    <TableCell>{`${frequency.latitude}, ${frequency.longitude}`}</TableCell>
                    <TableCell>{f.format(frequency.createdAt)}</TableCell>
                    <TableCell className='text-right'>
                      <UnacquireButton frequency={frequency.value} />
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
            perPage={perPageAsNumber}
            pageCount={pageCount}
          />
        </div>
      </Wrapper>
    </>
  );
};

export default Page;
