
import { UserCard } from "@/components/common/UserCard";

export default function Dashboard() {
  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Organizer Dashboard</h1>
      </div>

      {/* User Profile Card - Client Component */}
      <UserCard />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200">
            <h3 className="font-semibold text-lg mb-2">Total Events</h3>
            <p className="text-3xl font-bold text-primary">0</p>
        </div>
        <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200">
            <h3 className="font-semibold text-lg mb-2">Active Events</h3>
            <p className="text-3xl font-bold text-green-600">0</p>
        </div>
        <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200">
            <h3 className="font-semibold text-lg mb-2">Total Attendees</h3>
            <p className="text-3xl font-bold text-blue-600">0</p>
        </div>
      </div>
    </div>
  );
}
