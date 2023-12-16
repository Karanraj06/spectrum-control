import { FC } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { clerkClient, currentUser } from '@clerk/nextjs';

import { buttonVariants } from '@/components/ui/button';
import GoBack from '@/components/go-back';
import UserNav from '@/components/user-nav';
import Wrapper from '@/components/wrapper';

interface PageProps {
  params: { userId: string };
}

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

const Page: FC<PageProps> = async ({ params }) => {
  const user = await clerkClient.users.getUser(params.userId);
  const current_user = await currentUser();

  if (!user || !current_user) {
    notFound();
  }

  const email =
    user.emailAddresses.find((email) => email.id === user.primaryEmailAddressId)
      ?.emailAddress || 'N/A';

  return (
    <>
      <UserNav />
      <Wrapper>
        <div className='mt-10 px-2'>
          <GoBack />
        </div>
        <p className='mb-2 mt-10 px-2 py-1 text-center font-medium'>
          Personal Information
        </p>
        <div className='mx-auto max-w-2xl flex-col space-y-8 px-6 py-10'>
          <div>
            <span className='font-bold'>Firstname: </span>
            {user.firstName}
          </div>
          <div>
            <span className='font-bold'>Lastname: </span>
            {user.lastName}
          </div>
          <div>
            <span className='font-bold'>Email: </span>
            {email}
          </div>
          <div>
            <span className='font-bold'>Phone number: </span>
            {user.unsafeMetadata?.phoneNumber as string}
          </div>
          <div>
            <span className='font-bold'>Designation: </span>
            {user.unsafeMetadata?.designation as string}
          </div>
          <div>
            <span className='font-bold'>Username / Appointment: </span>
            {user.unsafeMetadata?.username as string}
          </div>
          <div>
            <span className='font-bold'>Formation / Headquarters: </span>
            {user.unsafeMetadata?.headquarter as string}
          </div>
          {user.id === current_user.id && (
            <Link
              className={buttonVariants({
                className: 'mt-5',
              })}
              href='/settings'
            >
              Update profile
            </Link>
          )}
        </div>
      </Wrapper>
    </>
  );
};

export default Page;
