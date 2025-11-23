<script setup lang="ts">
import { useAlert, type Alert } from '@/composables/useAlert';
import { nextTick, ref, watch } from 'vue';

const { alertConfig, clearAlert } = useAlert();

const handleClose = () => {
  config.value.state = 'hidden';
};

let timer: ReturnType<typeof setTimeout>;
const queue = ref<Alert[]>([]);
const isAvailable = ref<boolean>(false);

const config = ref<Alert>({ ...alertConfig.value });

const f = () => {
  if (!queue.value.length) return;
  if (isAvailable.value) return;
  else {
    config.value = queue.value.shift()!;
    isAvailable.value = true;
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      handleClose();
    }, 3000);
  }
};

const onAfterLeave = () => {
  isAvailable.value = false;
  f();
};

watch(
  alertConfig,
  (newValue) => {
    if (!newValue || newValue.state === 'hidden') return;
    queue.value.push({ ...newValue });
    f();
    nextTick(() => clearAlert());
  },
  { deep: true },
);
</script>

<template>
  <Transition v-on:after-leave="onAfterLeave" mode="out-in">
    <div v-if="config.state === 'active'" class="alert" :class="`alert_${config.type}`">
      <button class="close-button" v-on:click="handleClose">
        <img src="@/assets/address-card.svg" width="15" height="15" alt="X" class="close-icon" />
      </button>
      {{ config.text }}
    </div>
  </Transition>
</template>

<style>
.alert {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: 450px;
  height: min-content;
  padding: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 2px solid black;
  border-radius: 10px;
  color: black;
  transition: top 0.4s ease;
  z-index: 5;
}

.alert_success {
  background-color: rgba(54, 209, 134, 1);
}

.alert_failed {
  background-color: rgba(201, 58, 58, 1);
}

.alert_warn {
  background-color: rgba(238, 245, 108, 1);
}

.close-button {
  position: absolute;
  top: 5px;
  right: 5px;
  background: none;
  border: 0px solid black;
  border-radius: 4px;
  box-sizing: border-box;
  box-shadow: 0 0 0 0px black;
  transition: box-shadow 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
}

.close-button:hover {
  box-shadow: 0 0 0 2px black;
}

.v-enter-active,
.v-leave-active {
  transition: top 0.5s ease;
}

.v-enter-from,
.v-leave-to {
  top: -200px;
}
</style>
