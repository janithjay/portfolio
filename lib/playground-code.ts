import type { FontChoice, Scheme, ThemeTokens } from "./theme";

export type Framework = "react" | "nextjs" | "vue" | "nuxt" | "express";

export const FRAMEWORKS: { id: Framework; label: string; file: string }[] = [
  { id: "react", label: "React", file: "App.tsx" },
  { id: "nextjs", label: "Next.js", file: "app/layout.tsx" },
  { id: "vue", label: "Vue", file: "main.ts + Profile.vue" },
  { id: "nuxt", label: "Nuxt", file: "nuxt.config.ts + pages/profile.vue" },
  { id: "express", label: "Express", file: "server.ts" },
];

const FONT_NAME: Record<FontChoice, string> = {
  display: "Bricolage Grotesque",
  grotesk: "Hanken Grotesk",
  mono: "Martian Mono",
  system: "system-ui",
};

export type Packages = Record<Framework, string>;

function themeObject(t: ThemeTokens, scheme: Scheme, indent: string) {
  const i = indent;
  return [
    `{`,
    `${i}  mode: "${scheme}",`,
    `${i}  colors: { primary: "${t.accent.toUpperCase()}" },`,
    `${i}  radius: ${t.radius},`,
    `${i}  typography: { headingFont: "${FONT_NAME[t.font]}" },`,
    `${i}  density: "${t.density}",`,
    `${i}}`,
  ].join("\n");
}

export function generateCode(fw: Framework, t: ThemeTokens, scheme: Scheme, pkg: Packages): string {
  switch (fw) {
    case "react":
      return `import { IdentityProvider, SignedIn, SignedOut, SignIn, UserProfile } from "${pkg.react}";

const theme = ${themeObject(t, scheme, "")};

export default function App() {
  return (
    <IdentityProvider clientId={import.meta.env.VITE_CLIENT_ID} baseUrl={import.meta.env.VITE_BASE_URL} theme={theme}>
      <SignedOut>
        <SignIn />
      </SignedOut>
      <SignedIn>
        <UserProfile editable={["givenName", "familyName", "username"]} />
      </SignedIn>
    </IdentityProvider>
  );
}`;
    case "nextjs":
      return `// app/layout.tsx
import { IdentityProvider } from "${pkg.nextjs}";

const theme = ${themeObject(t, scheme, "")};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <IdentityProvider theme={theme}>{children}</IdentityProvider>
      </body>
    </html>
  );
}

// app/profile/page.tsx (server component: the session is resolved before render)
import { UserProfile, getSession } from "${pkg.nextjs}/server";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect("/sign-in");
  return <UserProfile />;
}`;
    case "vue":
      return `// main.ts
import { createApp } from "vue";
import { IdentityPlugin } from "${pkg.vue}";
import App from "./App.vue";

createApp(App)
  .use(IdentityPlugin, {
    clientId: import.meta.env.VITE_CLIENT_ID,
    baseUrl: import.meta.env.VITE_BASE_URL,
    theme: ${themeObject(t, scheme, "    ").trimStart()},
  })
  .mount("#app");

<!-- Profile.vue -->
<script setup lang="ts">
import { SignIn, UserProfile, useIdentity } from "${pkg.vue}";
const { isSignedIn } = useIdentity();
</script>

<template>
  <UserProfile v-if="isSignedIn" />
  <SignIn v-else />
</template>`;
    case "nuxt":
      return `// nuxt.config.ts
export default defineNuxtConfig({
  modules: ["${pkg.nuxt}"],
  identity: {
    theme: ${themeObject(t, scheme, "    ").trimStart()},
  },
});

<!-- pages/profile.vue -->
<script setup lang="ts">
definePageMeta({ middleware: "identity-auth" }); // redirects when signed out
</script>

<template>
  <UserProfile />
</template>`;
    case "express":
      return `import express from "express";
import { identity, requireAuth } from "${pkg.express}";

const app = express();

app.use(
  identity({
    clientId: process.env.CLIENT_ID!,
    baseUrl: process.env.BASE_URL!,
    // served to server-rendered pages and hosted self-service screens
    theme: ${themeObject(t, scheme, "    ").trimStart()},
  }),
);

app.get("/profile", requireAuth(), (req, res) => {
  res.render("profile", { user: req.identity.user, theme: req.identity.theme });
});

app.listen(3000);`;
  }
}
