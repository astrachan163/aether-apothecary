import { useState } from 'react';
import { clear, listModels, saveKey, setEnabled, setModel, type ModelInfo } from '../core/index';
import { useByok } from './useByok';

const target = { minHeight: 44, minWidth: 44 };

export function ByokSettingsPanel() {
  const state = useByok();
  const [key, setKey] = useState('');
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(false);
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [status, setStatus] = useState('No key saved');
  const [error, setError] = useState('');

  async function onSave() {
    setError('');
    try {
      const listed = await saveKey(key, { remember });
      setModels(listed);
      setKey('');
      setStatus(remember ? 'Key remembered on this device' : 'Key saved for this tab only');
    } catch (err) {
      setStatus('No key saved');
      setError(err instanceof Error ? err.message : 'The key was not saved.');
    }
  }

  async function onRefresh() {
    setError('');
    try {
      setModels(await listModels());
    } catch (err) {
      setModels([]);
      setError(err instanceof Error ? err.message : 'Models could not be loaded.');
    }
  }

  function onClear() {
    clear();
    setModels([]);
    setStatus('Your key was removed from this browser.');
  }

  return (
    <section aria-label="Use your own Google AI Studio key">
      <h2>Use your own Google AI Studio key</h2>
      <label htmlFor="byok-key">Google AI Studio key</label>
      <input
        id="byok-key"
        type={show ? 'text' : 'password'}
        autoComplete="off"
        spellCheck={false}
        value={key}
        onChange={(event) => setKey(event.target.value)}
        style={target}
      />
      <button type="button" style={target} onClick={() => setShow((value) => !value)}>
        {show ? 'Hide' : 'Show'}
      </button>
      <button type="button" style={target} onClick={onSave}>
        Save and test
      </button>
      <label>
        <input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} />
        Remember on this device
      </label>
      <p>Anyone who uses this browser profile can use your key. Don&apos;t use this on a shared computer.</p>
      <label htmlFor="byok-model">Model</label>
      <select id="byok-model" value={state.model ?? ''} onChange={(event) => setModel(event.target.value)} style={target}>
        <option value="">No model yet</option>
        {models.map((model) => (
          <option key={model.id} value={model.id}>
            {model.displayName} ({model.id})
          </option>
        ))}
      </select>
      <button type="button" style={target} onClick={onRefresh}>
        Refresh models
      </button>
      <label>
        <input type="checkbox" checked={state.enabled} onChange={(event) => setEnabled(event.target.checked)} />
        Use my key for AI features
      </label>
      <button type="button" style={target} onClick={onClear}>
        Remove my key
      </button>
      <p aria-live="polite">{error || status}</p>
      <p>
        Your key stays in this browser and is sent only to Google (generativelanguage.googleapis.com). It is never sent to our servers or saved in your account. Usage is billed to your Google project, or counts against your free tier.
      </p>
      <p>
        <a href="/ai-key-guide">How to get a Google AI Studio API key</a>
      </p>
      <p>On Google&apos;s free tier, Google may use your prompts to improve its products. Don&apos;t enter personal information.</p>
    </section>
  );
}
