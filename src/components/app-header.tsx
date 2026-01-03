'use client';

import { useEffect, useState } from 'react';
import { LogOut, Recycle, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from './ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useAuth, useUser, initiateAnonymousSignIn, setDocumentNonBlocking } from '@/firebase';
import { doc, getDoc, serverTimestamp } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Dialog, DialogContent } from './ui/dialog';
import AuthForm from './auth-form';
import { signOut } from 'firebase/auth';

export default function AppHeader() {
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    if (!isUserLoading && !user) {
      initiateAnonymousSignIn(auth);
    }
  }, [user, isUserLoading, auth]);

  useEffect(() => {
    if (user) {
      const userRef = doc(firestore, 'users', user.uid);
      getDoc(userRef).then(docSnap => {
        if (!docSnap.exists()) {
           const newUser = {
            id: user.uid,
            email: user.email ?? '',
            displayName: user.displayName ?? 'Anonymous',
            points: 0,
            createdAt: serverTimestamp(),
          };
          setDocumentNonBlocking(userRef, newUser, { merge: true });
        }
      })
    }
  }, [user, firestore]);

  const userAvatar = PlaceHolderImages.find(img => img.id === 'avatar-1');

  const handleLogout = async () => {
    await signOut(auth);
  };
  
  return (
    <>
      <header className="border-b bg-card">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Recycle className="h-7 w-7 text-primary" />
            <h1 className="font-headline text-xl font-bold tracking-tight text-foreground">
              EcoSnap Sort
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Avatar className="h-9 w-9">
                  {user.photoURL ? <AvatarImage src={user.photoURL} alt="User Avatar" /> : 
                    (userAvatar && <AvatarImage src={userAvatar.imageUrl} alt="User Avatar" data-ai-hint={userAvatar.imageHint} />)
                  }
                  <AvatarFallback>
                    {user.displayName ? user.displayName.charAt(0) : <User />}
                  </AvatarFallback>
                </Avatar>
                 <Button onClick={handleLogout} size="sm" variant="outline">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </>
            ) : (
              <Button onClick={() => setAuthModalOpen(true)}>Login</Button>
            )}
          </div>
        </div>
      </header>
       <Dialog open={isAuthModalOpen} onOpenChange={setAuthModalOpen}>
        <DialogContent className="p-0 bg-transparent border-none">
          <AuthForm onLoginSuccess={() => setAuthModalOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}
