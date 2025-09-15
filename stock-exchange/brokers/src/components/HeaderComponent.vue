<script setup lang="ts">
import { useUserStore } from '@/services/userStore';
import { computed } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
const userStore = useUserStore();
const isAuth = computed(() => userStore.isAuthenticated);
const router = useRouter();

const handleLogout = () => {
  userStore.logout();
  router.push('/login');
};
</script>

<template>
  <div class="back">
    <nav class="nav-links">
      <div class="links">
        <RouterLink to="/" class="link">Главная</RouterLink>
        <RouterLink to="/admin" class="link">Админ</RouterLink>
      </div>
      <RouterLink v-if="!isAuth" to="/login" class="link">Войти</RouterLink>
      <button v-else @click="handleLogout" class="link">Выйти</button>
    </nav>
  </div>
</template>

<style>
.back {
  width: 100%;
  min-height: 100px;
  height: 100px;
  padding: 10px;
  background-color: #34ebc3;
  border-radius: 15px;
}

.nav-links {
  margin: 0 auto;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.links {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
}

.link {
  box-sizing: border-box;
  text-decoration: none;
  color: black;
  font-size: 28px;
  font-weight: 400;
  font-family: inherit;
  padding: 8px;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  background-color: transparent;
  transition: border-color 0.2s linear;
}

.link:hover {
  border-color: black;
}

@media only screen and (max-width: 480px) {
  .nav-links {
    flex-direction: column;
  }
  .links {
    flex-direction: column;
  }
  .back {
    height: min-content;
  }
}
</style>
