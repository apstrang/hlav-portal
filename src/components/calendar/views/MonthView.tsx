"use client";

import { useState, useEffect } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  format,
  parseISO
} from "date-fns";
import { createClient } from "@/lib/supabase/client";
import type { CalendarEvent } from "@/types/calendar";

export default function MonthView() {
  const supabase = createClient()
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*");
      if (error) console.error(error);
      if (data) setEvents(data);
    };
    fetchEvents();
  }, []);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const dayRows = [];
  let day = startDate;
  let row = [];

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      const cloneDay = day;
      row.push(
        <div
          key={cloneDay.toISOString()}
          className={`border h-24 p-1 relative ${
            !isSameMonth(cloneDay, monthStart) ? "bg-gray-100 text-gray-400" : ""
          }`}
        >
          <div className="text-xs font-semibold">{format(cloneDay, "d")}</div>
          <div className="absolute inset-0 overflow-y-auto">
            {events
              .filter(e =>
                isSameDay(parseISO(e.start), cloneDay)
              )
              .map(event => (
                <div
                  key={event.id}
                  className="bg-blue-500 text-white text-xs rounded px-1 mt-1 truncate"
                >
                  {event.title}
                </div>
              ))}
          </div>
        </div>
      );
      day = addDays(day, 1);
    }
    dayRows.push(
      <div className="grid grid-cols-7" key={day.toISOString()}>
        {row}
      </div>
    );
    row = [];
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => setCurrentMonth(addDays(monthStart, -1))}
          className="px-2 py-1 border rounded"
        >
          ←
        </button>
        <h2 className="text-lg font-bold">
          {format(currentMonth, "MMMM yyyy")}
        </h2>
        <button
          onClick={() => setCurrentMonth(addDays(monthEnd, 1))}
          className="px-2 py-1 border rounded"
        >
          →
        </button>
      </div>
      <div className="grid grid-cols-7 bg-gray-50 text-xs font-bold">
        {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => (
          <div key={d} className="p-2 border">{d}</div>
        ))}
      </div>
      {dayRows}
    </div>
  );
}
