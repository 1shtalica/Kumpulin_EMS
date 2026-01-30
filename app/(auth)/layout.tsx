import React from "react";

// ⭐ TAMBAHKAN CEK ROLE DI LAYOUT
// ⭐ CEK COOKIES

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
