<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'text' | 'contained' | 'outlined';
  }>(),
  {
    variant: 'contained',
  },
);
</script>

<template>
  <button v-bind:class="`btn ${variant}`" @click="$emit('click', $event)"><slot /></button>
</template>

<style>
.btn {
  box-sizing: border-box;
  padding: 6px;
  font-size: inherit;
  font-weight: 600;
  border-radius: 10px;
  transition: background-color 0.3s ease;
}

.text {
  border: 1px solid transparent;
  background-color: white;
}

.text:hover {
  background-color: #d3e3e3;
}

.contained {
  background-color: cadetblue;
  border: 1px solid transparent;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
}

.contained:hover {
  background-color: #3abdbb;
}

.outlined {
  background-color: white;
  border: 1px solid cadetblue;
}

.outlined:hover {
  background-color: #d3e3e3;
}
</style>
