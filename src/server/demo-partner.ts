// Demo partner (dev tools, ENABLE_DEV_TOOLS=1): one person can try the app for two. "Mit Demo-Partner testen" on
// /pair makes a couple with a made-up partner who never logs in: a calendar with nothing in it (no Google behind it),
// says yes to every date, likes every card and wants every date again. The Archiv gets the test dates
// (server/demo-dates.ts). Dates of a demo couple never go to Google Calendar (there is nobody to invite).
import "server-only";
import { eq } from "drizzle-orm";
import { createCouple } from "@/server/couples";
import { coupleNow } from "@/server/clock";
import { db } from "@/server/db";
import { couples, googleConnections, users, type User } from "@/server/db/schema";
import { addDemoDates } from "@/server/demo-dates";
import { getCoupleSettings } from "@/server/settings";

const DEMO_SUB = "demo:";
// `.invalid` can never be a real address (RFC 2606).
export const DEMO_EMAIL_DOMAIN = "@zweisamen.invalid";

export function isDemoUser(user: Pick<User, "googleSub">): boolean {
  return user.googleSub.startsWith(DEMO_SUB);
}

export async function createDemoCouple(user: User): Promise<void> {
  const couple = await createCouple(user.id);
  const [partner] = await db
    .insert(users)
    .values({
      coupleId: couple.id,
      googleSub: `${DEMO_SUB}${couple.id}`,
      email: `demo-${couple.id}${DEMO_EMAIL_DOMAIN}`,
      name: "Sam",
      color: "himmel",
      onboardedAt: new Date(),
    })
    .returning();
  await db.update(couples).set({ inviteCode: null, inviteExpiresAt: null }).where(eq(couples.id, couple.id));
  // No calendars to ask: always free (queryFreeBusy answers an empty list without Google), never a token used.
  await db.insert(googleConnections).values({ userId: partner.id, refreshTokenEnc: "", busyCalendarIds: [] });
  const now = coupleNow(await getCoupleSettings(couple.id));
  await addDemoDates({ user: { ...user, coupleId: couple.id }, partner, coupleId: couple.id }, now);
}
