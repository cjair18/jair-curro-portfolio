/**
 * reasoning.js
 * -----------------------------------------------------------------------
 * PullAd AI — the "AI reasoning layer," fully scripted/mocked.
 *
 * Per PROJECT_BRIEF.md (Key Decisions Log, 2026-07-17): this build has
 * ZERO live API calls of any kind. There is no Anthropic API key, no
 * network request, and no SDK dependency here. This module simulates the
 * "Claude interprets a plain-English question and decides what a
 * dashboard should show" behavior using plain JS keyword/pattern matching
 * against the 8 fixed user stories in docs/requirements-v1.md Section 2 —
 * NOT a real NLP/LLM call. It consumes the mock data helpers exported by
 * src/data/mockData.js exactly as they're shaped; nothing in that file is
 * modified here.
 *
 * Public API:
 *   answerQuestion(questionText, conversationContext) -> {
 *     matchedStory: 'US-1'..'US-8' | null,
 *     answerText: string,
 *     dashboardSpec: { type, title, data, xKey, yKeys, meta? } | null,
 *     followUp: boolean,        // true when this answer was produced by
 *                                // reusing a prior turn's story via a bare
 *                                // period follow-up (see below)
 *     context: { matchedStory } | null,  // pass this back in as
 *                                          // `conversationContext` on the
 *                                          // next call to support "now
 *                                          // show me last week"-style
 *                                          // follow-ups
 *     examples?: string[],      // present only on a "no match" result
 *   }
 *
 * Conversational follow-up mechanism (kept intentionally simple, per the
 * task's "very basic" instruction):
 *   1. Every result includes `context: { matchedStory }`.
 *   2. If the caller passes that object (or just `{ matchedStory: 'US-1' }`)
 *      back in as `conversationContext` on the next call, and the new
 *      question text is a "bare period phrase" (e.g. "now show me last
 *      week", "what about last month", or just "last month") with none of
 *      the story keywords that would otherwise match a story on its own,
 *      the previous turn's story is re-run against the new period.
 *   3. This is pure text-substitution re-use, not real memory of prior
 *      numbers — each call still recomputes everything fresh from
 *      mockData.js for the new period.
 * -----------------------------------------------------------------------
 */

import {
  TODAY,
  START_DATE,
  DATE_KEYS,
  googleAdsCampaigns,
  googleAdsDaily,
  shopifyDaily,
  getSpendAndRevenue,
  getCampaignRanking,
  getConversionRateTrend,
  getChannelConversionRates,
} from "../data/mockData.js";

// ============================================================
// Small formatting / math helpers
// ============================================================

function r2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function cap(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function fmtUSD(n) {
  const value = Number.isFinite(n) ? n : 0;
  const digits = Number.isInteger(value) ? 0 : 2;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

function fmtPct(fraction) {
  if (fraction === null || fraction === undefined) return "N/A";
  return `${r2(fraction * 100)}%`;
}

// ============================================================
// Date / calendar-period helpers
// -----------------------------------------------------------------------
// All time periods are calendar-based (Mon-Sun weeks, calendar months),
// using the device's local timezone, per the confirmed decision in
// PROJECT_BRIEF.md / docs/requirements-v1.md Decision 4. Plain JS
// Date math only, no timezone library. Anchored to mockData's exported
// TODAY/START_DATE so the resolved periods always line up with the
// window the mock fixtures actually cover.
// ============================================================

function toKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

function humanDate(d) {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function addDaysLocal(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function mondayOf(date) {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sun
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function sundayOf(date) {
  const m = mondayOf(date);
  return addDaysLocal(m, 6);
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

/**
 * Resolves one of the six supported relative-period phrases into a
 * concrete { start, end } Date range plus display label.
 *
 * "this week"/"this month" are calendar-based but capped at TODAY (the
 * mock data window's last day) rather than running into the future —
 * this is the "partial-period" edge case called out for US-1 in
 * requirements-v1.md (e.g. asking about "this week" on a Tuesday).
 */
function resolvePeriodPhrase(key) {
  let start, end, label;
  let partial = false;

  switch (key) {
    case "today":
      start = TODAY;
      end = TODAY;
      label = "today";
      break;
    case "yesterday":
      start = addDaysLocal(TODAY, -1);
      end = start;
      label = "yesterday";
      break;
    case "this week": {
      start = mondayOf(TODAY);
      end = TODAY;
      label = "this week";
      partial = toKey(end) !== toKey(sundayOf(TODAY));
      break;
    }
    case "last week": {
      const lastMon = addDaysLocal(mondayOf(TODAY), -7);
      start = lastMon;
      end = addDaysLocal(lastMon, 6);
      label = "last week";
      break;
    }
    case "this month": {
      start = startOfMonth(TODAY);
      end = TODAY;
      label = "this month";
      partial = toKey(end) !== toKey(endOfMonth(TODAY));
      break;
    }
    case "last month": {
      const prevAnchor = new Date(TODAY.getFullYear(), TODAY.getMonth() - 1, 1);
      start = startOfMonth(prevAnchor);
      end = endOfMonth(prevAnchor);
      label = "last month";
      break;
    }
    default:
      // Unrecognized/omitted period phrase — default to "this week" so
      // callers always get a usable range.
      start = mondayOf(TODAY);
      end = TODAY;
      label = "this week";
  }

  let clamped = false;
  if (start < START_DATE) {
    start = new Date(START_DATE);
    clamped = true;
  }
  if (end > TODAY) end = new Date(TODAY);

  return {
    start,
    end,
    startKey: toKey(start),
    endKey: toKey(end),
    label,
    labelCap: cap(label),
    partial,
    clamped,
  };
}

/** Immediately-prior period of equal length to `period` — used as the US-4
 * comparison baseline when the question only names one period explicitly
 * (per requirements-v1.md US-4 acceptance criteria). */
function priorEqualLength(period) {
  const days = Math.round((period.end.getTime() - period.start.getTime()) / 86400000) + 1;
  const end = addDaysLocal(period.start, -1);
  let start = addDaysLocal(end, -(days - 1));
  let clamped = false;
  if (start < START_DATE) {
    start = new Date(START_DATE);
    clamped = true;
  }
  const label = `the ${days}-day period before ${humanDate(period.start)}`;
  return {
    start,
    end,
    startKey: toKey(start),
    endKey: toKey(end),
    label,
    labelCap: cap(label),
    partial: false,
    clamped,
  };
}

const PERIOD_PATTERNS = [
  { key: "last week", re: /\blast week\b/i },
  { key: "this week", re: /\bthis week\b/i },
  { key: "last month", re: /\blast month\b/i },
  { key: "this month", re: /\bthis month\b/i },
  { key: "yesterday", re: /\byesterday\b/i },
  { key: "today", re: /\btoday\b/i },
];

/** All period phrases found in the text, in the order they appear. */
function findAllPeriodMatches(text) {
  const found = [];
  for (const p of PERIOD_PATTERNS) {
    const m = p.re.exec(text);
    if (m) found.push({ key: p.key, index: m.index });
  }
  found.sort((a, b) => a.index - b.index);
  return found.map((f) => f.key);
}

function findPeriodPhrase(text) {
  return findAllPeriodMatches(text)[0] || null;
}

// ============================================================
// Revenue/discount caveat helper (Decision 6, requirements-v1.md Section 5:
// revenue is net of discounts and refunds; when a discount materially
// affected the figure, say so rather than showing a bare number).
// ============================================================

function getDiscountNote(startKey, endKey) {
  let discounts = 0;
  let gross = 0;
  for (const r of shopifyDaily) {
    if (r.date < startKey || r.date > endKey) continue;
    discounts += r.discounts;
    gross += r.grossRevenue;
  }
  if (gross <= 0) return null;
  const rate = discounts / gross;
  if (rate < 0.15) return null; // negligible/baseline discounting — no need to call it out
  return `Note: discounts reduced revenue by about ${fmtUSD(r2(discounts))} (~${Math.round(
    rate * 100,
  )}%) in that period — likely a sitewide promo — so the figure above reflects what was actually collected, not list price.`;
}

/** Per-day {date, spend, revenue} series for a range, built by calling
 * getSpendAndRevenue once per day — used for US-1's dashboard trend. */
function buildDailySeries(startKey, endKey) {
  return DATE_KEYS.filter((k) => k >= startKey && k <= endKey).map((k) => {
    const { spend, revenue } = getSpendAndRevenue(k, k);
    return { date: k, spend, revenue };
  });
}

// ============================================================
// Question -> story matching (flexible keyword/pattern matching against
// the 8 user stories in docs/requirements-v1.md Section 2)
// ============================================================

const ROAS_RE = /\broas\b|\breturn on (my |the )?ad spend\b|\breturn on (my |the )?spend\b/i;
const BREAKDOWN_RE = /\b(split|breakdown|break down|broken down)\b/i;
const SPEND_WORD_RE = /\b(spend|spent|cost|budget)\b/i;
const SALES_WORD_RE = /\b(revenue|sales|sold|drove|drive|driving|generate[d]?|return|income)\b/i;
const WORST_RE = /\b(worst|underperform\w*|wasting|losing money|least (sales|revenue|money|orders)|cut)\b/i;
const BEST_RE = /\b(best|top|highest|most (sales|revenue|money|orders|profit))\b/i;
const CAMPAIGN_WORD_RE = /\bcampaign(s)?\b/i;
const CONVERT_RE = /\bconvert\w*\b|\bconversion rate\b/i;
const CHANNEL_NAMES_RE = /\b(organic|referral|social|channel(s)?|traffic source|paid traffic|paid search)\b/i;

/**
 * Matches question text against the 8 user stories. Returns 'US-1'..'US-8'
 * or null if nothing matches. Order encodes priority for phrases that
 * could plausibly hit more than one story (e.g. ROAS phrasing is checked
 * before the generic spend-vs-revenue fallback).
 */
function matchStoryKeywords(text) {
  if (ROAS_RE.test(text)) return "US-8";
  if (BREAKDOWN_RE.test(text) && SPEND_WORD_RE.test(text)) return "US-6";
  if (WORST_RE.test(text)) return "US-3";
  if (BEST_RE.test(text) && (CAMPAIGN_WORD_RE.test(text) || /\bwhich\b/i.test(text))) return "US-2";
  if (CONVERT_RE.test(text)) {
    return CHANNEL_NAMES_RE.test(text) ? "US-7" : "US-4";
  }
  if (/\btoday\b/i.test(text) && SPEND_WORD_RE.test(text) && SALES_WORD_RE.test(text)) return "US-5";
  if (SPEND_WORD_RE.test(text) && SALES_WORD_RE.test(text)) return "US-1";
  return null;
}

/** e.g. "now show me last week", "what about last month", or just
 * "last week" — a period phrase with no other story keywords, used for
 * the conversational follow-up mechanism. Returns the matched period key
 * or null. */
const BARE_PERIOD_RE =
  /^(?:(?:now|and|ok(?:ay)?|then|also)\s+)*(?:show me|what about|how about|tell me|give me|can you show(?: me)?|let'?s see)?\s*(?:the\s+)?(?:numbers?\s+for\s+)?(today|yesterday|this week|last week|this month|last month)'?s?[\s?!.,]*$/i;

function extractBarePeriodPhrase(text) {
  const m = BARE_PERIOD_RE.exec(text.trim());
  return m ? m[1].toLowerCase() : null;
}

function detectMetric(text) {
  const ordersOnly = /\border(s)?\b/i.test(text) && !/\b(revenue|money|sales|profit)\b/i.test(text);
  const revenueOnly = /\b(revenue|money|sales|profit)\b/i.test(text) && !/\border(s)?\b/i.test(text);
  if (ordersOnly) return "orders";
  if (revenueOnly) return "revenue";
  return "both";
}

// ============================================================
// Story builders — each takes the raw question text and returns
// { answerText, dashboardSpec }.
// ============================================================

// ---- US-1: Spend vs. Revenue Over a Period --------------------------------
function buildUS1(text) {
  const period = resolvePeriodPhrase(findPeriodPhrase(text) || "this week");
  const { spend, revenue, orders, roas } = getSpendAndRevenue(period.start, period.end);
  const discountNote = getDiscountNote(period.startKey, period.endKey);

  let answerText;
  if (spend <= 0 && revenue <= 0) {
    answerText = `You didn't have any Google Ads spend or attributed revenue ${period.label}.`;
  } else if (spend <= 0) {
    answerText = `You didn't spend anything on Google Ads ${period.label}, but ${fmtUSD(
      revenue,
    )} in revenue was still attributed to paid traffic in that period — worth double-checking your campaign status.`;
  } else if (revenue <= 0) {
    answerText = `You spent ${fmtUSD(spend)} on Google Ads ${period.label}, but it didn't drive any attributed revenue in that period.`;
  } else {
    answerText = `You spent ${fmtUSD(spend)} on Google Ads ${period.label}, which drove ${fmtUSD(
      revenue,
    )} in revenue across ${orders} order${orders === 1 ? "" : "s"} — a ${roas}x return.`;
  }
  if (period.partial) answerText += ` Since ${period.label} isn't finished yet, this reflects data through today only.`;
  if (period.clamped) answerText += ` (Mock data only goes back to ${humanDate(START_DATE)}, so the period starts there.)`;
  if (discountNote) answerText += ` ${discountNote}`;

  const series = buildDailySeries(period.startKey, period.endKey);
  const dashboardSpec = {
    type: series.length > 1 ? "line" : "bar",
    title: `Spend vs Revenue — ${period.labelCap}`,
    data: series,
    xKey: "date",
    yKeys: ["spend", "revenue"],
    meta: { spend, revenue, orders, roas },
  };
  return { answerText, dashboardSpec };
}

// ---- US-2 / US-3: Best / Worst-Performing Campaign -------------------------
function pickWorstCampaign(ranking) {
  const spending = ranking.filter((r) => r.spend > 0);
  if (spending.length === 0) return null;
  const avgSpend = spending.reduce((s, r) => s + r.spend, 0) / spending.length;
  const sorted = [...spending].sort((a, b) => (a.roas ?? 0) - (b.roas ?? 0));
  const worst = sorted[0];
  return { worst, avgSpend, isHighSpend: worst.spend > avgSpend };
}

function buildCampaignRankingAnswer(text, mode) {
  const period = resolvePeriodPhrase(findPeriodPhrase(text) || "yesterday");
  const metric = detectMetric(text);
  const rankMetric = metric === "orders" ? "orders" : "revenue";
  const ranking = getCampaignRanking(period.start, period.end, rankMetric);

  let answerText;
  if (mode === "best") {
    const top = ranking[0];
    const second = ranking[1];
    let closeNote = "";
    if (second && top[rankMetric] > 0) {
      if (top[rankMetric] === second[rankMetric]) {
        closeNote = ` It's tied with "${second.campaignName}" on this metric.`;
      } else if ((top[rankMetric] - second[rankMetric]) / top[rankMetric] < 0.1) {
        closeNote = ` "${second.campaignName}" was close behind.`;
      }
    }
    let metricPhrase;
    if (metric === "revenue") metricPhrase = `brought in the most revenue: ${fmtUSD(top.revenue)}`;
    else if (metric === "orders") metricPhrase = `had the most orders: ${top.orders}`;
    else
      metricPhrase = `performed best overall — ${fmtUSD(top.revenue)} in revenue and ${top.orders} order${
        top.orders === 1 ? "" : "s"
      }`;
    answerText = `${period.labelCap}, "${top.campaignName}" ${metricPhrase} (from ${fmtUSD(top.spend)} in spend${
      top.roas != null ? `, a ${top.roas}x return` : ""
    }).${closeNote}`;
  } else {
    if (metric === "both") {
      const info = pickWorstCampaign(ranking);
      if (!info) {
        answerText = `None of your campaigns had spend ${period.label}, so there's nothing to flag as underperforming.`;
      } else {
        const { worst, isHighSpend } = info;
        answerText = `Your worst-performing campaign ${period.label} is "${worst.campaignName}" — ${fmtUSD(
          worst.revenue,
        )} in revenue and ${worst.orders} order${worst.orders === 1 ? "" : "s"} from ${fmtUSD(
          worst.spend,
        )} in spend (${worst.roas}x return).`;
        answerText += isHighSpend
          ? ` That's relatively high spend for one of your campaigns, so this looks like genuine underperformance rather than just a small campaign.`
          : ` It's a lower-spend campaign, so this may just reflect its small size rather than active waste — worth watching before cutting it.`;
      }
    } else {
      const worst = ranking[ranking.length - 1];
      const metricLabel =
        metric === "orders" ? `${worst.orders} order${worst.orders === 1 ? "" : "s"}` : fmtUSD(worst.revenue);
      answerText = `"${worst.campaignName}" had the lowest ${
        metric === "orders" ? "order count" : "revenue"
      } ${period.label} — ${metricLabel} (spend: ${fmtUSD(worst.spend)}).`;
    }
  }

  if (metric !== "orders") {
    const discountNote = getDiscountNote(period.startKey, period.endKey);
    if (discountNote) answerText += ` ${discountNote}`;
  }

  const yKeys = metric === "both" ? ["revenue", "orders"] : [rankMetric];
  const dashboardSpec = {
    type: "bar",
    title: `${mode === "best" ? "Best" : "Worst"}-Performing Campaigns — ${period.labelCap}`,
    data: ranking.map((r) => ({
      campaignName: r.campaignName,
      revenue: r.revenue,
      orders: r.orders,
      spend: r.spend,
      roas: r.roas,
    })),
    xKey: "campaignName",
    yKeys,
  };
  return { answerText, dashboardSpec };
}

// ---- US-4: Traffic-to-Conversion Trend Comparison --------------------------
function buildUS4(text) {
  const matches = findAllPeriodMatches(text);
  let periodAKey = matches[0] || null;
  let periodBKey = matches[1] || null;

  // Handle the elliptical phrasing from the doc's own example prompt —
  // "converting better this month than last" — where the second period's
  // unit (week/month) is implied rather than repeated after "last". If we
  // only found one explicit period phrase but the text pairs it with a
  // bare "than last"/"vs last" (no trailing "week"/"month"), infer periodB
  // uses the same calendar unit as periodA.
  if (periodAKey && !periodBKey) {
    const unitMatch = /\bthis (week|month)\b/i.exec(text);
    const hasBareLast =
      /\b(?:than|vs\.?|versus)\s+last\b(?!\s+(week|month))/i.test(text);
    if (unitMatch && hasBareLast) {
      periodBKey = `last ${unitMatch[1].toLowerCase()}`;
    }
  }

  let periodA, periodB;
  if (periodAKey && periodBKey) {
    periodA = resolvePeriodPhrase(periodAKey);
    periodB = resolvePeriodPhrase(periodBKey);
  } else {
    periodA = resolvePeriodPhrase(periodAKey || "this month");
    periodB = priorEqualLength(periodA);
  }

  const trend = getConversionRateTrend(
    { start: periodA.startKey, end: periodA.endKey },
    { start: periodB.startKey, end: periodB.endKey },
  );
  const a = trend.periodA;
  const b = trend.periodB;
  const { direction, relativePercent } = trend.change;

  let answerText;
  if (a.conversionRate == null || b.conversionRate == null) {
    answerText = `There isn't enough traffic in one of those periods to reliably compare conversion rates.`;
  } else {
    const dirPhrase = direction === "up" ? "improved" : direction === "down" ? "declined" : "stayed essentially flat";
    answerText = `Your site-wide conversion rate ${periodA.label} was ${fmtPct(a.conversionRate)}, versus ${fmtPct(
      b.conversionRate,
    )} for ${periodB.label} — that's ${dirPhrase}${
      relativePercent != null ? ` (${relativePercent > 0 ? "+" : ""}${relativePercent}%)` : ""
    }.`;
    answerText += ` For reference, traffic volume was ${a.sessions.toLocaleString()} sessions ${
      periodA.label
    } vs ${b.sessions.toLocaleString()} for ${periodB.label} — that's a separate number from how well that traffic converted.`;
  }

  const dashboardSpec = {
    type: "bar",
    title: `Conversion Rate: ${periodA.labelCap} vs ${periodB.label}`,
    data: [
      {
        name: periodA.label,
        conversionRate: a.conversionRate != null ? r2(a.conversionRate * 100) : 0,
        sessions: a.sessions,
      },
      {
        name: periodB.label,
        conversionRate: b.conversionRate != null ? r2(b.conversionRate * 100) : 0,
        sessions: b.sessions,
      },
    ],
    xKey: "name",
    yKeys: ["conversionRate"],
  };
  return { answerText, dashboardSpec };
}

// ---- US-5: Same-Day Spend vs. Sales -----------------------------------------
function buildUS5() {
  const { spend, revenue, orders, roas } = getSpendAndRevenue(TODAY, TODAY);
  const nowStr = new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

  let answerText = `As of ${nowStr} today, you've spent ${fmtUSD(spend)} on Google Ads and brought in ${fmtUSD(
    revenue,
  )} in attributed revenue (${orders} order${orders === 1 ? "" : "s"} so far)`;
  answerText += spend > 0 && revenue > 0 ? `, roughly a ${roas}x same-day return so far.` : ".";
  answerText += ` Keep in mind today's numbers are still coming in — ad platform and sales reporting both lag a bit through the day, so both figures will likely change as more data arrives.`;

  const dashboardSpec = {
    type: "bar",
    title: "Today's Spend vs Sales (partial day)",
    data: [
      { name: "Spend", value: spend },
      { name: "Sales", value: revenue },
    ],
    xKey: "name",
    yKeys: ["value"],
    meta: { spend, revenue, orders, roas, partial: true },
  };
  return { answerText, dashboardSpec };
}

// ---- US-6: Spend Breakdown by Campaign/Channel ------------------------------
const CAMPAIGN_ALIASES = {
  brand: "search-brand",
  generic: "search-generic",
  shopping: "shopping-all-products",
  retargeting: "retargeting-web-visitors",
  prospecting: "display-prospecting",
};

function buildUS6(text) {
  const period = resolvePeriodPhrase(findPeriodPhrase(text) || "this month");

  let narrowId = null;
  for (const [alias, id] of Object.entries(CAMPAIGN_ALIASES)) {
    if (new RegExp(`\\b${alias}\\b`, "i").test(text)) {
      narrowId = id;
      break;
    }
  }

  const totalsByCampaign = new Map(
    googleAdsCampaigns.map((c) => [c.id, { campaignId: c.id, campaignName: c.name, spend: 0 }]),
  );
  for (const r of googleAdsDaily) {
    if (r.date < period.startKey || r.date > period.endKey) continue;
    totalsByCampaign.get(r.campaignId).spend += r.spend;
  }
  const breakdown = [...totalsByCampaign.values()]
    .map((r) => ({ ...r, spend: r2(r.spend) }))
    .sort((a, b) => b.spend - a.spend);
  const total = r2(breakdown.reduce((s, r) => s + r.spend, 0));

  let answerText;
  let dashboardSpec;
  if (narrowId) {
    const row = breakdown.find((r) => r.campaignId === narrowId);
    const pct = total > 0 ? r2((row.spend / total) * 100) : 0;
    answerText = `"${row.campaignName}" spent ${fmtUSD(row.spend)} ${period.label}, which is about ${pct}% of your total ${fmtUSD(
      total,
    )} in ad spend for that period.`;
    dashboardSpec = {
      type: "bar",
      title: `${row.campaignName} Spend — ${period.labelCap}`,
      data: [{ campaignName: row.campaignName, spend: row.spend }],
      xKey: "campaignName",
      yKeys: ["spend"],
    };
  } else {
    const lines = breakdown
      .map((r) => `${r.campaignName}: ${fmtUSD(r.spend)}${total > 0 ? ` (${r2((r.spend / total) * 100)}%)` : ""}`)
      .join("; ");
    answerText = `${period.labelCap} you spent ${fmtUSD(total)} total on Google Ads, split across campaigns as follows — ${lines}.`;
    dashboardSpec = {
      type: "pie",
      title: `Ad Spend by Campaign — ${period.labelCap}`,
      data: breakdown,
      xKey: "campaignName",
      yKeys: ["spend"],
    };
  }
  return { answerText, dashboardSpec };
}

// ---- US-7: Conversion Rate by Traffic Source/Channel ------------------------
function buildUS7(text) {
  const period = resolvePeriodPhrase(findPeriodPhrase(text) || "this month");
  const channels = getChannelConversionRates(period.start, period.end);
  const paid = channels.find((c) => c.isPaid);
  const mentionsOrganic = /\borganic\b/i.test(text);

  let answerText;
  if (mentionsOrganic) {
    const organic = channels.find((c) => c.channel === "Organic Search");
    if (!paid || !organic || paid.conversionRate == null || organic.conversionRate == null) {
      answerText = `I don't have enough traffic in that period to compare paid and organic conversion rates reliably.`;
    } else {
      const better = paid.conversionRate >= organic.conversionRate ? "paid" : "organic";
      const diffPct =
        organic.conversionRate > 0
          ? r2((Math.abs(paid.conversionRate - organic.conversionRate) / organic.conversionRate) * 100)
          : null;
      answerText = `${period.labelCap} your paid traffic converted at ${fmtPct(
        paid.conversionRate,
      )} versus ${fmtPct(organic.conversionRate)} for organic — ${
        better === "paid" ? "paid is outperforming organic" : "organic is actually outperforming your paid traffic"
      }${diffPct != null ? ` by about ${diffPct}%` : ""}.`;
    }
  } else {
    const withRate = channels.filter((c) => c.conversionRate != null);
    const ranked = withRate.map((c) => `${c.channel} (${fmtPct(c.conversionRate)})`).join(", ");
    const paidRank = paid ? withRate.findIndex((c) => c.channel === "Paid Search") + 1 : null;
    answerText = `${period.labelCap} conversion rates by channel, highest to lowest: ${ranked}.`;
    if (paidRank) answerText += ` Your paid traffic (Google Ads) ranks #${paidRank} of ${withRate.length}.`;
  }

  const dashboardSpec = {
    type: "bar",
    title: `Conversion Rate by Channel — ${period.labelCap}`,
    data: channels.map((c) => ({
      channel: c.channel,
      conversionRate: c.conversionRate != null ? r2(c.conversionRate * 100) : 0,
      revenue: c.purchaseRevenue,
      isPaid: c.isPaid,
    })),
    xKey: "channel",
    yKeys: ["conversionRate"],
  };
  return { answerText, dashboardSpec };
}

// ---- US-8: Return on Ad Spend (ROAS) Snapshot -------------------------------
function buildUS8(text) {
  const period = resolvePeriodPhrase(findPeriodPhrase(text) || "this month");
  const { spend, revenue, roas } = getSpendAndRevenue(period.start, period.end);
  const discountNote = getDiscountNote(period.startKey, period.endKey);

  let answerText;
  if (spend <= 0) {
    answerText = `You didn't spend anything on Google Ads ${period.label}, so ROAS isn't defined for that period.`;
  } else if (revenue <= 0) {
    answerText = `You spent ${fmtUSD(spend)} on Google Ads ${period.label}, but it drove $0 in attributed revenue — a 0x return right now.`;
  } else {
    answerText = `Your return on ad spend ${period.label} is ${roas}x — that's about ${fmtUSD(
      roas,
    )} in revenue for every $1 spent (${fmtUSD(spend)} spent, ${fmtUSD(revenue)} in revenue).`;
  }
  if (period.partial) answerText += ` Since ${period.label} isn't finished yet, this is based on data through today only.`;
  if (period.clamped) answerText += ` (Mock data only goes back to ${humanDate(START_DATE)}, so the period starts there.)`;
  if (discountNote) answerText += ` ${discountNote}`;

  const dashboardSpec = {
    type: "bar",
    title: `Return on Ad Spend — ${period.labelCap}`,
    data: [
      { name: "Spend", value: spend },
      { name: "Revenue", value: revenue },
    ],
    xKey: "name",
    yKeys: ["value"],
    meta: { spend, revenue, roas },
  };
  return { answerText, dashboardSpec };
}

// ============================================================
// Story registry, "no match" fallback, and the public entry point
// ============================================================

const STORY_HANDLERS = {
  "US-1": buildUS1,
  "US-2": (text) => buildCampaignRankingAnswer(text, "best"),
  "US-3": (text) => buildCampaignRankingAnswer(text, "worst"),
  "US-4": buildUS4,
  "US-5": buildUS5,
  "US-6": buildUS6,
  "US-7": buildUS7,
  "US-8": buildUS8,
};

/** Example prompts borrowed verbatim from docs/requirements-v1.md Section 2,
 * one per user story, surfaced when a question isn't understood. */
export const EXAMPLE_QUESTIONS = [
  "How much did I spend on Google Ads this week, and how much revenue did it drive?",
  "Which campaign brought in the most sales yesterday?",
  "Which campaign is wasting my money this month?",
  "Is my website traffic converting better this month than last?",
  "How does today's ad spend compare to today's sales?",
  "How is my ad spend split across campaigns this month?",
  "Is my paid traffic converting better than my organic traffic this month?",
  "What's my return on ad spend this month?",
];

function noMatchResult(err) {
  if (err) {
    // eslint-disable-next-line no-console
    console.error("[reasoning] unexpected error while answering question:", err);
  }
  return {
    matchedStory: null,
    answerText:
      "I wasn't able to match that to a question I can answer yet. Here are some things you can ask me:",
    dashboardSpec: null,
    followUp: false,
    examples: EXAMPLE_QUESTIONS,
    context: null,
  };
}

/**
 * Main entry point. Matches `questionText` against the 8 supported user
 * stories, resolves any relative time period mentioned, pulls real
 * numbers from mockData.js, and returns a structured answer + dashboard
 * spec. Never throws — unrecognized or malformed input returns a
 * graceful "no match" result instead.
 *
 * @param {string} questionText
 * @param {{matchedStory?: string, context?: {matchedStory?: string}}} [conversationContext]
 *   Pass the `context` field from the previous call's result back in here
 *   (or just `{ matchedStory: 'US-1' }`) to support bare-period follow-ups
 *   like "now show me last week".
 */
export function answerQuestion(questionText, conversationContext = {}) {
  try {
    if (typeof questionText !== "string" || !questionText.trim()) {
      return noMatchResult();
    }
    const text = questionText.trim();

    let story = matchStoryKeywords(text);
    let followUp = false;

    if (!story) {
      const barePhrase = extractBarePeriodPhrase(text);
      const prevStory =
        (conversationContext && conversationContext.matchedStory) ||
        (conversationContext && conversationContext.context && conversationContext.context.matchedStory) ||
        null;
      if (barePhrase && prevStory && STORY_HANDLERS[prevStory]) {
        story = prevStory;
        followUp = true;
      } else {
        return noMatchResult();
      }
    }

    const built = STORY_HANDLERS[story](text);
    return {
      matchedStory: story,
      answerText: built.answerText,
      dashboardSpec: built.dashboardSpec,
      followUp,
      context: { matchedStory: story },
    };
  } catch (err) {
    return noMatchResult(err);
  }
}
