'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { Loader2, User as UserIcon } from 'lucide-react';
import { updateProfile } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';

interface ProfileEditorProps {
  onFinished: () => void;
}

const profileSchema = z.object({
  displayName: z.string().min(2, 'Name must be at least 2 characters.'),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfileEditor({ onFinished }: ProfileEditorProps) {
  const { user, isUserLoading, firestore, auth } = useFirebase();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: '',
    },
  });
  
  useEffect(() => {
    if (user) {
      setValue('displayName', user.displayName || '');
    }
  }, [user, setValue]);

  const onSubmit = async (data: ProfileFormValues) => {
    if (!user || !auth.currentUser || !firestore) return;

    setLoading(true);

    try {
      if (data.displayName !== user.displayName) {
        await updateProfile(auth.currentUser, { displayName: data.displayName });
        const userDocRef = doc(firestore, 'users', user.uid);
        await updateDoc(userDocRef, { displayName: data.displayName });
      }

      toast({
        title: 'Profile Updated',
        description: 'Your changes have been saved.',
      });
      onFinished();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };
  
  if (isUserLoading) {
    return (
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <div className="flex items-center justify-center h-48">
          <Loader2 className="animate-spin text-primary" />
        </div>
      </DialogContent>
    )
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogDescription>
          Make changes to your profile here. Click save when you're done.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex flex-col items-center gap-4">
          <Avatar className="h-24 w-24">
            <AvatarImage src={user?.photoURL || undefined} alt="User avatar" />
            <AvatarFallback className="text-3xl">
              {user?.displayName ? (
                user.displayName.charAt(0).toUpperCase()
              ) : (
                <UserIcon />
              )}
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="space-y-2">
          <Label htmlFor="displayName">Display Name</Label>
          <Input
            id="displayName"
            {...register('displayName')}
          />
          {errors.displayName && (
            <p className="text-sm text-destructive">{errors.displayName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Email</Label>
          <Input value={user?.email || ''} disabled />
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
