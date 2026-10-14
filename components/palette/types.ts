export interface PaletteItem {
  id: string;
  label: string;
  href: string;
  group: "Pages" | "Work" | "Sections" | "Links";
  keywords?: string[];
  hint?: string;
}
