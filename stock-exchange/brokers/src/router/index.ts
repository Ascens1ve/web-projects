import { createRouter, createWebHistory } from 'vue-router';
import MainPage from '@/views/MainPage.vue';
import AdminPage from '@/views/AdminPage.vue';
import { useUserStore } from '@/services/userStore';
import NotFoundPage from '@/views/NotFoundPage.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: MainPage,
      meta: { requiresAuth: true, requiresAdmin: false },
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginPage.vue'),
      meta: { guestOnly: true },
    },
    {
      path: '/admin',
      name: 'admin',
      component: AdminPage,
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: NotFoundPage,
    },
  ],
});

router.beforeEach(async (to) => {
  const user = useUserStore();
  if (!user.isAuthChecked) {
    await user.checkAuth();
  }
  if (to.meta.requiresAuth && !user.isAuthenticated) return { name: 'login' };
  if (to.meta.guestOnly && user.isAuthenticated) return { name: 'home' };
  if (to.meta.requiresAdmin && !user.isAdmin()) return { name: 'home' };
  return true;
});

export default router;
