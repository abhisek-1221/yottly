import Image from "next/image";
import { Suspense } from "react";
import FeatureSearchBar from "@/components/featurebar";

export default function Home() {
  return (
    <main className="flex justify-center items-center min-h-screen inset-0">
        <Suspense fallback={<div>Loading playlist analyzer...</div>}>
        <FeatureSearchBar />
        </Suspense>
    </main>
  );
}