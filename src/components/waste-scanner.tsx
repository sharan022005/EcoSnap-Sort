"use client";

import { useState, useRef, useTransition } from 'react';
import Image from 'next/image';
import { Camera, Image as ImageIcon, Loader2, Sparkles, X } from 'lucide-react';

import { analyzeWasteImage } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from './ui/badge';
import { BinIcon, getBinDetails, type BinColor } from './bin-details';
import type { IdentifyWasteAndRecommendBinOutput } from '@/ai/flows/identify-waste-and-recommend-bin';

export default function WasteScanner() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [result, setResult] = useState<IdentifyWasteAndRecommendBinOutput | null>(null);
  const [points, setPoints] = useState(0);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = () => {
    if (!imageFile) return;

    const formData = new FormData();
    formData.append('image', imageFile);

    startTransition(async () => {
      const response = await analyzeWasteImage(formData);
      if (response.success) {
        setResult(response.data);
        setPoints((prev) => prev + 10);
      } else {
        toast({
          variant: 'destructive',
          title: 'Analysis Failed',
          description: response.error,
        });
      }
    });
  };

  const handleReset = () => {
    setImagePreview(null);
    setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const resultDetails = result ? getBinDetails(result.binColor) : null;

  return (
    <>
      <Card className="w-full relative overflow-hidden">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Scan Your Waste</CardTitle>
          <CardDescription>
            Take or upload a picture of a waste item to find out the correct bin.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-4">
            <div
              className="relative flex h-64 w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/50 transition-colors hover:border-primary hover:bg-primary/5"
              onClick={() => fileInputRef.current?.click()}
            >
              {imagePreview ? (
                <>
                  <Image
                    src={imagePreview}
                    alt="Waste preview"
                    fill
                    className="object-contain rounded-lg p-2"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 z-10 h-8 w-8 rounded-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReset();
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <div className="text-center text-muted-foreground">
                  <Camera className="mx-auto h-12 w-12" />
                  <p>Click to upload or take a photo</p>
                </div>
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
                capture="environment"
              />
            </div>

            {imagePreview ? (
              <Button onClick={handleAnalyze} disabled={isPending} className="w-full" size="lg">
                {isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Analyze Waste
              </Button>
            ) : (
                <Button onClick={() => fileInputRef.current?.click()} className="w-full" size="lg" variant="secondary">
                    <ImageIcon className="mr-2 h-4 w-4" />
                    Choose Image
                </Button>
            )}
          </div>
        </CardContent>
        <div className="absolute top-4 right-4">
            <Badge variant="secondary" className="text-lg">
              Points: {points}
            </Badge>
        </div>
      </Card>

      <Dialog open={!!result} onOpenChange={(open) => !open && setResult(null)}>
        <DialogContent className="sm:max-w-md">
            {resultDetails && (
                 <>
                    <DialogHeader className="items-center text-center">
                        <div className={`p-4 rounded-full ${resultDetails.bgColorClass} mb-4`}>
                            <BinIcon binColor={result.binColor} />
                        </div>
                        <DialogTitle className="text-3xl font-headline">
                        Put it in the <span className={resultDetails.colorClass}>{resultDetails.label}</span> bin!
                        </DialogTitle>
                    </DialogHeader>
                    <div className="text-center p-4 my-4 bg-muted/50 rounded-lg">
                        <p className="font-semibold">💡 Eco-Fact</p>
                        <p className="text-muted-foreground">{result.ecoFact}</p>
                    </div>
                    <Button onClick={() => setResult(null)} className="w-full">Got it!</Button>
                 </>
            )}
        </DialogContent>
      </Dialog>
    </>
  );
}
