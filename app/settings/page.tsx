import GoBack from '@/components/go-back';
import UserNav from '@/components/user-nav';
import Wrapper from '@/components/wrapper';

import ProfileForm from './components/profile-form';

export default function Page() {
  return (
    <>
      <UserNav />
      <Wrapper>
        <div className='mt-10 px-2'>
          <GoBack />
        </div>
        <p className='mb-2 mt-10 px-2 py-1 text-center font-medium'>
          Update Personal Information
        </p>
        <ProfileForm />
      </Wrapper>
    </>
  );
}
