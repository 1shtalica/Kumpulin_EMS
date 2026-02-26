import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";



export default function MyEventCard() {
    return (
        <Link href={`/events/`}>
            <Card>
                <CardContent>
                    <p>My Event Card</p>
                </CardContent>
            </Card>
        </Link>
    );
}