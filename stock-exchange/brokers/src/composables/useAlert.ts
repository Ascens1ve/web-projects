import { ref } from 'vue';

export type AlertType = 'success' | 'failed' | 'normal';
export type AlertState = 'active' | 'hidden';

export interface Alert {
  type: AlertType;
  state: AlertState;
  text: string;
}

const alertConfig = ref<Alert>({
  type: 'failed',
  state: 'hidden',
  text: 'Something',
});

export function useAlert() {
  const updateAlert = (type: AlertType = 'normal', state: AlertState = 'active', text: string) => {
    alertConfig.value.type = type;
    alertConfig.value.state = state;
    alertConfig.value.text = text;
  };

  return { alertConfig, updateAlert };
}
