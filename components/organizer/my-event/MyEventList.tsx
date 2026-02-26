import MyEventCard from "./MyEventCard";


export default function MyEventList() {
    return (
        <section className="flex flex-col gap-4">
            <p className="text-muted">Menampilkan 3 dari 10 event</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <MyEventCard />
                <MyEventCard />
                <MyEventCard />
            </div>
        </section>
    );
}