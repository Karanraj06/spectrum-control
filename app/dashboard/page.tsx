import Link from 'next/link';
import { currentUser } from '@clerk/nextjs';
import { FunctionSquare } from 'lucide-react';

import { db } from '@/lib/db';
import { cn } from '@/lib/utils';
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
import AddButton from '@/components/add-button';
import MenuItem from '@/components/menu-item';
import UserNav from '@/components/user-nav';
import Wrapper from '@/components/wrapper';

export default async function Page() {
  const user = await currentUser();

  if (!user) {
    return null;
  }

  const bands = await db.band.findMany();

  return (
    <>
      <UserNav />
      <Wrapper>
        <div className='mb-2 mt-10 flex flex-col items-center gap-4 sm:flex-row sm:gap-6 lg:gap-8'>
          <Link
            href='/frequencies'
            className={cn(buttonVariants({ variant: 'outline' }), 'flex gap-2')}
          >
            <FunctionSquare className='h-4 w-4' /> Your frequencies
          </Link>
          {user?.publicMetadata?.role === 'admin' && <AddButton />}
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Serial Number</TableHead>
              <TableHead>Band Name</TableHead>
              <TableHead>Frequency Range (From)</TableHead>
              <TableHead>Frequency Range (To)</TableHead>
              <TableHead>Channel Spacing</TableHead>
              <TableHead className='text-right'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          {bands.length === 0 ? (
            <TableCaption>There are no bands to show.</TableCaption>
          ) : (
            <>
              <TableCaption>A list of available bands.</TableCaption>
              <TableBody>
                {bands.map((band, idx) => (
                  <TableRow key={band.id}>
                    <TableCell className='font-medium'>{idx + 1}</TableCell>
                    <TableCell>{band.name}</TableCell>
                    <TableCell>{band.from / 1000000} MHz</TableCell>
                    <TableCell>{band.to / 1000000} MHz</TableCell>
                    <TableCell>{band.spacing / 1000} kHz</TableCell>
                    <TableCell className='text-right'>
                      <MenuItem
                        id={band.id}
                        from={band.from}
                        to={band.to}
                        spacing={band.spacing}
                        name={band.name}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>{' '}
            </>
          )}
        </Table>
      </Wrapper>
    </>
  );
}
