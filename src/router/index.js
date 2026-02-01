import ForgotPassword from "@/components/auth/ForgotPassword.vue";
import Login from "@/components/auth/Login.vue";
import Register from "@/components/auth/Register.vue";
import Dashboard from "@/components/layout/Dashboard.vue";
import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: "/", component: Dashboard, name: "Dashboard" },
    { path: "/login", component: Login, name: "Login" },
    { path: "/register", component: Register, name: "Register" },
    {
      path: "/forgot-password",
      component: ForgotPassword,
      name: "ForgotPassword",
    },
  ],
});

export default router;
