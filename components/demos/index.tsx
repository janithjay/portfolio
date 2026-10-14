import { PlaygroundStatic } from "@/components/playground/PlaygroundStatic";
import { BatteryStatic } from "./BatteryStatic";
import { BatteryLazy, PlaygroundLazy, PowerTraceLazy, RobotLazy } from "./lazy";
import { PowerTraceStatic } from "./PowerTraceStatic";
import { RobotStatic } from "./RobotStatic";

/* Server entry points: static fallback inside a client lazy-loader. */

export function PlaygroundDemo() {
  return (
    <PlaygroundLazy>
      <PlaygroundStatic />
    </PlaygroundLazy>
  );
}

export function PowerTraceDemo() {
  return (
    <PowerTraceLazy>
      <PowerTraceStatic />
    </PowerTraceLazy>
  );
}

export function RobotDemo() {
  return (
    <RobotLazy>
      <RobotStatic />
    </RobotLazy>
  );
}

export function BatteryDemo({ hfSpace }: { hfSpace?: string }) {
  return (
    <BatteryLazy hfSpace={hfSpace}>
      <BatteryStatic />
    </BatteryLazy>
  );
}
