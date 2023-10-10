import { MoreHorizontal } from 'lucide-react';

import { db } from '@/lib/db';
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
import AddButton from '@/components/add-button';
import UserNav from '@/components/user-nav';
import Wrapper from '@/components/wrapper';

export default async function Page() {
  const bands = await db.band.findMany();

  return (
    <>
      <UserNav />
      <Wrapper>
        <AddButton />
        <Table>
          <TableCaption>A list of available bands.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Serial Number</TableHead>
              <TableHead>Frequency Range (From)</TableHead>
              <TableHead>Frequency Range (To)</TableHead>
              <TableHead>Channel Spacing</TableHead>
              <TableHead className='text-right'>Generate Frequencies</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bands.map((band, idx) => (
              <TableRow key={band.id}>
                <TableCell className='font-medium'>{idx + 1}</TableCell>
                <TableCell>{band.from} Hz</TableCell>
                <TableCell>{band.to} Hz</TableCell>
                <TableCell>{band.spacing} Hz</TableCell>
                <TableCell className='text-right'>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='hover:bg-neutral-200'
                  >
                    <MoreHorizontal className='h-4 w-4 stroke-gray-700' />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Wrapper>
    </>
  );
}
