import { FC } from 'react';
import { notFound } from 'next/navigation';

import { db } from '@/lib/db';
import { searchParamsSchema } from '@/lib/validations/params';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Navbar from '@/components/nav';
import TablePagination from '@/components/table-pagination';
import Wrapper from '@/components/wrapper';

interface PageProps {
  params: { value: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

const Page: FC<PageProps> = async ({ params, searchParams }) => {
  const value = Number(params.value);

  if (isNaN(value)) {
    notFound();
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

  const { rows, pageCount } = await db.$transaction(async (db) => {
    const total_rows = await db.frequencyLocation.count({ where: { value } });

    const pageCount = Math.ceil(total_rows / limit);

    const rows = await db.frequencyLocation.findMany({
      where: { value },
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit,
    });

    return { rows, pageCount };
  });

  return (
    <>
      <Navbar />
      <Wrapper>
        <p className='mb-2 mt-10 px-2 py-1 text-center font-medium'>
          Allocation data for {value / 1000000} MHz
        </p>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Location (Latitude, Longitude)</TableHead>
              <TableHead>Created At</TableHead>
            </TableRow>
          </TableHeader>
          {rows.length === 0 ? (
            <TableCaption>No results.</TableCaption>
          ) : (
            <>
              <TableCaption>Allocation history.</TableCaption>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.value}>
                    <TableCell>{row.email}</TableCell>
                    <TableCell>{`${row.latitude}, ${row.longitude}`}</TableCell>
                    <TableCell>{f.format(row.createdAt)}</TableCell>
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
