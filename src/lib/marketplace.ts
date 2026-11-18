import { z } from "zod";

export const PERSONAS = [
  {
    id: "homemaker",
    label: "Housewife / Homemaker",
    emoji: "🏡",
    blurb: "Feeding the family, smarter",
  },
  { id: "student", label: "Student", emoji: "🎓", blurb: "Campus deals on a budget" },
  { id: "professional", label: "Working Professional", emoji: "💼", blurb: "Delivered, no wahala" },
  { id: "everyday", label: "Everyday Shopper", emoji: "🛍️", blurb: "Anything, anytime" },
] as const;

export const INTERESTS = [
  { id: "foodstuffs", label: "Foodstuffs & Farm Produce", emoji: "🍠" },
  { id: "groceries", label: "Groceries & Household", emoji: "🧺" },
  { id: "gadgets", label: "Gadgets & Electronics", emoji: "📱" },
  { id: "accessories", label: "Phone & Tech Accessories", emoji: "🎧" },
  { id: "fashion", label: "Fashion & Wears", emoji: "👗" },
  { id: "beauty", label: "Beauty & Personal Care", emoji: "💄" },
  { id: "campus", label: "Campus Essentials", emoji: "📚" },
  { id: "home", label: "Home & Kitchen", emoji: "🍳" },
  { id: "baby", label: "Baby & Kids", emoji: "🧸" },
  { id: "services", label: "Local Services", emoji: "🛠️" },
] as const;

export type PersonaId = (typeof PERSONAS)[number]["id"];
export type InterestId = (typeof INTERESTS)[number]["id"];

const personaIds = PERSONAS.map((p) => p.id) as [PersonaId, ...PersonaId[]];
const interestIds = INTERESTS.map((i) => i.id) as [InterestId, ...InterestId[]];

export const waitlistSchema = z.object({
  full_name: z.string().trim().min(2, "Please enter your name").max(100),
  email: z.string().trim().toLowerCase().email("Enter a valid email").max(255),
  phone: z
    .string()
    .trim()
    .max(30)
    .regex(/^[+\d\s()-]*$/, "Use digits only")
    .optional()
    .transform((v) => (v ? v : null)),
  city: z
    .string()
    .trim()
    .max(80)
    .optional()
    .transform((v) => (v ? v : null)),
  country: z.string().trim().min(2, "Where are you shopping from?").max(80),
  persona: z.enum(personaIds, { errorMap: () => ({ message: "Pick who you are" }) }),
  interests: z.array(z.enum(interestIds)).min(1, "Pick at least one thing you'll buy").max(10),
  note: z
    .string()
    .trim()
    .max(300)
    .optional()
    .transform((v) => (v ? v : null)),
});

export type WaitlistInput = z.input<typeof waitlistSchema>;

export function labelFor(id: string) {
  return (
    INTERESTS.find((i) => i.id === id)?.label ??
    PERSONAS.find((p) => p.id === id)?.label ??
    VENDOR_TYPES.find((v) => v.id === id)?.label ??
    id
  );
}

export const VENDOR_TYPES = [
  { id: "market", label: "Market Trader", emoji: "🧺", blurb: "Stall or shop in the market" },
  { id: "shop", label: "Store / Brand", emoji: "🏬", blurb: "Registered shop or brand" },
  { id: "home", label: "Home Seller", emoji: "🏠", blurb: "Selling from home or online" },
  { id: "farmer", label: "Farmer / Producer", emoji: "🌾", blurb: "Straight from the farm" },
] as const;

export type VendorTypeId = (typeof VENDOR_TYPES)[number]["id"];
const vendorTypeIds = VENDOR_TYPES.map((v) => v.id) as [VendorTypeId, ...VendorTypeId[]];

export const vendorSchema = waitlistSchema.omit({ persona: true }).extend({
  business_name: z.string().trim().min(2, "Enter your business name").max(120),
  persona: z.enum(vendorTypeIds, {
    errorMap: () => ({ message: "Pick what kind of seller you are" }),
  }),
  interests: z.array(z.enum(interestIds)).min(1, "Pick at least one thing you sell").max(10),
});

export function vendorTypeLabel(id: string) {
  return VENDOR_TYPES.find((v) => v.id === id)?.label ?? id;
}
