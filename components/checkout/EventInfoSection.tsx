import { Ticket, CalendarDays, MapPin } from "lucide-react";

interface EventInfoProps {
  title: string;
  date: string;
  time: string;
  location: string;
}

export function EventInfoSection({ title, date, time, location }: EventInfoProps) {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
      
      <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
        <Ticket className="text-primary" size={20} />
        Informasi Event
      </h2>
      
      <div className="flex flex-col gap-3">
        <p className="font-bold text-xl text-slate-900">{title}</p>
        <div className="flex items-center gap-2 text-slate-600 text-sm">
          <CalendarDays size={16} className="text-slate-400" />
          <span>{date} • {time}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-600 text-sm">
          <MapPin size={16} className="text-slate-400" />
          <span>{location}</span>
        </div>
      </div>
    </div>
  );
}
