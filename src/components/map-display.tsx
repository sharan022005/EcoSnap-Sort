'use client';

import Image from 'next/image';
import { MapPin } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { cn } from '@/lib/utils';

type Location = {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
};

interface MapDisplayProps {
  locations: Location[];
}

// Define the bounding box for the map coordinates
const bounds = {
  minLat: 34.045,
  maxLat: 34.065,
  minLng: -118.255,
  maxLng: -118.235,
};

// Function to convert lat/lng to percentage-based x/y coordinates
const getCoordinates = (lat: number, lng: number) => {
  const x = ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * 100;
  const y = ((bounds.maxLat - lat) / (bounds.maxLat - bounds.minLat)) * 100;
  return { x, y };
};

export default function MapDisplay({ locations }: MapDisplayProps) {
  return (
    <TooltipProvider>
      <div className="relative w-full h-full">
        <Image
          src="https://picsum.photos/seed/map/800/600"
          alt="Map of recycling centers"
          layout="fill"
          objectFit="cover"
          data-ai-hint="city map"
          className="grayscale"
        />
        <div className="absolute inset-0 bg-black/10" />

        {locations.map((location) => {
          const { x, y } = getCoordinates(location.lat, location.lng);
          const outOfBounds = x < 0 || x > 100 || y < 0 || y > 100;

          return (
            <Tooltip key={location.id}>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    "absolute -translate-x-1/2 -translate-y-full transition-transform duration-300 hover:scale-110",
                     outOfBounds && "hidden"
                  )}
                  style={{ left: `${x}%`, top: `${y}%` }}
                >
                  <MapPin className="h-8 w-8 text-primary fill-current drop-shadow-lg" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-bold">{location.name}</p>
                <p>{location.address}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
