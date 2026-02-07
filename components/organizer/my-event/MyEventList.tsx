import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function MyEventList() {
    return (
        <>
            <section className="flex justify-between items-center">
                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl font-bold">My Event List</h1>
                    <p className="text-muted">Manage your events and track their performance.</p>
                </div>
                <div>
                    <Button variant="brand" size="lg" asChild>
                        <Link href="/organizer/create-event">Create Event</Link>
                    </Button>
                </div>
            </section>
        </>
    );
}