import { createRouter, createWebHistory } from 'vue-router'
import { isAuthenticated } from '../composables/useAuth'

const defaultTitle = 'Agenda de Contatos'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: () => (isAuthenticated() ? { name: 'chat' } : { name: 'login' }),
    },
    {
      path: '/login',
      alias: '/auth/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { title: 'Login', guestOnly: true },
    },
    {
      path: '/register',
      alias: '/auth/register',
      name: 'register',
      component: () => import('../views/RegisterView.vue'),
      meta: { title: 'Criar conta', guestOnly: true },
    },
    {
      path: '/chat',
      name: 'chat',
      component: () => import('../views/ChatView.vue'),
      meta: { title: 'Chat', requiresAuth: true },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../views/NotFoundView.vue'),
      meta: { title: 'Não encontrado' },
    },
  ],
})

router.beforeEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} - ${defaultTitle}` : defaultTitle

  if (to.meta.requiresAuth && !isAuthenticated()) {
    return {
      name: 'login',
      query: {
        redirect: to.fullPath,
      },
    }
  }

  if (to.meta.guestOnly && isAuthenticated()) {
    return { name: 'chat' }
  }
})

export default router
