/**
 * Illustrative capacity-fade curve. NOT the trained model: a textbook-shaped
 * empirical relationship (power-law cycle ageing, accelerated by temperature,
 * depth of discharge and fast charging) so the widget responds plausibly.
 */
export interface BatteryInputs {
  cycles: number; // full equivalent cycles
  temp: number; // °C average cell temperature
  dod: number; // depth of discharge, %
  fast: number; // share of DC fast charging, %
}

export const DEFAULT_BATTERY: BatteryInputs = { cycles: 800, temp: 28, dod: 70, fast: 30 };

export function capacity(i: BatteryInputs): number {
  const tempFactor = Math.exp(0.045 * (i.temp - 25)); // Arrhenius-ish
  const dodFactor = 0.55 + 0.9 * (i.dod / 100) ** 1.4;
  const fastFactor = 1 + 0.5 * (i.fast / 100);
  const fade = 0.32 * Math.pow(Math.max(i.cycles, 0), 0.6) * tempFactor * dodFactor * fastFactor;
  return Math.max(40, 100 - fade / 3);
}

export function curve(i: BatteryInputs, max = 2000, steps = 60): [number, number][] {
  return Array.from({ length: steps + 1 }, (_, k) => {
    const c = (k / steps) * max;
    return [c, capacity({ ...i, cycles: c })];
  });
}
