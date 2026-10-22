class ByokSettings extends HTMLElement {
  connectedCallback(): void {
    this.innerHTML = '<p>Open Settings, then AI, to use your own Google AI Studio key.</p>';
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('byok-settings')) {
  customElements.define('byok-settings', ByokSettings);
}

export {};
