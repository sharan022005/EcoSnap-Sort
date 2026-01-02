import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
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

const leaderboardData = [
  { name: 'EcoWarrior', score: 1250, avatarId: 'avatar-1' },
  { name: 'RecycleQueen', score: 1180, avatarId: 'avatar-2' },
  { name: 'GreenThumb', score: 1120, avatarId: 'avatar-3' },
  { name: 'SortMaster', score: 1050, avatarId: 'avatar-4' },
  { name: 'PlanetSaver', score: 980, avatarId: 'avatar-5' },
  { name: 'WasteWizard', score: 920, avatarId: 'avatar-6' },
  { name: 'CaptainPlanet', score: 850, avatarId: 'avatar-7' },
  { name: 'EnviroChamp', score: 780, avatarId: 'avatar-8' },
  { name: 'EcoHero', score: 710, avatarId: 'avatar-9' },
  { name: 'NatureNinja', score: 650, avatarId: 'avatar-10' },
];

export default function Leaderboard() {
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
        <ul className="space-y-4">
          {leaderboardData.map((user, index) => {
            const avatar = PlaceHolderImages.find(
              (img) => img.id === user.avatarId
            );
            return (
              <li key={user.name} className="flex items-center gap-4">
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
                      alt={user.name}
                      data-ai-hint={avatar.imageHint}
                    />
                  )}
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{user.name}</p>
                  <p className="text-sm text-muted-foreground">{user.score} points</p>
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
