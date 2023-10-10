import { SignUp } from '@clerk/nextjs';

export default function Page() {
  return (
    <div className='flex h-screen w-screen items-center justify-center bg-[url("/signin-bg.svg")] bg-cover'>
      <SignUp />
    </div>
  );
}
