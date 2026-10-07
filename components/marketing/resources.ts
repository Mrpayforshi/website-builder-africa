// Single source of truth for the Resources dropdown.
// Used by SiteNav (founders / for-work pages) and HomeResourcesMenu (home page).
// An item with no `href` renders greyed out with a "Soon" tag. Every item
// below now has a live page.

export type ResourceItem = { title: string; desc: string; href?: string };

export const RESOURCES: ResourceItem[] = [
  { title: "Templates", desc: "Begin with a template.", href: "/templates" },
  { title: "Connectors", desc: "Build from what you already use.", href: "/connectors" },
  { title: "Guides", desc: "Learn as you build.", href: "/guides" },
  { title: "Docs", desc: "Everything under the hood.", href: "/docs" },
  { title: "Blog", desc: "Ideas, updates, stories.", href: "/blog" },
  { title: "Customer stories", desc: "See what businesses have built.", href: "/customer-stories" },
  { title: "Academy", desc: "Learn to build with Rivo.", href: "/academy" },
  { title: "Partners", desc: "Build more together.", href: "/partners" },
];
