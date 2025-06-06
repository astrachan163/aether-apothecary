export function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="border-t border-border/40 bg-background/95">
      <div className="container flex flex-col items-center justify-center gap-4 h-20 py-6 md:flex-row md:py-0 px-4 md:px-8">
        <p className="text-balance text-center text-sm leading-loose text-muted-foreground">
          &copy; {currentYear} Victorious Herbal Elements. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
