import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, Users, ArrowRight } from 'lucide-react';

const categoryColors = {
  Music: 'from-pink-500/20 to-purple-500/20 text-pink-300 border-pink-500/30',
  Technology: 'from-cyan-500/20 to-blue-500/20 text-cyan-300 border-cyan-500/30',
  Sports: 'from-amber-500/20 to-orange-500/20 text-amber-300 border-amber-500/30',
  Arts: 'from-emerald-500/20 to-teal-500/20 text-emerald-300 border-emerald-500/30',
  Comedy: 'from-yellow-500/20 to-lime-500/20 text-yellow-300 border-yellow-500/30',
};

export default function EventCard({ event }) {
  const categoryStyle = categoryColors[event.category] || 'from-purple-500/20 to-indigo-500/20 text-purple-300 border-purple-500/30';

  return (
    <div className="group glass-card rounded-2xl overflow-hidden hover:border-brand-primary/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-primary/10 flex flex-col justify-between">
      {/* Event Image & Badges */}
      <div>
        <div className="relative h-48 w-full overflow-hidden">
          <img
            src={event.banner_url}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-card via-transparent to-black/40" />
          
          {/* Category Tag */}
          <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md border bg-gradient-to-r ${categoryStyle}`}>
            {event.category}
          </span>

          {/* City Badge */}
          <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-medium bg-black/60 backdrop-blur-md text-slate-200 border border-white/10 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-brand-accent" />
            {event.venue_city}
          </span>
        </div>

        {/* Content Details */}
        <div className="p-5 space-y-3">
          <h3 className="text-lg font-bold text-white group-hover:text-brand-accent transition-colors line-clamp-1">
            {event.title}
          </h3>

          <p className="text-xs text-brand-muted line-clamp-2 leading-relaxed">
            {event.description}
          </p>

          <div className="space-y-1.5 pt-2 border-t border-brand-border/60 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-brand-accent" />
              <span>{event.date}</span>
              <span className="text-slate-500">•</span>
              <Clock className="w-3.5 h-3.5 text-brand-accent" />
              <span>{event.time}</span>
            </div>

            <div className="flex items-center gap-2 text-slate-400">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <span className="truncate">{event.venue_name}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer / Price & Book Button */}
      <div className="p-5 pt-0">
        <div className="flex items-center justify-between py-3 border-t border-brand-border/60">
          <div>
            <span className="text-[11px] text-brand-muted block uppercase">Starts from</span>
            <span className="text-lg font-extrabold text-white">
              ₹{Number(event.base_price).toLocaleString('en-IN')}
            </span>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-brand-muted block uppercase">Availability</span>
            <span className={`text-xs font-semibold flex items-center gap-1 ${
              event.available_seats_count > 10 ? 'text-emerald-400' : 'text-amber-400'
            }`}>
              <Users className="w-3 h-3" />
              {event.available_seats_count} seats left
            </span>
          </div>
        </div>

        <Link
          to={`/events/${event.id}`}
          className="w-full mt-2 py-2.5 px-4 rounded-xl font-semibold text-sm bg-gradient-to-r from-brand-primary to-brand-accent hover:from-brand-primaryHover hover:to-brand-primary text-white flex items-center justify-center gap-2 shadow-md shadow-brand-primary/20 hover:shadow-brand-primary/40 transition-all duration-200"
        >
          <span>Book Tickets</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
