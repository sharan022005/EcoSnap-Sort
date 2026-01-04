'use client';

import { useState, useRef, useTransition, useEffect } from 'react';
import Image from 'next/image';
import { Camera, Image as ImageIcon, Loader2, Sparkles, X, RotateCcw, Video, VideoOff } from 'lucide-react';

import { analyzeWasteImage } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from './ui/badge';
import { BinIcon, getBinDetails } from './bin-details';
import type { IdentifyWasteAndRecommendBinOutput } from '@/ai/flows/identify-waste-and-recommend-bin';
import { useDoc, useFirebase, addDocumentNonBlocking, updateDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import { collection, doc, increment, serverTimestamp } from 'firebase/firestore';
import { Alert, AlertTitle, AlertDescription } from './ui/alert';

interface WasteScannerProps {
  onAnalysisComplete: (result: IdentifyWasteAndRecommendBinOutput) => void;
}

export default function WasteScanner({ onAnalysisComplete }: WasteScannerProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [result, setResult] = useState<IdentifyWasteAndRecommendBinOutput | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [useCamera, setUseCamera] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);

  const { toast } = useToast();
  const { user, firestore } = useFirebase();

  const userDocRef = useMemoFirebase(
    () => (user ? doc(firestore, 'users', user.uid) : null),
    [user, firestore]
  );
  const { data: userData } = useDoc(userDocRef);

  useEffect(() => {
    const getCameraPermission = async () => {
      if (!useCamera) {
        // Turn off camera stream if it's running
        if (videoRef.current?.srcObject) {
          const stream = videoRef.current.srcObject as MediaStream;
          stream.getTracks().forEach(track => track.stop());
          videoRef.current.srcObject = null;
        }
        return;
      }
      
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        setHasCameraPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        setUseCamera(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings.',
        });
      }
    };

    getCameraPermission();

    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    }
  }, [useCamera, toast]);


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
    if (!imageFile || !user) return;

    const formData = new FormData();
    formData.append('image', imageFile);

    startTransition(async () => {
      const response = await analyzeWasteImage(formData);
      if (response.success) {
        setResult(response.data);
        onAnalysisComplete(response.data);
        
        // Update user points
        if (user && !user.isAnonymous) {
          const userRef = doc(firestore, 'users', user.uid);
          updateDocumentNonBlocking(userRef, { points: increment(10) });

          // Save waste identification event
          const wasteIdentificationsRef = collection(firestore, `users/${user.uid}/wasteIdentifications`);
          addDocumentNonBlocking(wasteIdentificationsRef, {
              userId: user.uid,
              timestamp: serverTimestamp(),
              imageUri: imagePreview, // In a real app, you'd upload this to a storage bucket and save the URL
              predictedBin: response.data.binColor,
              ecoFact: response.data.ecoFact,
          });
        }

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

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUrl = canvas.toDataURL('image/png');
        setImagePreview(dataUrl);

        canvas.toBlob(blob => {
          if (blob) {
            const file = new File([blob], 'capture.png', { type: 'image/png' });
            setImageFile(file);
          }
        }, 'image/png');
      }
       setUseCamera(false); // Turn off camera after capture
    }
  };
  
  const resultDetails = result ? getBinDetails(result.binColor) : null;

  const showLoginPrompt = () => toast({ title: 'Please log in to scan items.' });

  return (
    <>
      <Card className="w-full relative overflow-hidden shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="font-headline text-3xl flex items-center gap-2">
             <Sparkles className="w-7 h-7 text-primary" />
             Snap-to-Sort
          </CardTitle>
          <CardDescription>
            Use your camera or upload a picture to identify waste instantly.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-4">
            <div
              className="relative flex h-64 w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/50 transition-colors hover:border-primary"
              onClick={() => user && !imagePreview && !useCamera ? setUseCamera(true) : null}
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
                    className="absolute top-2 right-2 z-10 h-8 w-8 rounded-full shadow-md"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReset();
                    }}
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </>
              ) : useCamera ? (
                 <>
                    <video ref={videoRef} className="w-full h-full object-cover rounded-lg" autoPlay playsInline muted />
                    <canvas ref={canvasRef} className="hidden"></canvas>
                    <Button variant="outline" size="icon" className="absolute top-2 right-2 z-10 rounded-full" onClick={() => setUseCamera(false)}>
                        <X className="h-4 w-4" />
                    </Button>
                 </>
              ) : (
                <div className="text-center text-muted-foreground p-4">
                  <Camera className="mx-auto h-12 w-12" />
                  <p className="mt-2 font-semibold">Tap here to start your camera</p>
                  <p className="text-xs">or upload an image below</p>
                </div>
              )}
               {!user && <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-lg" onClick={showLoginPrompt}>
                  <p className="font-semibold text-foreground">Please log in to use the scanner.</p>
              </div>}

            </div>
             {hasCameraPermission === false && (
                <Alert variant="destructive">
                  <VideoOff className="h-4 w-4" />
                  <AlertTitle>Camera Access Denied</AlertTitle>
                  <AlertDescription>
                    Enable camera permissions to use this feature. You can still upload a file.
                  </AlertDescription>
                </Alert>
            )}

            <div className="w-full grid grid-cols-2 gap-4">
                {useCamera ? (
                     <Button onClick={handleCapture} disabled={!user} className="w-full" size="lg">
                        <Camera className="mr-2 h-4 w-4" />
                        Snap Photo
                    </Button>
                ) : imagePreview ? (
                     <Button onClick={handleAnalyze} disabled={isPending || !user} className="w-full" size="lg">
                        {isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                        <Sparkles className="mr-2 h-4 w-4" />
                        )}
                        Analyze Waste
                    </Button>
                ): (
                    <Button onClick={() => user ? setUseCamera(true) : showLoginPrompt()} className="w-full" size="lg" variant="secondary">
                        <Video className="mr-2 h-4 w-4" />
                        Use Camera
                    </Button>
                )}

                <Button onClick={() => user ? fileInputRef.current?.click() : showLoginPrompt()} className="w-full" size="lg" variant="secondary" disabled={useCamera || imagePreview}>
                    <ImageIcon className="mr-2 h-4 w-4" />
                    Upload Image
                </Button>
            </div>
             <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*"
              disabled={!user}
            />
          </div>
        </CardContent>
         {user && !user.isAnonymous && (
            <div className="absolute top-4 right-4">
                <Badge variant="secondary" className="text-lg shadow-sm">
                Points: {userData?.points ?? 0}
                </Badge>
            </div>
         )}
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
                        <p className="font-semibold text-primary">💡 Why? (Eco-Fact)</p>
                        <p className="text-muted-foreground">{result.ecoFact}</p>
                    </div>
                    <Button onClick={() => { setResult(null); handleReset(); }} className="w-full">Scan another item</Button>
                 </>
            )}
        </DialogContent>
      </Dialog>
    </>
  );
}
