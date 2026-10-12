import { useEffect, useState } from 'react';
import { getState, onChange, type ByokState } from '../core/index';

export function useByok(): ByokState {
  const [state, setState] = useState<ByokState>(getState());
  useEffect(() => onChange(setState), []);
  return state;
}
