'use client';

import { Check, Info, Map, MapPin, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { getBinDetails, type BinColor } from './bin-details';
import type { IdentifyWasteAndRecommendBinOutput } from '@/ai/flows/identify-waste-and-recommend-bin';
import { ScrollArea } from './ui/scroll-area';
import CampusMap from './campus-map'; // Import the new map component

interface WasteWiseProps {
  result: IdentifyWasteAndRecommendBinOutput | null;
}

const binInfo: Record<BinColor, { description: string; accepted: string[]; notAccepted: string[] }> = {
  Green: {
    description: "For compostable, organic materials. These items are turned into nutrient-rich soil.",
    accepted: ["Fruit & Vegetable Scraps", "Coffee Grounds & Filters", "Eggshells", "Yard Trimmings", "Grass Cuttings"],
    notAccepted: ["Plastic Bags", "Food-soiled Paper", "Pet Waste", "Diapers", "Liquids or Grease"],
  },
  Blue: {
    description: "For clean and dry recyclable materials. These items are processed and made into new products.",
    accepted: ["Plastic Bottles & Jugs (#1, #2)", "Glass Jars & Bottles", "Aluminum & Tin Cans", "Paper & Cardboard"],
    notAccepted: ["Plastic Bags or Film", "Food Waste", "Styrofoam", "Electronics", "Ceramics"],
  },
  Red: {
    description: "For items that cannot be recycled or composted. This waste goes to the landfill.",
    accepted: ["Plastic Bags & Film", "Styrofoam", "Snack Wrappers", "Broken Ceramics", "Diapers"],
    notAccepted: ["Recyclables", "Organics", "Hazardous Waste", "Electronics", "Batteries"],
  },
};

export default function WasteWise({ result }: WasteWiseProps) {
  const details = result ? getBinDetails(result.binColor) : getBinDetails('Blue'); // Default to Blue
  const info = result ? binInfo[result.binColor] : binInfo.Blue;
  
  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-3">
          <Info className="h-6 w-6 text-primary" />
          Waste Wise Guide
        </CardTitle>
        <CardDescription>
          {result ? `Learn more about the ${details.label} bin.` : "Learn about proper waste disposal and find drop-off points."}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col min-h-0">
        <ScrollArea className="flex-1 -mx-6">
          <div className="px-6">
            <div className={`p-4 rounded-lg ${details.bgColorClass} mb-4`}>
              <h3 className={`font-headline text-lg flex items-center gap-2 ${details.colorClass}`}>
                {details.Icon && <details.Icon className="h-5 w-5" />}
                The {details.label} Bin
              </h3>
              <p className="text-sm text-muted-foreground">{info.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <h4 className="font-semibold text-green-600 mb-2">Accepted</h4>
                <ul className="space-y-1">
                  {info.accepted.map(item => (
                    <li key={item} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 mt-0.5 text-green-600 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-red-600 mb-2">Not Accepted</h4>
                <ul className="space-y-1">
                  {info.notAccepted.map(item => (
                    <li key={item} className="flex items-start gap-2 text-sm">
                      <X className="h-4 w-4 mt-0.5 text-red-600 shrink-0" />
                       <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div>
              <h3 className="font-headline text-lg flex items-center gap-2 mb-2">
                <Map className="h-5 w-5 text-primary" />
                Campus Recycling Map
              </h3>
               <div className="relative h-80 w-full rounded-lg overflow-hidden border">
                  <CampusMap />
               </div>
            </div>

            {!result && (
              <div className="mt-8 text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg">
                <p>Scan an item to get specific guidance for that item.</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
