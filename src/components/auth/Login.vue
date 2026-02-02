<template>
  <div class="login-page">
    <!-- Left Panel: Form -->
    <div class="left-panel">
      <div class="form-container">
        <!-- Logo -->
        <div class="logo">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            fill="#000000"
            class="bi bi-cash-stack"
            viewBox="0 0 16 16"
          >
            <path
              d="M1 3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1zm7 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4"
            />
            <path
              d="M0 5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1zm3 0a2 2 0 0 1-2 2v4a2 2 0 0 1 2 2h10a2 2 0 0 1 2-2V7a2 2 0 0 1-2-2z"
            />
          </svg>
          <span>ExpenseTracker</span>
        </div>

        <!-- Header -->
        <h1 class="title">Welcome Back</h1>
        <p class="subtitle">Sign in to manage your finances</p>

        <!-- Form -->
        <form class="login-form" @submit.prevent="handleLogin">
          <!-- Email -->
          <div class="form-group">
            <label class="form-label">Email Address</label>
            <input
              v-model="form.email"
              type="email"
              placeholder="Enter your email"
              class="form-input"
              required
            />
          </div>

          <!-- Password -->
          <div class="form-group">
            <label class="form-label">Password</label>
            <input
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Enter your password"
              class="form-input"
              required
            />
            <button
              type="button"
              class="password-toggle"
              @click="showPassword = !showPassword"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                class="bi bi-eye-fill"
                viewBox="0 0 16 16"
                v-if="showPassword"
              >
                <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0" />
                <path
                  d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8m8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7"
                />
              </svg>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                class="bi bi-eye-slash"
                viewBox="0 0 16 16"
                v-else
              >
                <path
                  d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7 7 0 0 0-2.79.588l.77.771A6 6 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755q-.247.248-.517.486z"
                />
                <path
                  d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829"
                />
                <path
                  d="M3.35 5.47q-.27.24-.518.487A13 13 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7 7 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12z"
                />
              </svg>
            </button>
          </div>

          <!-- Forgot Password -->
          <div class="forgot-password">
            <router-link to="/forgot-password" class="link">
              Forgot Password?
            </router-link>
          </div>

          <!-- Submit Button -->
          <button type="submit" class="submit-btn" :disabled="isLoading">
            <span v-if="isLoading">Signing in...</span>
            <span v-else>Sign In</span>
          </button>

          <!-- Register Link -->
          <p class="register-link">
            New here?
            <router-link to="/register" class="link"
              >Create an account</router-link
            >
          </p>

          <!-- Add error display -->
          <div v-if="error" class="error-message">
            {{ error }}
          </div>
        </form>
      </div>
    </div>

    <!-- Right Panel: Illustration/Image -->
    <div class="right-panel">
      <div class="illustration">
        <div class="illustration-text">
          <h2>Track Your Spending</h2>
          <p>
            Get insights into your financial habits and save more every month.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref } from "vue";
  import { useRouter } from "vue-router";
  import { useAuthStore } from "@/stores/auth";

  const router = useRouter();
  const authStore = useAuthStore();

  // Form data
  const form = ref({
    email: "",
    password: "",
  });

  const isLoading = ref(false);
  const error = ref("");
  const showPassword = ref(false);

  async function handleLogin() {
    error.value = "";
    isLoading.value = true;

    try {
      await authStore.login(form.value);
      router.push("/");
    } catch (err) {
      error.value = "Invalid email or password";
      console.error("Login error:", err);
    } finally {
      isLoading.value = false;
    }
  }
</script>

<style scoped>
  .login-page {
    display: grid;
    grid-template-columns: 1fr 1fr;
    min-height: 100vh;
    max-height: 100vh;
    overflow: hidden;
    background-color: #ffffff;
  }

  .left-panel {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 2rem;
    background: #ffffff;
    overflow-y: auto;
  }

  .form-container {
    width: 100%;
    max-width: 420px;
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 1.5rem;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 2.5rem;
  }

  .logo svg {
    color: #667eea;
  }

  .title {
    font-size: 2rem;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 0.5rem;
  }

  .subtitle {
    color: #64748b;
    margin-bottom: 2rem;
    font-size: 1rem;
  }

  .login-form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .form-group {
    position: relative;
  }

  .form-label {
    display: block;
    font-size: 0.875rem;
    font-weight: 600;
    color: #374151;
    margin-bottom: 0.5rem;
  }

  .form-input {
    width: 100%;
    padding: 0.875rem 1rem;
    border: 2px solid #e5e7eb;
    border-radius: 10px;
    font-size: 1rem;
    color: #1f2937;
    transition: all 0.2s;
    background: #f9fafb;
    box-sizing: border-box;
  }

  .form-input:focus {
    outline: none;
    border-color: #667eea;
    background: white;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  .password-toggle {
    position: absolute;
    right: 1rem;
    top: 2.35rem;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1.25rem;
    padding: 0.25rem;
    color: #6b7280;
  }

  .forgot-password {
    text-align: right;
    margin-top: -0.5rem;
  }

  .link {
    color: #667eea;
    text-decoration: none;
    font-weight: 500;
    font-size: 0.875rem;
  }

  .link:hover {
    text-decoration: underline;
  }

  .submit-btn {
    width: 100%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    padding: 1rem 1.5rem;
    border-radius: 10px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
    margin-top: 0.5rem;
  }

  .submit-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
  }

  .register-link {
    text-align: center;
    color: #6b7280;
    font-size: 0.875rem;
    margin-top: 1rem;
  }

  .right-panel {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4rem;
    color: white;
    overflow: hidden;
  }

  .illustration-text {
    max-width: 400px;
  }

  .illustration-text h2 {
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 1rem;
    color: white;
  }

  .illustration-text p {
    font-size: 1.125rem;
    opacity: 0.9;
    line-height: 1.6;
  }

  .error-message {
    background-color: #fee2e2;
    color: #dc2626;
    padding: 0.75rem 1rem;
    border-radius: 10px;
    margin-bottom: 1rem;
    font-size: 0.875rem;
  }

  .error-message {
    background-color: #fee2e2;
    color: #dc2626;
    padding: 0.75rem 1rem;
    border-radius: 10px;
    margin-bottom: 1rem;
    font-size: 0.875rem;
    border: 1px solid #fca5a5;
  }

  .form-input:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .submit-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .password-toggle:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
