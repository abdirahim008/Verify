import "server-only";
import { ClassicCV } from "@/components/cv/ClassicCV";
import { ProfileCV } from "@/components/cv/ProfileCV";
import { GridCV } from "@/components/cv/GridCV";
import { CrestCV } from "@/components/cv/CrestCV";
import { EditorialCV } from "@/components/cv/EditorialCV";
import { StatementCV } from "@/components/cv/StatementCV";
import { EndnoteCV } from "@/components/cv/EndnoteCV";
import { FrameCV } from "@/components/cv/FrameCV";
import { BeaconCV } from "@/components/cv/BeaconCV";
import { WadaniCompanyProfile } from "@/components/cv/WadaniCompanyProfile";
import { AnnualCompanyProfile } from "@/components/cv/AnnualCompanyProfile";
import { MinimalCompanyProfile } from "@/components/cv/MinimalCompanyProfile";
import { StandardCompanyProfile } from "@/components/cv/StandardCompanyProfile";
import { DossierCompanyProfile } from "@/components/cv/DossierCompanyProfile";
import { BannerCompanyProfile } from "@/components/cv/BannerCompanyProfile";
import { BroadsheetCompanyProfile } from "@/components/cv/BroadsheetCompanyProfile";
import { BentoCompanyProfile } from "@/components/cv/BentoCompanyProfile";

// Every PDF template with its component and Google Fonts URL. The download
// routes (app/api/cv, app/api/company) and the thumbnail generator
// (scripts/render-thumbnails.mjs) all render from this one list, so a
// thumbnail is exactly what the download produces.

const G = "https://fonts.googleapis.com/css2?";

// ── CV templates: the §12 prototype pairings. Variable-font ranges (opsz +
// wght) so optical sizing and in-between weights resolve exactly. Loading
// only what each template uses keeps headless Chromium's fetches tight.
export const CV_RENDER = {
  classic: {
    name: "Classic", component: ClassicCV,
    fonts: G + "family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500&family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400&display=swap",
  },
  profile: {
    name: "Profile", component: ProfileCV,
    fonts: G + "family=Space+Grotesk:wght@400;500;600;700&family=Hanken+Grotesk:wght@400;500;600;700&display=swap",
  },
  grid: {
    name: "Grid", component: GridCV,
    fonts: G + "family=Archivo:wght@400;500;600;700;800&family=IBM+Plex+Sans:wght@400;500;600&display=swap",
  },
  crest: {
    name: "Crest", component: CrestCV,
    fonts: G + "family=Marcellus&family=Hanken+Grotesk:wght@400;500;600;700&display=swap",
  },
  editorial: {
    name: "Editorial", component: EditorialCV,
    fonts: G + "family=Spectral:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Public+Sans:wght@400;500;600;700&display=swap",
  },
  statement: {
    name: "Statement", component: StatementCV,
    fonts: G + "family=Bodoni+Moda:ital,wght@0,500;0,600;1,500&family=Karla:wght@400;500;600;700&display=swap",
  },
  endnote: {
    name: "Endnote", component: EndnoteCV,
    fonts: G + "family=Archivo:wght@500;600;700;800&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;1,6..72,400&display=swap",
  },
  beacon: {
    name: "Beacon", component: BeaconCV,
    fonts: G + "family=Montserrat:wght@600;700;800&family=Source+Sans+3:ital,wght@0,400;0,600;0,700;1,400&display=swap",
  },
  frame: {
    name: "Frame", component: FrameCV,
    fonts: G + "family=Cormorant+Garamond:wght@500;600&family=Public+Sans:wght@400;500;600;700&display=swap",
  },
} as const;

// ── Company templates. The original three share Source Serif 4 + Public Sans
// + Plex Mono; variable wght ranges so Minimal's 250–280 cover weights
// resolve exactly instead of snapping to 300.
const PROFILE_FONTS =
  G + "family=Source+Serif+4:ital,opsz,wght@0,8..60,200..600;1,8..60,200..600" +
  "&family=Public+Sans:wght@400..700&family=IBM+Plex+Mono:wght@400;500&display=swap";

export const COMPANY_RENDER = {
  wadani: { name: "Wadani", component: WadaniCompanyProfile, fonts: PROFILE_FONTS },
  annual: { name: "Annual", component: AnnualCompanyProfile, fonts: PROFILE_FONTS },
  minimal: { name: "Minimal", component: MinimalCompanyProfile, fonts: PROFILE_FONTS },
  standard: {
    name: "The Standard", component: StandardCompanyProfile,
    fonts: G + "family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500&family=Public+Sans:wght@400;500;600;700&display=swap",
  },
  dossier: {
    name: "The Dossier", component: DossierCompanyProfile,
    fonts: G + "family=Space+Grotesk:wght@500;600;700&family=Hanken+Grotesk:wght@400;500;600;700&display=swap",
  },
  banner: {
    name: "The Banner", component: BannerCompanyProfile,
    fonts: G + "family=Bodoni+Moda:ital,wght@0,500;0,600;1,500&family=Karla:wght@400;500;600;700&display=swap",
  },
  broadsheet: {
    name: "The Broadsheet", component: BroadsheetCompanyProfile,
    fonts: G + "family=Archivo:wght@500;600;700;800&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;1,6..72,400&display=swap",
  },
  bento: {
    name: "The Bento", component: BentoCompanyProfile,
    fonts: G + "family=Spectral:ital,wght@0,500;0,600;1,500&family=Public+Sans:wght@400;500;600;700&display=swap",
  },
} as const;
