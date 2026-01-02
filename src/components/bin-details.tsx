import { Leaf, Recycle, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { IdentifyWasteAndRecommendBinOutput } from '@/ai/flows/identify-waste-and-recommend-bin';

export type BinColor = IdentifyWasteAndRecommendBinOutput['binColor'];

const binDetails: Record<
  BinColor,
  { Icon: React.ElementType; colorClass: string; label: string, bgColorClass: string }
> = {
  Green: { Icon: Leaf, colorClass: 'text-bin-green', bgColorClass: 'bg-bin-green/10', label: 'Organic' },
  Blue: { Icon: Recycle, colorClass: 'text-bin-blue', bgColorClass: 'bg-bin-blue/10', label: 'Recycling' },
  Red: { Icon: Trash2, colorClass: 'text-bin-red', bgColorClass: 'bg-bin-red/10', label: 'Landfill' },
};

const defaultDetails = binDetails.Red;

export function BinIcon({ binColor, className }: { binColor: BinColor | undefined; className?: string }) {
  const { Icon, colorClass } = binColor ? (binDetails[binColor] ?? defaultDetails) : defaultDetails;
  return <Icon className={cn('h-16 w-16', colorClass, className)} />;
}

export function getBinDetails(binColor: BinColor | undefined) {
    return binColor ? (binDetails[binColor] ?? defaultDetails) : defaultDetails;
}
