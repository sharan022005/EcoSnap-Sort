'use client';

import { useState } from 'react';
import { PanelLeft, Trophy } from 'lucide-react';

import AppHeader from '@/components/app-header';
import Leaderboard from '@/components/leaderboard';
import WasteScanner from '@/components/waste-scanner';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import WasteWise from '@/components/waste-wise';
import type { IdentifyWasteAndRecommendBinOutput } from '@/ai/flows/identify-waste-and-recommend-bin';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';


export default function Home() {
  const [analysisResult, setAnalysisResult] = useState<IdentifyWasteAndRecommendBinOutput | null>(null);

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <AppHeader />
      <main className="flex-1 flex flex-col">
        <ResizablePanelGroup direction="horizontal" className="flex-1">
          <ResizablePanel defaultSize={55} minSize={30}>
            <div className="flex flex-col h-full p-4 md:p-8 items-center justify-center">
              <div className="w-full max-w-2xl">
                 <WasteScanner onAnalysisComplete={setAnalysisResult} />
              </div>
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={45} minSize={30}>
             <div className="h-full p-4 md:p-8">
              <WasteWise result={analysisResult} />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </main>
      <div className="absolute top-20 right-6 z-10">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="rounded-full shadow-lg">
                <Trophy className="h-5 w-5" />
                <span className="sr-only">Open Leaderboard</span>
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:w-[540px]">
              <Leaderboard />
            </SheetContent>
          </Sheet>
        </div>
    </div>
  );
}
