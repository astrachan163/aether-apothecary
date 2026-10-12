export function DisclaimerMark() {
  return (
    <a
      href="#disclaimer"
      className="ml-0.5 inline-flex min-h-6 min-w-6 items-center justify-center align-text-top text-foreground underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
    >
      <span aria-hidden="true">*</span>
      <span className="sr-only">See the disclaimer</span>
    </a>
  );
}
