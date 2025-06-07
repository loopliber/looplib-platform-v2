import { Suspense } from 'react';
import SampleBrowser from "@/components/SampleBrowser";
import SampleSkeleton from "@/components/SampleSkeleton";

export default function Home() {
  return (
    <Suspense fallback={<SampleSkeleton />}>
      <SampleBrowser />
    </Suspense>
  );
}
