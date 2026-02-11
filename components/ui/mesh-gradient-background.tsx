"use client";

import { cn } from "@/lib/utils";

interface MeshGradientBackgroundProps {
    children?: React.ReactNode;
    className?: string;
}

export function MeshGradientBackground({
    children,
    className,
}: MeshGradientBackgroundProps) {
    return (
        <div className={cn("relative min-h-screen w-full overflow-hidden bg-background selection:bg-primary/20", className)}>

            {/* Gradients */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob dark:bg-primary/10 dark:mix-blend-normal" />
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-secondary/20 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob animation-delay-2000 dark:bg-secondary/10 dark:mix-blend-normal" />
                <div className="absolute bottom-[-20%] left-[20%] w-[500px] h-[500px] bg-accent/20 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob animation-delay-4000 dark:bg-accent/10 dark:mix-blend-normal" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-500/20 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob animation-delay-2000 dark:bg-indigo-500/10 dark:mix-blend-normal" />
            </div>

            {/* Grid Pattern Overlay */}
            <div className="absolute inset-0 z-[1] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

            {/* Content */}
            <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-4">
                {children}
            </div>
        </div>
    );
}
