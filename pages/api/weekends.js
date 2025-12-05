import { google } from "googleapis";

export default async function handler(req, res) {
  try {
    const auth = new google.auth.JWT(
      process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      null,
      process.env.GOOGLE_SERVICE_ACCOUNT_KEY.replace(/\\n/g, "\n"),
      ["https://www.googleapis.com/auth/calendar.readonly"]
    );

    const calendar = google.calendar({ version: "v3", auth });

    const now = new Date();
    const future = new Date();
    future.setMonth(now.getMonth() + 3);

    const eventsRes = await calendar.events.list({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      timeMin: now.toISOString(),
      timeMax: future.toISOString(),
      singleEvents: true,
      orderBy: "startTime"
    });

    const booked = new Set();
    const events = eventsRes.data.items || [];

    for (const e of events) {
      const start = new Date(e.start.date || e.start.dateTime);
      const end = new Date(e.end.date || e.end.dateTime);

      for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
        booked.add(d.toDateString());
      }
    }

    const weekends = [];
    const cursor = new Date(now);

    while (cursor <= future) {
      if (cursor.getDay() === 5) {
        const fri = new Date(cursor);
        const sat = new Date(cursor); sat.setDate(sat.getDate() + 1);
        const sun = new Date(cursor); sun.setDate(sun.getDate() + 2);

        const days = [fri, sat, sun];
        const free = days.every((d) => !booked.has(d.toDateString()));

        if (free) {
          weekends.push({
            id: weekends.length + 1,
            label: `${fri.toLocaleDateString()}–${sun.toLocaleDateString()}`,
            start: fri,
            end: sun
          });
        }
      }
      cursor.setDate(cursor.getDate() + 1);
    }

    res.status(200).json(weekends);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Calendar error" });
  }
}
