"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
// import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
// import { useAuthStore } from "@/stores/auth-store"; 

export default function OrganizerHeader() {
  const pathname = usePathname();
  const titlepage = pathname.split("/").pop();

//      const getInitials = (name?: string) => {
//     if (!name) return "U";
//     return name
//       .split(" ")
//       .map((n) => n[0])
//       .join("")
//       .toUpperCase()
//       .slice(0, 2);
//   };

  return (
    <header className="sticky top-0 z-30 w-full h-16 bg-white border-b flex items-center justify-between px-6 shadow-xs">
      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-bold">
          {titlepage ? titlepage.replace("-", " ").split(" ").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ") : ""}
        </h1>
      </div>
      
      {/* Profile / Notif
      <div className="flex gap-4 items-center">
        <span className="text-sm text-gray-600">{user?.username}</span>
        <Avatar>
          <AvatarImage src={user?.avatar} alt={user?.username} />
          <AvatarFallback>{getInitials(user?.username)}</AvatarFallback>
        </Avatar>
      </div> */}

    </header>
  );
}