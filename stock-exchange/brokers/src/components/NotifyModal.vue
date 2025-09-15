<script setup lang="ts">
import type { IAlert } from '@/interfaces';

withDefaults(defineProps<Omit<IAlert, 'text'>>(), {
  type: 'normal',
  state: 'hidden',
});

const emit = defineEmits(['close']);

const handleClose = () => {
  emit('close');
};
</script>

<template>
  <div v-bind:class="`alert alert_${type} alert_${state}`">
    <button class="close-button" v-on:click="handleClose">
      <img src="@/assets/address-card.svg" width="15" height="15" alt="X" class="close-icon" />
    </button>
    <slot />
  </div>
</template>

<style>
.alert {
  position: absolute;
  top: -300px;
  left: 50%;
  transform: translateX(-50%);
  width: 450px;
  height: 70px;
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

.alert_active {
  top: 150px;
}

.alert_success {
  background: rgb(16, 232, 70);
}

.alert_failed {
  background: rgb(130, 38, 38);
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
  display: flex; /* <-- flex-контейнер */
  align-items: center; /* горизонтально по-центру */
  justify-content: center; /* вертикально по-центру */
  padding: 4px;
}

.close-button:hover {
  box-shadow: 0 0 0 2px black;
}
</style>
