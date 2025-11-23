import { ref } from 'vue';

export type AlertType = 'success' | 'failed' | 'warn';
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
  const updateAlert = (type: AlertType = 'warn', state: AlertState = 'active', text: string) => {
    alertConfig.value.type = type;
    alertConfig.value.state = state;
    alertConfig.value.text = text;
  };

  const clearAlert = () => {
    alertConfig.value.state = 'hidden';
  };

  return { alertConfig, updateAlert, clearAlert };
}
