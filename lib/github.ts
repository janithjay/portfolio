import "server-only";
import proof from "@/content/proof.json";

export interface ProofItem {
  title: string;
  repo: string;
  url: string;
  mergedAt?: string;
}

export interface ProofData {
  source: "live" | "curated" | "none";
  items: ProofItem[];
  total?: number;
  fetchedAt: string;
}

const REVALIDATE = 60 * 60 * 6; // six hours: fresh enough, never on the critical path

/** Merged public PRs, fetched at build time and revalidated in the background (ISR). */
export async function getProof(): Promise<ProofData> {
  const user = process.env.GITHUB_USERNAME || proof.githubUser;
  const repoFilter = (proof.repoFilter as string[]).map((r) => `repo:${r}`).join(" ");
  const q = encodeURIComponent(`is:pr is:merged is:public author:${user} ${repoFilter}`.trim());
  const headers: Record<string, string> = {
    accept: "application/vnd.github+json",
    "x-github-api-version": "2022-11-28",
  };
  if (process.env.GITHUB_TOKEN) headers.authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

  try {
    const res = await fetch(`https://api.github.com/search/issues?q=${q}&sort=updated&order=desc&per_page=6`, {
      headers,
      next: { revalidate: REVALIDATE },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error(`GitHub ${res.status}`);
    const data = (await res.json()) as {
      total_count: number;
      items: { title: string; html_url: string; repository_url: string; pull_request?: { merged_at?: string }; closed_at?: string }[];
    };
    const items = data.items.map((i) => ({
      title: i.title,
      url: i.html_url,
      repo: i.repository_url.replace("https://api.github.com/repos/", ""),
      mergedAt: i.pull_request?.merged_at ?? i.closed_at,
    }));
    if (items.length) return { source: "live", items, total: data.total_count, fetchedAt: new Date().toISOString() };
  } catch {
    /* fall through to curated content */
  }

  const curated = proof.curated.filter((c) => c.url);
  return {
    source: curated.length ? "curated" : "none",
    items: curated.map((c) => ({ title: c.title, repo: c.repo, url: c.url })),
    fetchedAt: new Date().toISOString(),
  };
}
