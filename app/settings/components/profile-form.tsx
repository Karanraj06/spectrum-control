'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const profileFormSchema = z.object({
  phoneNumber: z.string().min(10).max(10),
  designation: z.string(),
  username: z.string(),
  headquarter: z.string(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ProfileForm() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();
  const { user } = useUser();

  const defaultValues: Partial<ProfileFormValues> = {
    phoneNumber: user?.unsafeMetadata?.phoneNumber as string,
    designation: user?.unsafeMetadata?.designation as string,
    username: user?.unsafeMetadata?.username as string,
    headquarter: user?.unsafeMetadata?.headquarter as string,
  };

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
    mode: 'onChange',
  });

  async function updateUser(data: ProfileFormValues) {
    setIsLoading(true);
    try {
      await user?.update({
        unsafeMetadata: {
          ...data,
        },
      });

      toast.success('Profile updated successfully');
      router.refresh();
    } catch (error) {
      console.log(error);
      toast.error('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  }

  if (!user) {
    return null;
  }

  return (
    <div className='mx-auto max-w-2xl px-6 py-20'>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(updateUser)} className='space-y-8'>
          <FormField
            control={form.control}
            name='phoneNumber'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone number</FormLabel>
                <FormControl>
                  <Input placeholder='Your phone number' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='designation'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Designation</FormLabel>
                <FormControl>
                  <Input placeholder='Your designation' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='username'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username / Appointment</FormLabel>
                <FormControl>
                  <Input placeholder='Username' {...field} />
                </FormControl>
                <FormDescription>
                  This is your public display name.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='headquarter'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Formation / Headquarters</FormLabel>
                <FormControl>
                  <Input placeholder='Headquarters' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type='submit' className='w-20' disabled={isLoading}>
            {isLoading ? (
              <Loader2 className='h-6 w-6 animate-spin text-zinc-500' />
            ) : (
              'Update'
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
