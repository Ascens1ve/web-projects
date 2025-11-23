<script setup lang="ts">
import HeaderComponent from './components/HeaderComponent.vue';
import LoadingComponent from './components/LoadingComponent.vue';
import { useUserStore } from './services/userStore';
import NotifyModal from './components/NotifyModal.vue';

const us = useUserStore();
</script>

<template>
  <div id="app" class="page">
    <NotifyModal />
    <HeaderComponent />
    <LoadingComponent v-if="us.isLoading" />
    <RouterView v-else />
  </div>
</template>

<style>
.page {
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 320px;
  min-height: 100dvh;
  margin: 0 auto;
}

@media only screen and (min-width: 480px) {
  .page {
    max-width: 480px;
  }
}

@media only screen and (min-width: 768px) {
  .page {
    max-width: 768px;
  }
}

@media only screen and (min-width: 992px) {
  .page {
    max-width: 900px;
  }
}

@media only screen and (min-width: 1382px) {
  .page {
    max-width: 1200px;
  }
}
</style>
