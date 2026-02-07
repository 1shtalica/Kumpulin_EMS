"use client";

import { useState } from "react";
import OrganizerHeader from "@/components/layout/organizer/MainHeader";
import OrganizerNavBar from "@/components/layout/organizer/MainNavBar";
import { cn } from "@/lib/utils";

export default function MainPagesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isOpen, setIsOpen] = useState(true);

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <OrganizerNavBar isOpen={isOpen} toggleSidebar={toggleSidebar} />

            {/* Main Content Area */}
            <div 
                className={cn(
                    "flex-1 flex flex-col transition-all duration-300 ease-in-out",
                    isOpen ? "ml-64" : "ml-20"
                )}
            >
                <OrganizerHeader />
                {children}
            </div>
        </div>
    );
}