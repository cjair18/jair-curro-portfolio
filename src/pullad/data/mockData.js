/**
 * mockData.js
 * -----------------------------------------------------------------------
 * PullAd AI — fully mocked, offline data fixtures for the prototype build.
 *
 * Per PROJECT_BRIEF.md (Key Decisions Log, 2026-07-17, "This build is a
 * fully scripted/mocked prototype"): this file contains ZERO network
 * calls, ZERO OAuth flows, and ZERO real API clients. Everything below is
 * plain, synchronously-generated JS data meant to look like what GA4,
 * Google Ads, and Shopify would realistically return, shaped per the field
 * mapping in docs/requirements-v1.md Section 3.
 *
 * All dates are computed relative to `new Date()` at module load time (see
 * TODAY / START_DATE below), so the 60-day window always ends "today" no
 * matter when the demo is run. A seeded PRNG is used so the *shape* of the
 * data (trends, noise, the deliberate bad data points) is stable across
 * reloads, even though the calendar dates it's attached to shift daily.
 *
 * Modeling notes (decisions made while authoring this mock, within the
 * Data/API Integration Specialist's scope of "shape realistic mock data,"
 * not a product/backend decision):
 *  - Revenue definition follows the confirmed decision in PROJECT_BRIEF.md
 *    (2026-07-17): Shopify net revenue = gross (list price) - discounts -
 *    refunds. This identity holds exactly for every day in `shopifyDaily`
 *    by construction (net is derived last, not independently generated).
 *  - Per Decision 1 in docs/requirements-v1.md Section 5: GA4 determines
 *    *which* sales are attributable to ads (via each day's Paid Search
 *    share of total GA4-tracked purchase revenue); the *dollar figure*
 *    used in `getSpendAndRevenue` / `getCampaignRanking` always comes from
 *    Shopify's net revenue, not from Google Ads' own modeled
 *    `conversionValue` or GA4's own `purchaseRevenue`.
 *  - GA4's only channel groupings modeled here are the five named in
 *    requirements-v1.md Section 2 (US-7): Paid Search, Organic Search,
 *    Direct, Referral, Social. All Google Ads campaigns (Search, Shopping,
 *    Display/Retargeting) roll up into the single "Paid Search" GA4
 *    channel grouping, since the requirements doc does not carve out a
 *    separate "Shopping" or "Display" grouping for v1.
 *  - Shopify orders are not natively tagged by ad campaign (real Shopify
 *    doesn't know traffic source) — that attribution is GA4's job per
 *    Decision 1. A small "untracked" order slice is modeled per day
 *    (phone/direct-checkout-link orders with no GA4 session) to reflect a
 *    realistic tracking-gap quirk between GA4 order counts and Shopify's.
 *
 * Deliberate "bad" data points included for edge-case coverage (see
 * docs/requirements-v1.md Section 2 edge cases):
 *  - Campaign "Display - Prospecting" carries daily spend but converts on
 *    only a small fraction of days (near-zero conversions the whole
 *    window) — the "spend but no attributable sales" campaign edge case
 *    (US-2/US-3).
 *  - One specific day in the window (`ZERO_CONVERSION_DAY_KEY`) has normal
 *    Google Ads spend across all campaigns but zero attributed revenue for
 *    the whole Paid Search channel that day — the "spend exists but no
 *    attributable revenue in the period" edge case (US-1/US-5).
 * -----------------------------------------------------------------------
 */

// ============================================================
// Date utilities (plain JS Date math, no libraries)
// ============================================================

function pad2(n) {
  return String(n).padStart(2, "0");
}

/**
 * Formats a Date (using LOCAL getters) as a YYYY-MM-DD key. If given a
 * string already in that canonical form, returns it unchanged — this
 * avoids the classic JS pitfall where `new Date("YYYY-MM-DD")` parses as
 * UTC midnight, which can silently roll back a day when read with local
 * getters in negative-UTC-offset timezones (e.g. the US). Any other
 * string format is parsed as a best-effort fallback.
 */
function toDateKey(input) {
  if (typeof input === "string") {
    if (/^\d{4}-\d{2}-\d{2}$/.test(input)) return input;
    input = new Date(input);
  }
  const d = input instanceof Date ? input : new Date(input);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function isWeekend(date) {
  const day = date.getDay(); // 0 = Sun, 6 = Sat
  return day === 0 || day === 6;
}

function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function round4(n) {
  return Math.round((n + Number.EPSILON) * 10000) / 10000;
}

function clampMin(n, min = 0) {
  return n < min ? min : n;
}

function sumBy(arr, key) {
  return arr.reduce((total, r) => total + r[key], 0);
}

/** Inclusive lexicographic range check — safe because keys are zero-padded ISO dates. */
function inRange(dateKey, startKey, endKey) {
  return dateKey >= startKey && dateKey <= endKey;
}

// ============================================================
// Seeded PRNG — deterministic "randomness" so the demo's data shape
// (trends, the bad data points, day-to-day noise) is stable across
// reloads, independent of the real system clock.
// ============================================================

function mulberry32(seed) {
  let t = seed >>> 0;
  return function random() {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

const rng = mulberry32(20260717); // seeded on the requirements-confirmation date

// ============================================================
// Window setup — always relative to "today" at module load time
// ============================================================

export const WINDOW_DAYS = 60;
export const TODAY = startOfDay(new Date());
export const START_DATE = addDays(TODAY, -(WINDOW_DAYS - 1));
export const END_DATE = TODAY;

/** Ascending array of YYYY-MM-DD keys covering the full 60-day window, inclusive. */
export const DATE_KEYS = Array.from({ length: WINDOW_DAYS }, (_, i) =>
  toDateKey(addDays(START_DATE, i)),
);

// A day, chosen deterministically within the window, that gets forced to
// zero attributed revenue despite normal ad spend (see file header).
const ZERO_CONVERSION_DAY_INDEX = 11;
const ZERO_CONVERSION_DAY_KEY = DATE_KEYS[ZERO_CONVERSION_DAY_INDEX];

// ============================================================
// Google Ads campaign configuration (generation parameters)
// ============================================================

const CAMPAIGN_CONFIG = [
  {
    id: "search-brand",
    name: "Search - Brand",
    campaignType: "SEARCH",
    cpc: 0.85,
    baseSpend: 45,
    weekdayMult: 1.0,
    weekendMult: 0.85,
    cvrBase: 0.09,
    aovBase: 72,
    trend: "flat", // stable, efficient campaign — control group
  },
  {
    id: "search-generic",
    name: "Search - Generic",
    campaignType: "SEARCH",
    cpc: 1.55,
    baseSpend: 120,
    weekdayMult: 1.0,
    weekendMult: 0.9,
    cvrBase: 0.032,
    aovBase: 58,
    trend: "flat",
  },
  {
    id: "shopping-all-products",
    name: "Shopping - All Products",
    campaignType: "SHOPPING",
    cpc: 0.65,
    baseSpend: 90,
    weekdayMult: 0.95,
    weekendMult: 1.15, // consumer shopping skews weekend
    cvrBase: 0.038,
    aovBase: 54,
    trend: "up", // deliberately trending up: budget + conversions ramp together
  },
  {
    id: "retargeting-web-visitors",
    name: "Retargeting - Web Visitors",
    campaignType: "DISPLAY",
    cpc: 0.5,
    baseSpend: 65,
    weekdayMult: 0.95,
    weekendMult: 1.1,
    cvrBase: 0.05,
    aovBase: 60,
    // deliberately trending down: spend stays roughly flat while audience
    // fatigue drags conversion rate down over the window — the "high
    // spend, declining sales" story for US-3, distinct from a small/new
    // campaign that's merely low-volume.
    trend: "fatigue",
  },
  {
    id: "display-prospecting",
    name: "Display - Prospecting",
    campaignType: "DISPLAY",
    cpc: 0.32,
    baseSpend: 38,
    weekdayMult: 1.0,
    weekendMult: 1.0,
    cvrBase: 0.002,
    aovBase: 50,
    // deliberately the "bad" campaign: consistent spend, next to no
    // attributed conversions across the whole window (US-2/US-3 edge case).
    trend: "flat-bad",
  },
];

/** Public campaign metadata, shaped like what a Google Ads API response would expose. */
export const googleAdsCampaigns = CAMPAIGN_CONFIG.map((c) => ({
  id: c.id,
  name: c.name,
  campaignType: c.campaignType,
  status: "ENABLED",
  utmSource: "google",
  utmMedium: "cpc",
  utmCampaign: c.id,
}));

// ============================================================
// GA4 channel configuration (non-paid channels; Paid Search is derived
// from the Google Ads campaign data below, not generated independently)
// ============================================================

export const ga4Channels = [
  "Paid Search",
  "Organic Search",
  "Direct",
  "Referral",
  "Social",
];

const CHANNEL_CONFIG = [
  {
    name: "Organic Search",
    baseSessions: 230,
    weekdayMult: 1.05,
    weekendMult: 0.88,
    cvrBase: 0.022,
    aovBase: 62,
    sessionSource: "google",
    sessionMedium: "organic",
    trend: (t) => 0.92 + 0.16 * t, // slow, steady SEO improvement over the window
  },
  {
    name: "Direct",
    baseSessions: 150,
    weekdayMult: 1.0,
    weekendMult: 1.0,
    cvrBase: 0.03,
    aovBase: 66,
    sessionSource: "(direct)",
    sessionMedium: "(none)",
    trend: () => 1,
  },
  {
    name: "Referral",
    baseSessions: 55,
    weekdayMult: 1.0,
    weekendMult: 0.95,
    cvrBase: 0.018,
    aovBase: 50,
    sessionSource: "partner-blog.com",
    sessionMedium: "referral",
    trend: () => 1,
  },
  {
    name: "Social",
    baseSessions: 95,
    weekdayMult: 0.9,
    weekendMult: 1.25, // social browsing skews weekend
    cvrBase: 0.011,
    aovBase: 42,
    sessionSource: "facebook",
    sessionMedium: "social",
    trend: () => 1,
  },
];

// ============================================================
// Daily data generation
// ============================================================

export const googleAdsDaily = [];
export const ga4Daily = [];
export const shopifyDaily = [];

for (let i = 0; i < WINDOW_DAYS; i++) {
  const date = addDays(START_DATE, i);
  const dateKey = DATE_KEYS[i];
  const weekend = isWeekend(date);
  const t = i / (WINDOW_DAYS - 1); // 0 -> 1 across the window, used for trends
  const promo = i % 14 === 6; // a sitewide promo day roughly every two weeks
  const isZeroConversionDay = i === ZERO_CONVERSION_DAY_INDEX;

  // ---------------- Google Ads: one record per campaign per day ----------------
  const dayCampaignRecords = [];
  for (const c of CAMPAIGN_CONFIG) {
    const dayMult = weekend ? c.weekendMult : c.weekdayMult;

    let spendTrendMult = 1;
    if (c.trend === "up") spendTrendMult = 0.75 + 0.65 * t; // ramps 0.75x -> 1.4x

    const spendNoise = 0.85 + rng() * 0.3;
    let spend = c.baseSpend * dayMult * spendTrendMult * spendNoise;
    if (promo) spend *= 1.1; // slightly higher spend/competition during sitewide promos
    spend = round2(spend);

    const clickNoise = 0.9 + rng() * 0.2;
    const clicks = Math.max(0, Math.round((spend / c.cpc) * clickNoise));

    let cvr;
    if (c.trend === "fatigue") {
      // audience fatigue: conversion rate decays from ~1.3x base to ~0.4x base
      cvr = c.cvrBase * (1.3 - 0.9 * t) * (0.85 + rng() * 0.3);
    } else if (c.trend === "flat-bad") {
      // near-zero conversions on the large majority of days by design
      cvr = rng() < 0.88 ? 0 : c.cvrBase * (0.5 + rng());
    } else {
      cvr = c.cvrBase * (0.85 + rng() * 0.3);
    }
    cvr = clampMin(cvr);

    let conversions = Math.round(clicks * cvr);
    const aov = c.aovBase * (0.9 + rng() * 0.2) * (promo ? 0.92 : 1);
    let conversionValue = round2(conversions * aov);

    if (isZeroConversionDay) {
      conversions = 0;
      conversionValue = 0;
    }

    const record = {
      date: dateKey,
      campaignId: c.id,
      campaignName: c.name,
      spend,
      clicks,
      conversions,
      conversionValue,
    };
    dayCampaignRecords.push(record);
    googleAdsDaily.push(record);
  }

  // ---------------- GA4 "Paid Search" (derived from the campaigns above) ----------------
  const totalClicks = sumBy(dayCampaignRecords, "clicks");
  const totalConv = sumBy(dayCampaignRecords, "conversions");
  const totalConvValue = sumBy(dayCampaignRecords, "conversionValue");

  let paidSessions = Math.round(totalClicks * (0.93 + rng() * 0.09));
  if (totalClicks > 0 && paidSessions === 0) paidSessions = 1;
  const paidUsers = Math.round(paidSessions * (0.82 + rng() * 0.12));
  // GA4's own conversion/revenue counting is close to, but not identical
  // to, Google Ads' — a realistic cross-provider reconciliation quirk.
  const paidConversions = Math.round(totalConv * (0.92 + rng() * 0.13));
  const paidRevenue = round2(totalConvValue * (0.88 + rng() * 0.14));

  const campaignBreakdown = dayCampaignRecords.map((r) => {
    const clickShare = totalClicks > 0 ? r.clicks / totalClicks : 0;
    const convShare = totalConv > 0 ? r.conversions / totalConv : 0;
    const revShare = totalConvValue > 0 ? r.conversionValue / totalConvValue : 0;
    return {
      campaignId: r.campaignId,
      campaignName: r.campaignName,
      sessionSource: "google",
      sessionMedium: "cpc",
      sessionCampaignName: r.campaignName,
      sessions: Math.round(paidSessions * clickShare),
      conversions: Math.round(paidConversions * convShare),
      purchaseRevenue: round2(paidRevenue * revShare),
    };
  });

  const paidSearchRecord = {
    date: dateKey,
    channel: "Paid Search",
    sessionSource: "google",
    sessionMedium: "cpc",
    sourceMedium: "google / cpc",
    sessions: paidSessions,
    users: paidUsers,
    conversions: paidConversions,
    purchaseRevenue: paidRevenue,
    // Per-campaign breakdown so Paid Search traffic/conversions/revenue can
    // be traced back to the exact Google Ads campaign that drove them.
    campaignBreakdown,
  };
  ga4Daily.push(paidSearchRecord);

  // ---------------- GA4: the other four channel groupings ----------------
  const otherChannelRecords = [];
  for (const ch of CHANNEL_CONFIG) {
    const dayMult = weekend ? ch.weekendMult : ch.weekdayMult;
    const trendMult = ch.trend(t);
    const noise = 0.85 + rng() * 0.3;

    let sessions = ch.baseSessions * dayMult * trendMult * noise;
    if (promo) sessions *= 1.15; // sitewide promos lift all traffic, not just paid
    sessions = Math.max(0, Math.round(sessions));

    const users = Math.round(sessions * (0.8 + rng() * 0.15));
    const cvrNoise = 0.8 + rng() * 0.4;
    const conversions = Math.round(
      sessions * ch.cvrBase * cvrNoise * (promo ? 1.2 : 1),
    );
    const aov = ch.aovBase * (0.9 + rng() * 0.2) * (promo ? 0.9 : 1);
    const purchaseRevenue = round2(conversions * aov);

    const record = {
      date: dateKey,
      channel: ch.name,
      sessionSource: ch.sessionSource,
      sessionMedium: ch.sessionMedium,
      sourceMedium: `${ch.sessionSource} / ${ch.sessionMedium}`,
      sessions,
      users,
      conversions,
      purchaseRevenue,
    };
    otherChannelRecords.push(record);
    ga4Daily.push(record);
  }

  // ---------------- Shopify: one aggregate order record per day ----------------
  const allChannelRecordsForDay = [paidSearchRecord, ...otherChannelRecords];
  const totalGA4Conversions = sumBy(allChannelRecordsForDay, "conversions");
  const totalGA4Revenue = sumBy(allChannelRecordsForDay, "purchaseRevenue");

  // Orders placed without an attributable GA4 session (phone orders, typed
  // URLs with no UTM, etc.) — a realistic tracking-gap quirk.
  const untrackedRate = 0.03 + rng() * 0.05;
  const untrackedOrders = Math.round(totalGA4Conversions * untrackedRate);
  const blendedAov = totalGA4Conversions > 0 ? totalGA4Revenue / totalGA4Conversions : 55;
  const untrackedRevenue = round2(untrackedOrders * blendedAov);

  const orders = totalGA4Conversions + untrackedOrders;
  const netBeforeRefunds = round2(totalGA4Revenue + untrackedRevenue);

  const discountRate = promo ? 0.18 + rng() * 0.08 : 0.04 + rng() * 0.08;
  const grossRevenue = netBeforeRefunds > 0 ? round2(netBeforeRefunds / (1 - discountRate)) : 0;
  const discounts = round2(grossRevenue - netBeforeRefunds);

  const refundSpike = rng() < 0.08; // occasional heavier-return day
  const refundRate = refundSpike ? 0.08 + rng() * 0.06 : 0.015 + rng() * 0.02;
  const refunds = round2(grossRevenue * refundRate);

  // Net is always derived last so `net === gross - discounts - refunds`
  // holds exactly, matching the confirmed revenue definition in
  // PROJECT_BRIEF.md (2026-07-17).
  const netRevenue = round2(grossRevenue - discounts - refunds);

  shopifyDaily.push({
    date: dateKey,
    orders,
    untrackedOrders,
    grossRevenue,
    discounts,
    refunds,
    netRevenue,
  });
}

// ============================================================
// Lookup indices (built once, reused by the helper functions below)
// ============================================================

const shopifyByDate = new Map(shopifyDaily.map((r) => [r.date, r]));
const ga4ByDateChannel = new Map(ga4Daily.map((r) => [`${r.date}|${r.channel}`, r]));

/** Per-day totals across all five GA4 channel groupings combined. */
const ga4TotalsByDate = new Map();
for (const r of ga4Daily) {
  const cur = ga4TotalsByDate.get(r.date) || {
    sessions: 0,
    users: 0,
    conversions: 0,
    purchaseRevenue: 0,
  };
  cur.sessions += r.sessions;
  cur.users += r.users;
  cur.conversions += r.conversions;
  cur.purchaseRevenue += r.purchaseRevenue;
  ga4TotalsByDate.set(r.date, cur);
}

// ============================================================
// Helper functions — pure aggregations over the fixtures above.
// All accept Date objects or "YYYY-MM-DD" strings for date params.
// ============================================================

function normalizePeriod(period) {
  if (Array.isArray(period)) {
    return { start: toDateKey(period[0]), end: toDateKey(period[1]) };
  }
  return { start: toDateKey(period.start), end: toDateKey(period.end) };
}

/**
 * Total Google Ads spend and Shopify-sourced attributed revenue for a
 * date range (inclusive).
 *
 * Per Decision 1 (docs/requirements-v1.md Section 5): GA4 determines
 * *which* sales are attributable to ads — here, each day's Paid Search
 * share of that day's total GA4-tracked purchase revenue — while the
 * dollar figure itself is Shopify's actual net revenue (gross - discounts
 * - refunds) for that day, not Google Ads' or GA4's own modeled value.
 *
 * @param {Date|string} startDate
 * @param {Date|string} endDate
 * @returns {{startDate: string, endDate: string, spend: number, revenue: number, orders: number, roas: number|null}}
 */
export function getSpendAndRevenue(startDate, endDate) {
  const startKey = toDateKey(startDate);
  const endKey = toDateKey(endDate);

  const spend = round2(
    sumBy(
      googleAdsDaily.filter((r) => inRange(r.date, startKey, endKey)),
      "spend",
    ),
  );

  let revenue = 0;
  let orders = 0;
  for (const dateKey of DATE_KEYS) {
    if (!inRange(dateKey, startKey, endKey)) continue;
    const shopifyRecord = shopifyByDate.get(dateKey);
    const dayTotals = ga4TotalsByDate.get(dateKey);
    const paidSearch = ga4ByDateChannel.get(`${dateKey}|Paid Search`);
    if (!shopifyRecord || !dayTotals || !paidSearch || dayTotals.purchaseRevenue <= 0) {
      continue; // e.g. the deliberate zero-conversion day: nothing attributable
    }
    const share = paidSearch.purchaseRevenue / dayTotals.purchaseRevenue;
    revenue += shopifyRecord.netRevenue * share;
    orders += shopifyRecord.orders * share;
  }
  revenue = round2(revenue);
  orders = Math.round(orders);

  return {
    startDate: startKey,
    endDate: endKey,
    spend,
    revenue,
    orders,
    roas: spend > 0 ? round2(revenue / spend) : null,
  };
}

/**
 * Ranks Google Ads campaigns over a date range by 'revenue' or 'orders'.
 * Every entry always includes both figures (plus spend and ROAS) — per
 * Decision 3, broad ranking questions surface revenue + order count
 * together; callers that only need one metric can read that field.
 *
 * Campaign-level revenue is reconciled to Shopify's actual dollar figure:
 * the period's total Shopify-attributed Paid Search revenue (from
 * getSpendAndRevenue) is distributed across campaigns proportionally to
 * each campaign's share of Google Ads' own reported conversion value,
 * consistent with Decision 1 (Shopify supplies the dollar figure; GA4/Ads
 * data determines the split).
 *
 * @param {Date|string} startDate
 * @param {Date|string} endDate
 * @param {'revenue'|'orders'} [metric='revenue']
 */
export function getCampaignRanking(startDate, endDate, metric = "revenue") {
  const startKey = toDateKey(startDate);
  const endKey = toDateKey(endDate);
  const sortMetric = metric === "orders" ? "orders" : "revenue";

  const byCampaign = new Map(
    googleAdsCampaigns.map((c) => [
      c.id,
      { campaignId: c.id, campaignName: c.name, spend: 0, orders: 0, adsConversionValue: 0 },
    ]),
  );

  for (const r of googleAdsDaily) {
    if (!inRange(r.date, startKey, endKey)) continue;
    const entry = byCampaign.get(r.campaignId);
    entry.spend += r.spend;
    entry.orders += r.conversions;
    entry.adsConversionValue += r.conversionValue;
  }

  const { revenue: attributedRevenue } = getSpendAndRevenue(startKey, endKey);
  const totalAdsConversionValue = sumBy([...byCampaign.values()], "adsConversionValue");

  const results = [...byCampaign.values()].map((e) => {
    const revenueShare =
      totalAdsConversionValue > 0 ? e.adsConversionValue / totalAdsConversionValue : 0;
    const revenue = round2(attributedRevenue * revenueShare);
    const spend = round2(e.spend);
    return {
      campaignId: e.campaignId,
      campaignName: e.campaignName,
      spend,
      orders: e.orders,
      revenue,
      roas: spend > 0 ? round2(revenue / spend) : null,
    };
  });

  results.sort((a, b) => b[sortMetric] - a[sortMetric]);
  return results.map((r, i) => ({ rank: i + 1, ...r }));
}

function summarizePeriod({ start, end }) {
  let sessions = 0;
  let users = 0;
  let conversions = 0;
  for (const r of ga4Daily) {
    if (!inRange(r.date, start, end)) continue;
    sessions += r.sessions;
    users += r.users;
    conversions += r.conversions;
  }
  const conversionRate = sessions > 0 ? round4(conversions / sessions) : null;
  return { start, end, sessions, users, conversions, conversionRate };
}

/**
 * Compares site-wide (all-channel) traffic-to-conversion rate between two
 * periods — the aggregation US-4 needs ("is my traffic converting better
 * this month than last?"). Each period may be given as {start, end} or
 * [start, end] (Date objects or "YYYY-MM-DD" strings); lengths need not
 * match.
 *
 * @param {{start: Date|string, end: Date|string}|[Date|string, Date|string]} periodA
 * @param {{start: Date|string, end: Date|string}|[Date|string, Date|string]} periodB
 */
export function getConversionRateTrend(periodA, periodB) {
  const a = summarizePeriod(normalizePeriod(periodA));
  const b = summarizePeriod(normalizePeriod(periodB));

  let direction = "flat";
  let absoluteChange = null;
  let relativePercentChange = null;
  if (a.conversionRate !== null && b.conversionRate !== null) {
    absoluteChange = round4(a.conversionRate - b.conversionRate);
    relativePercentChange =
      b.conversionRate > 0 ? round2((absoluteChange / b.conversionRate) * 100) : null;
    direction = absoluteChange > 0.0001 ? "up" : absoluteChange < -0.0001 ? "down" : "flat";
  }

  return {
    periodA: a,
    periodB: b,
    change: { absolute: absoluteChange, relativePercent: relativePercentChange, direction },
  };
}

/**
 * Breaks out sessions, conversions, revenue, and conversion rate by GA4
 * channel grouping for a date range — the aggregation US-7 needs, with
 * Paid Search flagged via `isPaid` so paid traffic is clearly
 * distinguished from the rest.
 *
 * @param {Date|string} startDate
 * @param {Date|string} endDate
 */
export function getChannelConversionRates(startDate, endDate) {
  const startKey = toDateKey(startDate);
  const endKey = toDateKey(endDate);

  const byChannel = new Map(
    ga4Channels.map((ch) => [
      ch,
      { channel: ch, sessions: 0, users: 0, conversions: 0, purchaseRevenue: 0 },
    ]),
  );

  for (const r of ga4Daily) {
    if (!inRange(r.date, startKey, endKey)) continue;
    const entry = byChannel.get(r.channel);
    entry.sessions += r.sessions;
    entry.users += r.users;
    entry.conversions += r.conversions;
    entry.purchaseRevenue += r.purchaseRevenue;
  }

  const results = [...byChannel.values()].map((e) => ({
    channel: e.channel,
    isPaid: e.channel === "Paid Search",
    sessions: e.sessions,
    users: e.users,
    conversions: e.conversions,
    purchaseRevenue: round2(e.purchaseRevenue),
    conversionRate: e.sessions > 0 ? round4(e.conversions / e.sessions) : null,
  }));

  results.sort((a, b) => (b.conversionRate ?? -1) - (a.conversionRate ?? -1));
  return results;
}

// Re-exported for callers that want to point directly at the deliberate
// "spend but no attributable revenue" edge-case day without recomputing it.
export { ZERO_CONVERSION_DAY_KEY };
