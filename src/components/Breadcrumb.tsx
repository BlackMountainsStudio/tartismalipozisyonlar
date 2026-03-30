import Link from "next/link";
import Script from "next/script";
import { ChevronRight } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      ...(item.href ? { item: `https://varodasi.com${item.href}` } : {}),
    })),
  };

  return (
    <>
      <Script
        id={`breadcrumb-${items.map((i) => i.label).join("-").replace(/\s/g, "")}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav aria-label="Breadcrumb" className="mb-4">
        <ol className="flex flex-wrap items-center gap-1 text-sm text-zinc-500">
          {items.map((item, index) => (
            <li key={index} className="flex items-center gap-1">
              {index > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />}
              {item.href && index < items.length - 1 ? (
                <Link href={item.href} className="hover:text-zinc-300 transition-colors">
                  {item.label}
                </Link>
              ) : (
                <span className={index === items.length - 1 ? "text-zinc-300" : ""}>{item.label}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
