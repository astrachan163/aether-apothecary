import { findBannedClaim } from '../../shared/claims';
import { AI_WARNING } from '../../shared/notices';
import { generate, getState, scrub } from '../../vendor/byok-gemini/core/index';

export async function draftProductDescription(input: { name: string; shortDescription: string; keywords: string }): Promise<{ description?: string; tier?: string; error?: string }> {
  const state = getState();
  if (!state.hasKey || !state.enabled) {
    return { error: 'Drafting needs your own key, or the owner AI function. Neither is connected.' };
  }
  try {
    const result = await generate({
      prompt: `Write catalog copy for ${input.name}. ${input.shortDescription}. Words to mention: ${input.keywords}. ${AI_WARNING}`,
      maxOutputTokens: 512,
    });
    const hit = findBannedClaim(result.text);
    if (hit) return { error: `blocked-claim:${hit}` };
    return { description: result.text, tier: 'byok' };
  } catch (error) {
    const message = error instanceof Error ? scrub(error.message) : 'Draft failed.';
    return { error: message };
  }
}
