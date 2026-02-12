import React from "react";
import { MeshGradientBackground } from "@/components/ui/mesh-gradient-background";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MeshGradientBackground className="flex items-center justify-center">
      <div className="w-full max-w-md">{children}</div>
    </MeshGradientBackground>
  );
}
