import ForgotPassword from "@/components/auth/ForgotPassword.vue";
import Login from "@/components/auth/Login.vue";
import Register from "@/components/auth/Register.vue";
import Dashboard from "@/components/layout/Dashboard.vue";
import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      component: Dashboard,
      name: "Dashboard",
      meta: { requiresAuth: true },
    },
    {
      path: "/login",
      component: Login,
      name: "Login",
      meta: { requiresGuest: true },
    },
    {
      path: "/register",
      component: Register,
      name: "Register",
      meta: { requiresGuest: true },
    },
    {
      path: "/forgot-password",
      component: ForgotPassword,
      name: "ForgotPassword",
      meta: { requiresGuest: true },
    },
  ],
});

// Navigation guard
router.beforeEach((to, from, next) => {
  // Get auth store
  const authStore = useAuthStore();

  // Check if route requires auth
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next("/login");
  }
  // Check if route requires guest (like login/register)
  else if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next("/");
  }
  // Otherwise proceed
  else {
    next();
  }
});

export default router;
