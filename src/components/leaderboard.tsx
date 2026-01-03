'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Trophy } from 'lucide-react';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ScrollArea } from './ui/scroll-area';
import { SheetHeader, SheetTitle } from './ui/sheet';

interface UserProfile {
  id: string;
  displayName: string;
  points: number;
  photoURL?: string;
  avatarId?: string;
}

export default function Leaderboard() {
  const firestore = useFirestore();
  const { user } = useUser();

  const leaderboardQuery = useMemoFirebase(
    () =>
      firestore
        ? query(
            collection(firestore, 'users'),
            orderBy('points', 'desc'),
            limit(10)
          )
        : null,
    [firestore]
  );

  const { data: leaderboardData, isLoading } = useCollection<UserProfile>(
    leaderboardQuery
  );

  return (
    <>
      <SheetHeader className="mb-4">
        <SheetTitle className="flex items-center gap-3 font-headline">
          <Trophy className="h-6 w-6 text-primary" />
          Top Eco-Warriors
        </SheetTitle>
      </SheetHeader>
      <ScrollArea className="h-full">
        {isLoading && !leaderboardData ? (
          <p>Loading leaderboard...</p>
        ) : !user ? (
          <p>Please log in to see the leaderboard.</p>
        ) : (
          <ul className="space-y-4 pr-4">
            {leaderboardData?.map((profile, index) => {
               const avatar = PlaceHolderImages.find(
                (img) => img.id === profile.avatarId || 'avatar-' + ((index % 10) + 1)
              );
              return (
                <li key={profile.id} className="flex items-center gap-4 p-2 rounded-lg hover:bg-muted/50">
                  <Badge
                    variant="outline"
                    className="w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold"
                  >
                    {index + 1}
                  </Badge>
                  <Avatar>
                    {profile.photoURL ? (
                      <AvatarImage src={profile.photoURL} alt={profile.displayName}/>
                    ) : avatar ? (
                       <AvatarImage
                        src={avatar.imageUrl}
                        alt={profile.displayName}
                        data-ai-hint={avatar.imageHint}
                      />
                    ) : null}
                    <AvatarFallback>{profile.displayName?.charAt(0)}</Fallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{profile.displayName || 'Anonymous'}</p>
                    <p className="text-sm text-muted-foreground">{profile.points} points</p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </ScrollArea>
    </>
  );
}
