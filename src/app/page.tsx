import Image from "next/image";
import { Suspense } from "react";
import PlaylistAnalyzer from "@/components/PlaylistAnalyzer";

export default function Home() {
  return (
    <main className="container mx-auto p-4">
      <Suspense fallback={<div>Loading playlist analyzer...</div>}>
        <PlaylistAnalyzer />
      </Suspense>
    </main>
  );
}

