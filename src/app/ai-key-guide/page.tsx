export default function AiKeyGuidePage() {
  return (
    <article className="mx-auto max-w-3xl space-y-4">
      <h1 className="text-3xl font-bold">How to get a Google AI Studio API key</h1>
      <p>You can use your own Google AI Studio key for the AI features in Victorious Herbal Elements. Your key stays in your browser and goes only to Google. We never see it, and it is never saved to your account.</p>
      <h2 className="text-2xl font-semibold">1. Create the key</h2>
      <ol className="list-decimal space-y-2 pl-6">
        <li>Go to aistudio.google.com and sign in with your Google Account.</li>
        <li>Accept the terms if this is your first visit. AI Studio creates a default Google Cloud project for new users.</li>
        <li>Open Dashboard, then API Keys, and choose Create API key. If you already use Google Cloud, you may need to Import projects first (Dashboard, then Projects, then Import projects), then create the key in that project.</li>
        <li>Copy the key. New keys are auth keys that only work with the Gemini API.</li>
      </ol>
      <h2 className="text-2xl font-semibold">2. Add it to Victorious Herbal Elements</h2>
      <ol className="list-decimal space-y-2 pl-6">
        <li>Open Settings, then AI, then Use your own Google AI Studio key.</li>
        <li>Paste the key and choose Save and test. The list of models your key can use loads from Google, newest first.</li>
        <li>Pick a model, and turn on Use my key for AI features.</li>
        <li>By default the key is kept only until you close this tab. Tick Remember on this device only on a computer that only you use.</li>
        <li>To take it out, choose Remove my key.</li>
      </ol>
      <h2 className="text-2xl font-semibold">3. Free tier and limits</h2>
      <ul className="list-disc space-y-2 pl-6">
        <li>You can start without a billing account. Free-tier limits depend on the model and can change. Check the current numbers at ai.google.dev/gemini-api/docs/rate-limits.</li>
        <li>On the free tier, Google may use your prompts and responses to improve its products. Don&apos;t enter personal or sensitive information.</li>
        <li>If you turn on billing for your Google Cloud project, usage on your key is charged to you. Set a budget in the Google Cloud console first.</li>
      </ul>
      <h2 className="text-2xl font-semibold">4. Keep your key private</h2>
      <ul className="list-disc space-y-2 pl-6">
        <li>Handle it like a password. Don&apos;t post it, email it, put it in screenshots, or commit it to code.</li>
        <li>Use a separate key for browser apps like this one, so you can delete it without affecting anything else.</li>
        <li>Older standard keys must be restricted or the Gemini API refuses them. In AI Studio, find a key marked Unrestricted, choose Add restrictions, then Restrict to Gemini API only.</li>
        <li>If you think the key leaked: create a new key, switch to it, then disable or delete the old one in AI Studio or the Google Cloud console, and check your usage.</li>
      </ul>
      <h2 className="text-2xl font-semibold">5. What Victorious Herbal Elements does with your key</h2>
      <ul className="list-disc space-y-2 pl-6">
        <li>It sends your key only to generativelanguage.googleapis.com, in a request header, with no cookies.</li>
        <li>It never sends the key to our servers, never stores it in your account or our database, and never writes it to logs.</li>
        <li>AI replies can be wrong. They are not professional advice.</li>
      </ul>
      <p>Last checked: October 11, 2026.</p>
    </article>
  );
}
