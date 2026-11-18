// Social pages shown on the home page. Set href to null while a link isn't ready yet —
// the UI then shows the logo with a "coming soon" note instead of a broken link.

export type SocialId = "whatsapp" | "whatsapp_channel" | "instagram" | "tiktok" | "facebook";

export type SocialLink = {
  id: SocialId;
  label: string;
  /** null until the real page link is ready */
  href: string | null;
};

export const SOCIAL_LINKS: SocialLink[] = [
  {
    id: "whatsapp",
    label: "WhatsApp Group",
    href: "https://chat.whatsapp.com/Kbqb8S7316W8BXkCpqtJEl?s=cl&p=a&iam=2",
  },
  {
    id: "whatsapp_channel",
    label: "WhatsApp Channel",
    href: "https://whatsapp.com/channel/0029Vb9PtFYGOj9isRsXYt0v",
  },
  {
    id: "instagram",
    label: "Instagram",
    href: "https://www.instagram.com/vendempire.ng?dlrf=bno5OWE1Mmthb21p",
  },
  {
    id: "tiktok",
    label: "TikTok",
    href: "https://www.tiktok.com/@vendempire?_r=1&_t=ZS-9BPbRKenD0e",
  },
  { id: "facebook", label: "Facebook", href: null },
];
