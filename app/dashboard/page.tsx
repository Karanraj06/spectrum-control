import { currentUser } from '@clerk/nextjs';

import { db } from '@/lib/db';
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
        {user?.publicMetadata?.role === 'admin' && <AddButton />}
        <Table>
          <TableCaption>A list of available bands.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Serial Number</TableHead>
              <TableHead>Frequency Range (From)</TableHead>
              <TableHead>Frequency Range (To)</TableHead>
              <TableHead>Channel Spacing</TableHead>
              <TableHead className='text-right'></TableHead>
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
                  <MenuItem />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Wrapper>
    </>
  );
}
