"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowBigLeft, BarChart3, LineChart, PieChart } from "lucide-react";
import { useRouter } from "next/navigation";

interface ComingSoonProps {
  title: string;
  returnPath?: string;
}

export function ComingSoon({ title, returnPath = "/dashboard" }: ComingSoonProps) {
  const router = useRouter();
  
  return (
    <Card className="w-full max-w-4xl p-8 relative overflow-hidden">
      {/* Background decorative elements */}
      <motion.div
        className="absolute -top-20 -right-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute -bottom-20 -left-20 w-40 h-40 bg-secondary/10 rounded-full blur-3xl"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.5, 0.3, 0.5],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Main content */}
      <div className="relative z-10 text-center space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-4"
        >
          <h1 className="text-4xl font-bold tracking-tight">
            {title}
          </h1>
          <p className="text-muted-foreground text-lg">
            Coming soon! We're working on something amazing.
          </p>
        </motion.div>

        {/* Feature icons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex justify-center gap-8 py-8"
        >
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="flex flex-col items-center gap-2"
          >
            <BarChart3 className="w-12 h-12 text-primary" />
            <span className="text-sm text-muted-foreground">Bar Charts</span>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="flex flex-col items-center gap-2"
          >
            <LineChart className="w-12 h-12 text-primary" />
            <span className="text-sm text-muted-foreground">Line Graphs</span>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="flex flex-col items-center gap-2"
          >
            <PieChart className="w-12 h-12 text-primary" />
            <span className="text-sm text-muted-foreground">Pie Charts</span>
          </motion.div>
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Button size="lg" className="gap-2"
          onClick={() => router.push(returnPath)}
          >
            Go Back
            <ArrowBigLeft className="w-4 h-4" />
          </Button>
        </motion.div>
      </div>
    </Card>
  );
} 