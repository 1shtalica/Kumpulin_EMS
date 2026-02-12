
import { UserCard } from "@/components/common/UserCard";

export default function Home() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Home</h1>
      
      {/* 
        UserCard is a Client Component (has 'use client') so it can use hooks like useAuthStore.
        This page (Home) remains a Server Component.
      */}
      <UserCard />
    </div>
  );
}
