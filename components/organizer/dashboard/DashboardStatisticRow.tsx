

export default function DashboardStatisticRow() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200">
                <h3 className="font-semibold text-lg mb-2">Total Events</h3>
                <p className="text-3xl font-bold text-primary">--</p>
            </div>
            <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200">
                <h3 className="font-semibold text-lg mb-2">Active Events</h3>
                <p className="text-3xl font-bold text-green-600">--</p>
            </div>
            <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200">
                <h3 className="font-semibold text-lg mb-2">Total Attendees</h3>
                <p className="text-3xl font-bold text-blue-600">--</p>
            </div>
            <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200">
                <h3 className="font-semibold text-lg mb-2">Total Revenue</h3>
                <p className="text-3xl font-bold text-purple-600">--</p>
            </div>
        </div>
    );
}