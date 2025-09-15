<script setup lang="ts">
import HeaderComponent from './components/HeaderComponent.vue';
import { useUserStore } from './services/userStore';
useUserStore().checkAuth();
</script>

<template>
  <div id="app" class="main">
    <HeaderComponent />
    <RouterView />
  </div>
</template>

<style>
.main {
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 320px;
  min-height: 100dvh;
  margin: 0 auto;
}

@media only screen and (min-width: 480px) {
  .main {
    max-width: 480px;
  }
}

@media only screen and (min-width: 768px) {
  .main {
    max-width: 768px;
  }
}

@media only screen and (min-width: 992px) {
  .main {
    max-width: 900px;
  }
}

@media only screen and (min-width: 1382px) {
  .main {
    max-width: 1200px;
  }
}
</style>
