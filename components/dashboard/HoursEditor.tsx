"use client";

const DAYS: { key: string; label: string }[] = [
  { key: "mon", label: "Monday" },
  { key: "tue", label: "Tuesday" },
  { key: "wed", label: "Wednesday" },
  { key: "thu", label: "Thursday" },
  { key: "fri", label: "Friday" },
  { key: "sat", label: "Saturday" },
  { key: "sun", label: "Sunday" },
];

type DayHours = { open: string; close: string };

interface HoursEditorProps {
  value: Record<string, DayHours>;
  onChange: (value: Record<string, DayHours>) => void;
}

/**
 * Shape assumption: content_blocks.contact.hours = { [day]: { open, close } },
 * mirroring the AI chat layer's set_hours tool, which writes one day at a
 * time. A day absent from the object is treated as closed. Not verified
 * against tool-executor.ts (file wasn't reachable at the expected path) —
 * flag if the real shape differs.
 */
export function HoursEditor({ value, onChange }: HoursEditorProps) {
  function setDay(day: string, patch: Partial<DayHours>) {
    const current = value[day] ?? { open: "09:00", close: "18:00" };
    onChange({ ...value, [day]: { ...current, ...patch } });
  }

  function toggleClosed(day: string, closed: boolean) {
    if (closed) {
      const next = { ...value };
      delete next[day];
      onChange(next);
    } else {
      onChange({ ...value, [day]: { open: "09:00", close: "18:00" } });
    }
  }

  return (
    <div style={{ marginBottom: "0.6rem" }}>
      <span style={{ display: "block", fontSize: "0.85rem", color: "#555", marginBottom: "0.3rem" }}>
        Hours
      </span>
      {DAYS.map(({ key, label }) => {
        const day = value[key];
        const closed = !day;
        return (
          <div key={key} style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.3rem" }}>
            <span style={{ width: "90px", fontSize: "0.85rem" }}>{label}</span>
            <label style={{ fontSize: "0.8rem" }}>
              <input type="checkbox" checked={closed} onChange={(e) => toggleClosed(key, e.target.checked)} /> Closed
            </label>
            {!closed && (
              <>
                <input type="time" value={day?.open ?? "09:00"} onChange={(e) => setDay(key, { open: e.target.value })} />
                <span>–</span>
                <input type="time" value={day?.close ?? "18:00"} onChange={(e) => setDay(key, { close: e.target.value })} />
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
