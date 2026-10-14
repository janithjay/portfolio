import { capacity, DEFAULT_BATTERY } from "@/lib/demos/battery";
import { BatteryChart } from "./BatteryChart";

export function BatteryStatic() {
  return (
    <figure className="card p-[var(--space-card)]">
      <BatteryChart inputs={DEFAULT_BATTERY} />
      <figcaption className="mt-3 text-sm text-muted">
        Illustrative curve, not the trained model: {DEFAULT_BATTERY.cycles} cycles at {DEFAULT_BATTERY.temp}°C →{" "}
        {capacity(DEFAULT_BATTERY).toFixed(1)}% capacity. <span className="js-only">Loading the interactive version…</span>
      </figcaption>
    </figure>
  );
}
