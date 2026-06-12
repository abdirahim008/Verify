import Link from "next/link";
import type { Metadata } from "next";
import { GUIDES } from "@/lib/content/guides";
import { JsonLd } from "@/components/JsonLd";
import { SITE, absoluteUrl, breadcrumbLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Guides — CVs & company profiles for the humanitarian sector",
  description:
    "Practical guides to building CVs and company profiles for NGO, humanitarian, engineering and tender work in Somalia and East Africa. Free templates, mobile-friendly.",
  alternates: { canonical: absoluteUrl("/guides") },
  openGraph: {
    title: "Sahan Guides — CVs & company profiles for the humanitarian sector",
    description: "Free, practical guides to CVs and company profiles for NGO and tender work in East Africa.",
    url: absoluteUrl("/guides"),
    type: "website",
  },
};

export default function GuidesIndex() {
  const cv = GUIDES.filter((g) => g.category === "cv");
  const company = GUIDES.filter((g) => g.category === "company");

  return (
    <>
      <JsonLd data={breadcrumbLd([{ name: "Home", path: "/" }, { name: "Guides", path: "/guides" }])} />
      <main className="mx-auto max-w-5xl px-5 sm:px-8 py-12 sm:py-16">
        <p className="section-eyebrow text-sienna">Guides</p>
        <h1 className="font-serif text-[34px] sm:text-[46px] tracking-[-0.025em] mt-3 max-w-2xl leading-[1.08]">
          CVs &amp; company profiles, done right for our sector.
        </h1>
        <p className="mt-4 text-[15.5px] text-ink-soft max-w-2xl leading-relaxed">
          Practical, specific guidance for the work people here actually do — aid and NGO roles, monitoring and evaluation, tenders, construction and consultancy. Every guide ends with a free template you can build on your phone in minutes.
        </p>

        <GuideGroup title="For professionals · CVs" guides={cv} />
        <GuideGroup title="For organisations · Company profiles" guides={company} />
      </main>
    </>
  );
}

function GuideGroup({ title, guides }: { title: string; guides: typeof GUIDES }) {
  return (
    <section className="mt-12">
      <h2 className="section-eyebrow">{title}</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {guides.map((g) => (
          <Link key={g.slug} href={`/guides/${g.slug}`} className="card bg-paper hover:bg-cream/40 transition block">
            <h3 className="font-serif text-[20px] tracking-tightish">{g.h1}</h3>
            <p className="mt-2 text-[13.5px] text-ink-soft leading-relaxed line-clamp-3">{g.metaDescription}</p>
            <span className="mt-3 inline-block text-[13px] text-sienna font-medium">Read the guide →</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
