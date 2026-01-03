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

interface UserProfile {
  id: string;
  displayName: string;
  points: number;
  avatarId?: string;
}

export default function Leaderboard() {
  const firestore = useFirestore();
  const { user } = useUser();

  const leaderboardQuery = useMemoFirebase(
    () =>
      firestore && user
        ? query(
            collection(firestore, 'users'),
            orderBy('points', 'desc'),
            limit(10)
          )
        : null,
    [firestore, user]
  );

  const { data: leaderboardData, isLoading } = useCollection<UserProfile>(
    leaderboardQuery
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Trophy className="h-6 w-6 text-primary" />
          <CardTitle className="font-headline">Top Eco-Warriors</CardTitle>
        </div>
        <CardDescription>See who's leading the charge in recycling!</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && !leaderboardData ? (
          <p>Loading leaderboard...</p>
        ) : !user ? (
          <p>Please log in to see the leaderboard.</p>
        ) : (
          <ul className="space-y-4">
            {leaderboardData?.map((user, index) => {
              const avatar = PlaceHolderImages.find(
                (img) => img.id === user.avatarId || 'avatar-' + ((index % 10) + 1)
              );
              return (
                <li key={user.id} className="flex items-center gap-4">
                  <Badge
                    variant="outline"
                    className="w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold"
                  >
                    {index + 1}
                  </Badge>
                  <Avatar>
                    {avatar && (
                      <AvatarImage
                        src={avatar.imageUrl}
                        alt={user.displayName}
                        data-ai-hint={avatar.imageHint}
                      />
                    )}
                    <AvatarFallback>{user.displayName?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{user.displayName || 'Anonymous'}</p>
                    <p className="text-sm text-muted-foreground">{user.points} points</p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
