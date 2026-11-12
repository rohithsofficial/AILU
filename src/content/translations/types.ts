import type { SiteContent } from "@/content/defaults";
import type { LANDING, LANDING_VARIANTS } from "@/content/landing";
import type { DeepPartial } from "@/lib/i18n";

/** One language: the CMS sections (`content`) and the /celebrate landing page (`landing`). */
export type Translation = {
  content: DeepPartial<SiteContent>;
  landing?: DeepPartial<{ page: typeof LANDING; variants: typeof LANDING_VARIANTS }>;
};
