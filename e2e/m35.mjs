// M35: the demo partner (dev tools, /pair "Mit Demo-Partner testen") – one person makes a couple with a made-up Sam,
// who is always free, says yes to a planned date at once (nothing goes to Google), likes every card and brings the
// test dates for the Archiv.
import { createCipheriv, createHash, randomBytes } from "node:crypto";
import { mkdirSync } from "node:fs";
import pg from "pg";
import { chromium } from "playwright";
import { tuesdayMorningOffset } from "./clock.mjs";
import { resetDb } from "./db.mjs";
import { backAtStart, pickIdea, SEND } from "./flow.mjs";
import { requests, startMock } from "./google-mock.mjs";

const BASE = "http://localhost:3000";
const OUT = new URL("./shots/", import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });
const KEY = Buffer.from(process.env.TOKEN_ENCRYPTION_KEY, "base64");
const encrypt = (text) => {
  const iv = randomBytes(12);
  const c = createCipheriv("aes-256-gcm", KEY, iv);
  const ct = Buffer.concat([c.update(text, "utf8"), c.final()]);
  return ["v1", iv, c.getAuthTag(), ct].map((p) => (typeof p === "string" ? p : p.toString("base64url"))).join(".");
};
await startMock(4010);
const db = new pg.Client({ connectionString: process.env.DATABASE_URL });
await db.connect();
await resetDb(db, "users, couples, sessions, ideas");
const { rows: [me] } = await db.query("INSERT INTO users (google_sub, email, name) VALUES ('sub-jonas', 'jonas@example.com', 'Jonas') RETURNING id");
const token = randomBytes(32).toString("base64url");
await db.query("INSERT INTO sessions (id, user_id, expires_at) VALUES ($1, $2, now() + interval '1 day')", [createHash("sha256").update(token).digest("hex"), me.id]);
await db.query(
  `INSERT INTO google_connections (user_id, refresh_token_enc, access_token_enc, access_token_expires_at, busy_calendar_ids)
   VALUES ($1, $2, $3, now() + interval '30 days', '{primary}')`,
  [me.id, encrypt("fake-refresh"), encrypt("token-jonas")],
);

let failures = 0;
const check = (label, ok) => {
  console.log(`${ok ? "✓" : "✗"} ${label}`);
  if (!ok) failures++;
};
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, locale: "de-DE" });
await ctx.addCookies([{ name: "dom_session", value: token, url: BASE }]);
const j = await ctx.newPage();
j.on("pageerror", (e) => console.log("PAGEERROR", e.message));

await j.goto(`${BASE}/pair`);
await j.getByRole("button", { name: "Mit Demo-Partner testen" }).click();
await j.waitForURL("**/welcome", { timeout: 20000 });
const { rows: [couple] } = await db.query("SELECT couple_id AS id FROM users WHERE id = $1", [me.id]);
const { rows: [sam] } = await db.query("SELECT id, google_sub, email FROM users WHERE couple_id = $1 AND id <> $2", [couple.id, me.id]);
check(`a made-up Sam joined the couple (${sam?.google_sub})`, sam?.google_sub.startsWith("demo:") && sam.email.endsWith("@zweisamen.invalid"));
const { rows: [demo] } = await db.query("SELECT count(*)::int AS n FROM cycles WHERE couple_id = $1 AND demo", [couple.id]);
check(`the Archiv has test dates (${demo.n} rounds)`, demo.n > 0);

// Round logic on a fixed weekday; one idea to plan, one card to swipe.
await db.query("UPDATE users SET onboarded_at = now() WHERE id = $1", [me.id]);
await db.query("UPDATE couple_settings SET dev_clock_offset_minutes = $2 WHERE couple_id = $1", [couple.id, tuesdayMorningOffset()]);
await db.query("INSERT INTO ideas (couple_id, title, size, created_by_id) VALUES ($1, 'Ramen in Ehrenfeld', 'small', $2)", [couple.id, me.id]);
await db.query("INSERT INTO deck_cards (couple_id, kind, title, size, dedupe_key, batch) VALUES ($1, 'idea', 'Minigolf', 'small', 'Minigolf', 1)", [couple.id]);

await j.goto(`${BASE}/plan`);
requests.length = 0;
await pickIdea(j, "Ramen in Ehrenfeld");
await j.getByRole("button", { name: SEND }).click();
await backAtStart(j, BASE);
const { rows: dates } = await db.query("SELECT d.status, d.google_event_id, d.sync_status FROM date_plans d JOIN cycles c ON c.id = d.cycle_id WHERE d.couple_id = $1 AND NOT c.demo", [couple.id]);
check(`Sam said yes at once, nothing went to Google (${JSON.stringify(dates)})`, dates.length === 1 && dates[0].status === "confirmed" && dates[0].google_event_id === null && dates[0].sync_status === "synced");
check("no event request to Google", !requests.some((r) => r.url.includes("/events")));
await j.goto(`${BASE}/plan`);
const head = await j.locator("main h2").filter({ visible: true }).first().innerText();
check(`the Beet says the date stands (${head.replace(/\s+/g, " ")})`, head.replace(/\s+/g, " ") === "date steht.");
await j.screenshot({ path: `${OUT}m35-01-steht.png` });

await j.goto(`${BASE}/ideas/entdecken`);
await j.getByRole("button", { name: "Einpflanzen" }).dispatchEvent("click");
await j.waitForTimeout(1500);
const { rows: [card] } = await db.query("SELECT status FROM deck_cards WHERE couple_id = $1 AND title = 'Minigolf'", [couple.id]);
check(`my like is a match – Sam likes everything (${card?.status})`, card?.status === "matched");

await j.goto(`${BASE}/dates`);
await j.locator("main").filter({ visible: true }).first().waitFor();
await j.waitForTimeout(500);
await j.screenshot({ path: `${OUT}m35-02-archiv.png` });

await browser.close();
await db.end();
console.log(failures ? `\n${failures} check(s) failed` : "\nAll checks passed");
process.exit(failures ? 1 : 0);
