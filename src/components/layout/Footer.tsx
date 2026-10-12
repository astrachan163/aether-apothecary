const FDA_DISCLAIMER =
  'These statements have not been evaluated by the Food and Drug Administration. This product is not intended to diagnose, treat, cure, or prevent any disease.';

const legalLinks = [
  { href: 'https://www.nonartificialsi.com/privacy', label: 'Privacy' },
  { href: 'https://www.nonartificialsi.com/terms', label: 'Terms' },
  { href: 'https://www.nonartificialsi.com/accessibility', label: 'Accessibility' },
  { href: 'https://www.nonartificialsi.com/ai', label: 'AI' },
  { href: 'https://www.nonartificialsi.com/credits', label: 'Credits' },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/40 bg-background">
      <div className="container flex flex-col items-center gap-4 px-4 py-6 md:px-8">
        <nav aria-label="Policies" className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
          {legalLinks.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="inline-flex min-h-11 items-center text-sm text-foreground underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
            >
              {item.label}
            </a>
          ))}
        </nav>
        <p className="text-balance text-center text-sm leading-loose text-muted-foreground">
          &copy; {currentYear} Victorious Herbal Elements LLC. All rights reserved.
        </p>
        <p
          id="disclaimer"
          className="max-w-3xl rounded-md border-2 border-foreground px-4 py-3 text-balance text-center text-sm font-bold leading-relaxed text-foreground"
        >
          {FDA_DISCLAIMER}
        </p>
        <a
          href="https://www.nonartificialsi.com/"
          className="inline-flex min-h-11 items-center"
        >
          <img
            src="/brand/built_by_maqkrs_dark.svg"
            width="120"
            height="20"
            alt="Built by MaQkrs"
          />
        </a>
      </div>
    </footer>
  );
}
