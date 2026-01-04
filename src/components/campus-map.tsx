'use client';

import React from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
} from '@vis.gl/react-google-maps';
import { useState } from 'react';
import { Card } from './ui/card';

const locations = [
  {
    key: 'main',
    position: { lat: 12.9716, lng: 77.5946 },
    label: 'Main Recycling Center',
    details: 'Paper, Plastic, Glass',
  },
  {
    key: 'ewaste',
    position: { lat: 12.973, lng: 77.592 },
    label: 'E-Waste Drop-off',
    details: 'Batteries, Phones, Laptops',
  },
  {
    key: 'organic',
    position: { lat: 12.969, lng: 77.598 },
    label: 'Organic Compost Pit',
    details: 'Food scraps, Yard waste',
  },
];

export default function CampusMap() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const position = { lat: 12.9716, lng: 77.5946 };
  const [openMarker, setOpenMarker] = useState<string | null>(null);

  // If the API key is not available, do not attempt to render the map.
  // Instead, show a clear error message. This prevents the InvalidKeyMapError.
  if (!apiKey) {
    return (
      <div className="flex h-full items-center justify-center bg-muted rounded-lg">
        <div className="text-center p-4">
          <p className="font-semibold text-foreground">Google Maps API Key is Missing</p>
          <p className="text-sm text-muted-foreground mt-2">
            Please add your key to a <code className="bg-primary/10 text-primary p-1 rounded-sm">.env.local</code> file as <code className="bg-primary/10 text-primary p-1 rounded-sm">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> and restart the development server.
          </p>
        </div>
      </div>
    );
  }

  return (
    <APIProvider apiKey={apiKey}>
      <div className="w-full h-full">
        <Map
          defaultCenter={position}
          defaultZoom={15}
          mapId="eco-sort-map"
          gestureHandling={'greedy'}
          disableDefaultUI={true}
        >
          {locations.map(location => (
            <AdvancedMarker
              key={location.key}
              position={location.position}
              onClick={() => setOpenMarker(location.key === openMarker ? null : location.key)}
            >
              <Pin
                background={'hsl(var(--primary))'}
                borderColor={'hsl(var(--primary))'}
                glyphColor={'hsl(var(--primary-foreground))'}
              />
              {openMarker === location.key && (
                <InfoWindow
                  position={location.position}
                  onCloseClick={() => setOpenMarker(null)}
                >
                  <Card className="border-none shadow-none p-2">
                    <p className="font-bold">{location.label}</p>
                    <p className="text-sm text-muted-foreground">{location.details}</p>
                  </Card>
                </InfoWindow>
              )}
            </AdvancedMarker>
          ))}
        </Map>
      </div>
    </APIProvider>
  );
}
