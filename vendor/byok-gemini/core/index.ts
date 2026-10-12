export type ModelInfo = {
  id: string;
  displayName: string;
  inputTokenLimit: number | null;
  outputTokenLimit: number | null;
  preview: boolean;
  older: boolean;
};

export type ByokState = {
  hasKey: boolean;
  masked: string | null;
  remember: boolean;
  enabled: boolean;
  model: string | null;
};

type Stored = {
  key: string;
  model: string | null;
  enabled: boolean;
  savedAt: number;
};

const STORAGE_KEY = 'vhe.byok.gemini.v1';
const ORIGIN = 'https://generativelanguage.googleapis.com';
const listeners = new Set<(state: ByokState) => void>();
let memory: Stored | null = null;
let remembered = false;
let active: AbortController | null = null;

type Store = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
};

function sessionStore(): Store | null {
  if (typeof sessionStorage === 'undefined') return null;
  return sessionStorage;
}

function localStore(): Store | null {
  if (typeof localStorage === 'undefined') return null;
  return localStorage;
}

function readRaw(store: Store | null): Stored | null {
  if (!store) return null;
  const raw = store.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Stored;
    if (!parsed || typeof parsed.key !== 'string') return null;
    return parsed;
  } catch {
    return null;
  }
}

function load(): void {
  const local = readRaw(localStore());
  if (local) {
    memory = local;
    remembered = true;
    return;
  }
  const session = readRaw(sessionStore());
  memory = session;
  remembered = false;
}

function persist(): void {
  const session = sessionStore();
  const local = localStore();
  if (!memory) {
    session?.removeItem(STORAGE_KEY);
    local?.removeItem(STORAGE_KEY);
    return;
  }
  const raw = JSON.stringify(memory);
  if (remembered) {
    session?.removeItem(STORAGE_KEY);
    local?.setItem(STORAGE_KEY, raw);
    return;
  }
  local?.removeItem(STORAGE_KEY);
  session?.setItem(STORAGE_KEY, raw);
}

function emit(): void {
  const state = getState();
  for (const listener of listeners) listener(state);
}

export function maskedKey(key: string): string {
  if (key.length <= 8) return '••••';
  return `${key.slice(0, 4)}…${key.slice(-4)}`;
}

export function getState(): ByokState {
  if (!memory) load();
  if (!memory) {
    return { hasKey: false, masked: null, remember: false, enabled: false, model: null };
  }
  return {
    hasKey: true,
    masked: maskedKey(memory.key),
    remember: remembered,
    enabled: memory.enabled,
    model: memory.model,
  };
}

export function hasKey(): boolean {
  return getState().hasKey;
}

export function onChange(cb: (state: ByokState) => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function clear(): void {
  active?.abort();
  active = null;
  memory = null;
  remembered = false;
  sessionStore()?.removeItem(STORAGE_KEY);
  localStore()?.removeItem(STORAGE_KEY);
  emit();
}

export function setModel(id: string): void {
  if (!memory) return;
  memory = { ...memory, model: id };
  persist();
  emit();
}

export function setEnabled(on: boolean): void {
  if (!memory) return;
  memory = { ...memory, enabled: on };
  persist();
  emit();
}

export function scrub(text: string): string {
  if (!memory?.key) return text;
  return text.split(memory.key).join('[redacted]');
}

type ListedModel = {
  name?: string;
  displayName?: string;
  inputTokenLimit?: number;
  outputTokenLimit?: number;
  supportedGenerationMethods?: string[];
};

function familyRank(id: string): number {
  if (id.includes('flash-lite') || id.includes('-lite')) return 2;
  if (id.includes('pro')) return 0;
  if (id.includes('flash')) return 1;
  return 3;
}

function previewRank(id: string): number {
  if (id.includes('-exp')) return 2;
  if (id.includes('-preview')) return 1;
  return 0;
}

export function filterModels(models: ListedModel[]): { current: ModelInfo[]; older: ModelInfo[] } {
  const current: ModelInfo[] = [];
  const older: ModelInfo[] = [];
  for (const model of models) {
    const name = model.name ?? '';
    const id = name.startsWith('models/') ? name.slice('models/'.length) : name;
    if (!model.supportedGenerationMethods?.includes('generateContent')) continue;
    if (!/^gemini-(\d+)(?:\.(\d+))?-.+/.test(id)) continue;
    if (/(tts|live|image|embedding|robotics|transcribe|translate|native-audio|computer-use|aqa|deep-research|antigravity|omni)/.test(id)) continue;
    if (/^(imagen-|veo-|lyria-)/.test(id)) continue;
    const match = id.match(/^gemini-(\d+)(?:\.(\d+))?-/);
    if (!match) continue;
    const major = Number(match[1]);
    const minor = match[2] ? Number(match[2]) : 0;
    if (major <= 1) continue;
    if (major === 2 && minor === 0) continue;
    const info: ModelInfo = {
      id,
      displayName: model.displayName || id,
      inputTokenLimit: model.inputTokenLimit ?? null,
      outputTokenLimit: model.outputTokenLimit ?? null,
      preview: id.includes('-preview') || id.includes('-exp'),
      older: major === 2 && minor === 5,
    };
    (info.older ? older : current).push(info);
  }
  const sort = (a: ModelInfo, b: ModelInfo) => {
    const av = a.id.match(/^gemini-(\d+)(?:\.(\d+))?-/);
    const bv = b.id.match(/^gemini-(\d+)(?:\.(\d+))?-/);
    const aMajor = Number(av?.[1] ?? 0);
    const bMajor = Number(bv?.[1] ?? 0);
    const aMinor = Number(av?.[2] ?? 0);
    const bMinor = Number(bv?.[2] ?? 0);
    return bMajor - aMajor || bMinor - aMinor || previewRank(a.id) - previewRank(b.id) || familyRank(a.id) - familyRank(b.id);
  };
  current.sort(sort);
  older.sort(sort);
  return { current, older };
}

export function defaultModelId(models: ModelInfo[]): string | null {
  const stableFlash = models.find((model) => !model.preview && !model.older && model.id.includes('flash') && !model.id.includes('lite'));
  return stableFlash?.id ?? null;
}

async function googleFetch(path: string, init: { method: string; body?: string; signal?: AbortSignal }): Promise<Response> {
  if (!memory) throw new Error('No key saved');
  const url = `${ORIGIN}${path}`;
  if (url.includes('key=')) throw new Error('Refusing a key in the URL.');
  return fetch(url, {
    method: init.method,
    headers: {
      'content-type': 'application/json',
      'x-goog-api-key': memory.key,
    },
    body: init.body,
    credentials: 'omit',
    referrerPolicy: 'no-referrer',
    cache: 'no-store',
    mode: 'cors',
    signal: init.signal,
  });
}

function mapError(status: number, body: string): string {
  if (status === 400 && body.includes('API_KEY_INVALID')) {
    return "That key wasn't accepted. Check it in Google AI Studio.";
  }
  if (status === 403) {
    return "This key can't use the Gemini API. In AI Studio, restrict it to the Gemini API, or create a new key.";
  }
  if (status === 404) return "That model isn't available for your key. Pick another.";
  if (status === 429) return 'Your key hit its rate limit. Wait a minute, or check your limits in AI Studio.';
  return 'The request to Google did not succeed.';
}

async function listAll(): Promise<ListedModel[]> {
  const models: ListedModel[] = [];
  let pageToken = '';
  do {
    const query = pageToken ? `?pageSize=1000&pageToken=${encodeURIComponent(pageToken)}` : '?pageSize=1000';
    const response = await googleFetch(`/v1beta/models${query}`, { method: 'GET' });
    const body = await response.text();
    if (!response.ok) throw new Error(mapError(response.status, body));
    const parsed = JSON.parse(body) as { models?: ListedModel[]; nextPageToken?: string };
    models.push(...(parsed.models ?? []));
    pageToken = parsed.nextPageToken ?? '';
  } while (pageToken);
  return models;
}

export async function listModels(): Promise<ModelInfo[]> {
  const { current } = filterModels(await listAll());
  return current;
}

export async function saveKey(key: string, opts: { remember: boolean }): Promise<ModelInfo[]> {
  memory = { key: key.trim(), model: null, enabled: false, savedAt: Date.now() };
  remembered = opts.remember;
  persist();
  try {
    const listed = filterModels(await listAll());
    const model = defaultModelId(listed.current);
    memory = { ...memory, model, enabled: true };
    persist();
    emit();
    return listed.current;
  } catch (error) {
    clear();
    throw error;
  }
}

export async function generate(req: {
  prompt: string;
  system?: string;
  maxOutputTokens?: number;
  temperature?: number;
  signal?: AbortSignal;
}): Promise<{ text: string; model: string }> {
  if (!memory?.enabled || !memory.model) throw new Error('Your key is off.');
  const controller = new AbortController();
  active = controller;
  const timer = setTimeout(() => controller.abort(), 60_000);
  const signal = req.signal ?? controller.signal;
  const body = JSON.stringify({
    contents: [{ role: 'user', parts: [{ text: req.prompt }] }],
    systemInstruction: req.system ? { parts: [{ text: req.system }] } : undefined,
    generationConfig: { maxOutputTokens: req.maxOutputTokens ?? 512, temperature: req.temperature ?? 0.4 },
  });
  try {
    let response = await googleFetch(`/v1beta/models/${memory.model}:generateContent`, { method: 'POST', body, signal });
    if (response.status === 503) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      response = await googleFetch(`/v1beta/models/${memory.model}:generateContent`, { method: 'POST', body, signal });
    }
    const text = await response.text();
    if (!response.ok) throw new Error(mapError(response.status, text));
    const parsed = JSON.parse(text) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
    const out = parsed.candidates?.[0]?.content?.parts?.map((part) => part.text ?? '').join('') ?? '';
    return { text: out, model: memory.model };
  } finally {
    clearTimeout(timer);
    if (active === controller) active = null;
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key !== STORAGE_KEY) return;
    memory = null;
    load();
    emit();
  });
}
