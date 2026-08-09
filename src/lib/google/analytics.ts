import { google, analyticsdata_v1beta } from "googleapis";
import { getGoogleAuth } from "./auth";

const SCOPES = ["https://www.googleapis.com/auth/analytics.readonly"];

function getClient(): analyticsdata_v1beta.Analyticsdata | null {
  const auth = getGoogleAuth(SCOPES);
  if (!auth) return null;
  return google.analyticsdata({ version: "v1beta", auth });
}

export type Ga4Summary = {
  sessions: number;
  activeUsers: number;
  screenPageViews: number;
  averageSessionDuration: number;
  bounceRate: number;
};

export type Ga4PageRow = { path: string; views: number; sessions: number };

// GA4 Data API未設定（GOOGLE_SERVICE_ACCOUNT_KEY または GA4_PROPERTY_ID 未設定）の場合はnullを返す
export async function getGa4Summary(days: number): Promise<Ga4Summary | null> {
  const propertyId = process.env.GA4_PROPERTY_ID;
  const client = getClient();
  if (!client || !propertyId) return null;

  const res = await client.properties.runReport({
    property: `properties/${propertyId}`,
    requestBody: {
      dateRanges: [{ startDate: `${days}daysAgo`, endDate: "today" }],
      metrics: [
        { name: "sessions" },
        { name: "activeUsers" },
        { name: "screenPageViews" },
        { name: "averageSessionDuration" },
        { name: "bounceRate" },
      ],
    },
  });

  const row = res.data.rows?.[0];
  if (!row?.metricValues) return null;

  const [sessions, activeUsers, screenPageViews, averageSessionDuration, bounceRate] = row.metricValues;
  return {
    sessions: Number(sessions?.value ?? 0),
    activeUsers: Number(activeUsers?.value ?? 0),
    screenPageViews: Number(screenPageViews?.value ?? 0),
    averageSessionDuration: Number(averageSessionDuration?.value ?? 0),
    bounceRate: Number(bounceRate?.value ?? 0),
  };
}

export type Ga4DailyRow = { date: string; views: number; sessions: number; activeUsers: number };

export async function getGa4DailyPageViews(days: number): Promise<Ga4DailyRow[] | null> {
  const propertyId = process.env.GA4_PROPERTY_ID;
  const client = getClient();
  if (!client || !propertyId) return null;

  const res = await client.properties.runReport({
    property: `properties/${propertyId}`,
    requestBody: {
      dateRanges: [{ startDate: `${days}daysAgo`, endDate: "today" }],
      dimensions: [{ name: "date" }],
      metrics: [{ name: "screenPageViews" }, { name: "sessions" }, { name: "activeUsers" }],
      orderBys: [{ dimension: { dimensionName: "date" }, desc: false }],
    },
  });

  return (res.data.rows ?? []).map((row) => ({
    date: row.dimensionValues?.[0]?.value ?? "",
    views: Number(row.metricValues?.[0]?.value ?? 0),
    sessions: Number(row.metricValues?.[1]?.value ?? 0),
    activeUsers: Number(row.metricValues?.[2]?.value ?? 0),
  }));
}

export async function getGa4TopPages(days: number, limit = 50): Promise<Ga4PageRow[] | null> {
  const propertyId = process.env.GA4_PROPERTY_ID;
  const client = getClient();
  if (!client || !propertyId) return null;

  const res = await client.properties.runReport({
    property: `properties/${propertyId}`,
    requestBody: {
      dateRanges: [{ startDate: `${days}daysAgo`, endDate: "today" }],
      dimensions: [{ name: "pagePath" }],
      metrics: [{ name: "screenPageViews" }, { name: "sessions" }],
      orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
      limit: String(limit),
    },
  });

  return (res.data.rows ?? []).map((row) => ({
    path: row.dimensionValues?.[0]?.value ?? "",
    views: Number(row.metricValues?.[0]?.value ?? 0),
    sessions: Number(row.metricValues?.[1]?.value ?? 0),
  }));
}
