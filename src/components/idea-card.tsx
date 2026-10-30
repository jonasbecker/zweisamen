import type { IdeaSize, PlaceSetting, UserColor } from "@/lib/domain";

/** What an idea card shows – on the wishlist and in the planning flow. */
export type IdeaCardView = {
  id: string;
  title: string;
  size: IdeaSize;
  costEur: number | null;
  location: string | null;
  note?: string | null;
  url?: string | null;
  /** Drinnen / draußen – outdoors the free times look at daylight and weather. */
  setting?: PlaceSetting | null;
  /** Essen, Natur … – stored, or guessed from the words when empty. */
  category?: string | null;
  /** Where it came from when it was swiped: "💚 von dir geswipt". */
  tag?: string | null;
  /** Both swiped right on it. */
  matched?: boolean;
  /** It is the next date. */
  isNext?: boolean;
  /** Costs more than the month budget has left. */
  overBudget?: boolean;
  creator?: { name: string; color: UserColor | null } | null;
};
