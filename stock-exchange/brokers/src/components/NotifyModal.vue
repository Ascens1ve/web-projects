<script setup lang="ts">
import { useAlert } from '@/composables/useAlert';
import { watch } from 'vue';

const { alertConfig } = useAlert();

const handleClose = () => {
  alertConfig.value.state = 'hidden';
};

let timer: ReturnType<typeof setTimeout> | null = null;

watch(
  () => alertConfig.value.state,
  () => {
    if (timer !== null) clearTimeout(timer);
    timer = setTimeout(() => {
      handleClose();
      timer = null;
    }, 3000);
  },
);
</script>

<template>
  <div v-bind:class="`alert alert_${alertConfig.type} alert_${alertConfig.state}`">
    <button class="close-button" v-on:click="handleClose">
      <img src="@/assets/address-card.svg" width="15" height="15" alt="X" class="close-icon" />
    </button>
    {{ alertConfig.text }}
  </div>
</template>

<style>
.alert {
  position: absolute;
  top: -300px;
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

.alert_active {
  top: 20px;
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
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
}

.close-button:hover {
  box-shadow: 0 0 0 2px black;
}
</style>
