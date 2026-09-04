import { google } from "googleapis";
import { getGoogleAuth } from "./auth";

const SCOPES = ["https://www.googleapis.com/auth/webmasters.readonly"];

function getClient() {
  const auth = getGoogleAuth(SCOPES);
  if (!auth) return null;
  return google.searchconsole({ version: "v1", auth });
}

export type GscSummary = { clicks: number; impressions: number; ctr: number; position: number };
export type GscQueryRow = { query: string; clicks: number; impressions: number; ctr: number; position: number };
export type GscPageRow = { page: string; clicks: number; impressions: number; ctr: number; position: number };

function dateNDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

// Search Console API未設定（GOOGLE_SERVICE_ACCOUNT_KEY または GSC_SITE_URL 未設定）の場合はnullを返す
export async function getGscSummary(days: number, offsetDays = 0): Promise<GscSummary | null> {
  const siteUrl = process.env.GSC_SITE_URL;
  const client = getClient();
  if (!client || !siteUrl) return null;

  const res = await client.searchanalytics.query({
    siteUrl,
    requestBody: { startDate: dateNDaysAgo(days + offsetDays), endDate: dateNDaysAgo(offsetDays) },
  });

  const row = res.data.rows?.[0];
  return {
    clicks: row?.clicks ?? 0,
    impressions: row?.impressions ?? 0,
    ctr: row?.ctr ?? 0,
    position: row?.position ?? 0,
  };
}

export async function getGscTopQueries(days: number, limit = 50): Promise<GscQueryRow[] | null> {
  const siteUrl = process.env.GSC_SITE_URL;
  const client = getClient();
  if (!client || !siteUrl) return null;

  const res = await client.searchanalytics.query({
    siteUrl,
    requestBody: {
      startDate: dateNDaysAgo(days),
      endDate: dateNDaysAgo(0),
      dimensions: ["query"],
      rowLimit: limit,
    },
  });

  return (res.data.rows ?? []).map((row) => ({
    query: row.keys?.[0] ?? "",
    clicks: row.clicks ?? 0,
    impressions: row.impressions ?? 0,
    ctr: row.ctr ?? 0,
    position: row.position ?? 0,
  }));
}

export async function getGscTopPages(days: number, limit = 50): Promise<GscPageRow[] | null> {
  const siteUrl = process.env.GSC_SITE_URL;
  const client = getClient();
  if (!client || !siteUrl) return null;

  const res = await client.searchanalytics.query({
    siteUrl,
    requestBody: {
      startDate: dateNDaysAgo(days),
      endDate: dateNDaysAgo(0),
      dimensions: ["page"],
      rowLimit: limit,
    },
  });

  return (res.data.rows ?? []).map((row) => ({
    page: row.keys?.[0] ?? "",
    clicks: row.clicks ?? 0,
    impressions: row.impressions ?? 0,
    ctr: row.ctr ?? 0,
    position: row.position ?? 0,
  }));
}
