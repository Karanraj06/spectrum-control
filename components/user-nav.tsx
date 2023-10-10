import Link from 'next/link';
import { auth, UserButton } from '@clerk/nextjs';
import { ArrowRight } from 'lucide-react';

import { buttonVariants } from '@/components/ui/button';
import Wrapper from '@/components/wrapper';

export default function UserNav() {
  const { userId } = auth();

  if (!userId) {
    return null;
  }

  return (
    <nav className='sticky inset-x-0 top-0 z-30 h-14 w-full border-b border-gray-200 bg-white/75 backdrop-blur-lg transition-all'>
      <Wrapper>
        <div className='flex h-14 items-center justify-between border-b border-zinc-200'>
          <Link href='/' className='z-40 flex font-semibold'>
            <span>spectrum-control</span>
          </Link>
          <div className='hidden items-center space-x-4 sm:flex'>
            <Link
              href='/'
              className={buttonVariants({
                variant: 'ghost',
                size: 'sm',
              })}
            >
              Documentation
            </Link>
            <UserButton afterSignOutUrl='/' />
          </div>
        </div>
      </Wrapper>
    </nav>
  );
}
