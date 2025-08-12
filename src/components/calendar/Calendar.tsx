"use client";

import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { Calendar as BigCalendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";

// Dynamically import DayPilot components (no SSR)
const DayPilotCalendar = dynamic(
  () => import("@daypilot/daypilot-lite-react").then(mod => mod.DayPilotCalendar),
  { ssr: false }
);

const DayPilotScheduler = dynamic(
  () => import("@daypilot/daypilot-lite-react").then(mod => mod.DayPilotScheduler),
  { ssr: false }
);

const locales = { "en-US": enUS };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales,
});

const initialEvents = [
  {
    id: 1,
    text: "Team Meeting",
    title: "Team Meeting",
    start: "2025-07-30T09:00:00",
    end: "2025-07-30T11:00:00",
    resource: "A",
  },
  {
    id: 2,
    text: "Client Call",
    title: "Client Call",
    start: "2025-07-30T12:00:00",
    end: "2025-07-30T13:00:00",
    resource: "B",
  },
];

const resources = [
  { name: "Room A", id: "A" },
  { name: "Room B", id: "B" },
];

export default function HybridScheduler() {
  const [view, setView] = useState<"timeline" | "week" | "month">("timeline");
  const [events, setEvents] = useState(initialEvents);
  const [DayPilot, setDayPilot] = useState<unknown>(null);

  const addEvent = () => {
    setEvents(prev => [
        ...prev,
        {
            id: prev.length + 1,
            text: "New Event",
            title: "New Event",
            start: new Date().toISOString(),
            end: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
            resource: "A",
        },
    ]);
};

  // Load DayPilot client-side only
  useEffect(() => {
    import("@daypilot/daypilot-lite-react").then(mod => setDayPilot(mod.DayPilot));
  }, []);

  const dpEvents = useMemo(
    () =>
      DayPilot
        ? events.map(ev => ({
            ...ev,
            start: new DayPilot.Date(ev.start),
            end: new DayPilot.Date(ev.end),
          }))
        : [],
    [events, DayPilot]
  );

  const rbcEvents = useMemo(
    () =>
      events.map(ev => ({
        ...ev,
        start: new Date(ev.start),
        end: new Date(ev.end),
      })),
    [events]
  );

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <button onClick={() => setView("timeline")} className="px-3 py-1 border rounded">
          Resource Timeline
        </button>
        <button onClick={() => setView("week")} className="px-3 py-1 border rounded">
          Week View
        </button>
        <button onClick={() => setView("month")} className="px-3 py-1 border rounded">
          Month View
        </button>
        <button onClick={addEvent} className="px-3 py-1 border rounder bg-blue-500 text-white">
            + Add Event
        </button>
      </div>

      {view === "timeline" && DayPilotScheduler && DayPilot && (
        <DayPilotScheduler
          startDate={DayPilot.Date.today()}
          days={1}
          scale="Hour"
          timeHeaders={[{ groupBy: "Day" }, { groupBy: "Hour" }]}
          resources={resources}
          events={dpEvents}
        />
      )}

      {view === "week" && DayPilotCalendar && DayPilot && (
        <DayPilotCalendar
          viewType="Week"
          startDate={DayPilot.Date.today()}
          events={dpEvents}
        />
      )}

      {view === "month" && (
        <BigCalendar
          localizer={localizer}
          events={rbcEvents}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 600 }}
        />
      )}
    </div>
  );
}
