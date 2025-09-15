import { ref } from 'vue';

export type AlertType = 'success' | 'failed' | 'normal';
export type AlertState = 'active' | 'hidden';
export type AlertText = string;

export function useAlert() {
  const alertConfig = ref<{ type: AlertType; state: AlertState; text: AlertText }>({
    type: 'failed',
    state: 'hidden',
    text: 'Something',
  });

  const updateAlert = (
    type: AlertType = 'normal',
    state: AlertState = 'active',
    text: AlertText,
  ) => {
    alertConfig.value.type = type;
    alertConfig.value.state = state;
    alertConfig.value.text = text;
  };

  return { alertConfig, updateAlert };
}
