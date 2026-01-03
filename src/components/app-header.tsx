'use client';

import { useEffect, useState } from 'react';
import { LogOut, Recycle, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from './ui/button';
import { useAuth, useUser, initiateAnonymousSignIn, setDocumentNonBlocking } from '@/firebase';
import { doc, getDoc, serverTimestamp } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import AuthForm from './auth-form';
import { signOut } from 'firebase/auth';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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
            displayName: user.displayName ?? user.email?.split('@')[0] ?? 'Anonymous',
            points: 0,
            createdAt: serverTimestamp(),
          };
          setDocumentNonBlocking(userRef, newUser, { merge: true });
        }
      })
    }
  }, [user, firestore]);

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
            {user && !user.isAnonymous ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-9 w-9">
                      {user.photoURL && <AvatarImage src={user.photoURL} alt="User Avatar" /> }
                      <AvatarFallback>
                        {user.displayName ? user.displayName.charAt(0).toUpperCase() : <User />}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.displayName}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={() => setAuthModalOpen(true)}>Login</Button>
            )}
          </div>
        </div>
      </header>
       <Dialog open={isAuthModalOpen} onOpenChange={setAuthModalOpen}>
        <DialogContent className="p-0">
          <DialogHeader>
            <VisuallyHidden>
              <DialogTitle>Authentication</DialogTitle>
              <DialogDescription>
                Log in or sign up to your EcoSnap Sort account.
              </DialogDescription>
            </VisuallyHidden>
          </DialogHeader>
          <AuthForm onLoginSuccess={() => setAuthModalOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}
