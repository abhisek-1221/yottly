import { Suspense } from "react";
import { BackgroundBeamsDemo } from "@/components/Bgbeams";
import { AnimatedGridPatternDemo } from "@/components/gp";

export default function Home() {
  return (
    <main className="flex justify-center items-center h-screen inset-0">
        <Suspense fallback={<div>Loading playlist analyzer...</div>}>
        <AnimatedGridPatternDemo />
        </Suspense>
    </main>
  );
}