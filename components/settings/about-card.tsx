"use client";

// The About card (product/version/environment/stack info) was removed —
// this data is internal build info with no relevance to a cafe owner or
// staff member. Kept as a no-op component so existing imports of
// <AboutCard /> in settings-content.tsx don't break; it simply renders
// nothing.
export function AboutCard() {
  return null;
}