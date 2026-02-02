<template>
  <div class="register-page">
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
        <h1 class="title">Create Your Account</h1>
        <p class="subtitle">
          Join us and start tracking your expenses effortlessly.
        </p>

        <!-- Error Message -->
        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <!-- Success Message -->
        <div v-if="success" class="success-message">
          <svg class="success-icon" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
            />
          </svg>
          <p>Account created successfully! Redirecting...</p>
        </div>

        <!-- Form -->
        <form
          v-if="!success"
          class="register-form"
          @submit.prevent="handleRegister"
        >
          <!-- Full Name -->
          <div class="form-group">
            <label class="form-label">Full Name</label>
            <input
              v-model="form.fullName"
              type="text"
              placeholder="John Doe"
              class="form-input"
              required
              :disabled="isLoading"
            />
          </div>

          <!-- Email -->
          <div class="form-group">
            <label class="form-label">Email Address</label>
            <input
              v-model="form.email"
              type="email"
              placeholder="name@example.com"
              class="form-input"
              required
              :disabled="isLoading"
            />
          </div>

          <!-- Password -->
          <div class="form-group">
            <label class="form-label">Password</label>
            <input
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="*********"
              class="form-input"
              required
              :disabled="isLoading"
              minlength="6"
            />
            <button
              type="button"
              class="password-toggle"
              @click="showPassword = !showPassword"
              :disabled="isLoading"
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

          <!-- Submit Button -->
          <button type="submit" class="submit-btn" :disabled="isLoading">
            <span v-if="isLoading">Creating Account...</span>
            <span v-else>Get Started →</span>
          </button>

          <!-- Divider -->
          <div class="divider">
            <span>OR REGISTER WITH</span>
          </div>

          <!-- Social Login -->
          <div class="social-buttons">
            <button
              type="button"
              class="social-btn google"
              :disabled="isLoading"
            >
              <svg class="social-icon" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </button>
          </div>

          <!-- Login Link -->
          <p class="login-link">
            Already have an account?
            <router-link to="/login" class="link">Sign In</router-link>
          </p>
        </form>
      </div>
    </div>

    <!-- Right Panel: Illustration/Image -->
    <div class="right-panel">
      <div class="illustration">
        <div class="illustration-text">
          <h2>Track. Analyze. Save.</h2>
          <p>
            Visualize your spending habits and take control of your finances.
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
    fullName: "",
    email: "",
    password: "",
  });

  const showPassword = ref(false);
  const isLoading = ref(false);
  const error = ref("");
  const success = ref(false);

  // Handle form submission
  async function handleRegister() {
    error.value = "";
    isLoading.value = true;

    // Basic validation
    if (form.value.password.length < 6) {
      error.value = "Password must be at least 6 characters long";
      isLoading.value = false;
      return;
    }

    try {
      // Call auth store register
      await authStore.register(form.value);

      // Show success message
      success.value = true;

      // Redirect after a brief delay
      setTimeout(() => {
        router.push("/");
      }, 1500);
    } catch (err) {
      console.error("Registration error:", err);
      error.value = err.message || "Registration failed. Please try again.";
    } finally {
      isLoading.value = false;
    }
  }
</script>

<style scoped>
  .register-page {
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

  .register-form {
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
    width: 93%;
    padding: 0.875rem 1rem;
    border: 2px solid #e5e7eb;
    border-radius: 10px;
    font-size: 1rem;
    color: #1f2937;
    transition: all 0.2s;
    background: #f9fafb;
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

  .link {
    color: #667eea;
    text-decoration: none;
    font-weight: 500;
  }

  .link:hover {
    text-decoration: underline;
  }

  .submit-btn {
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

  .divider {
    display: flex;
    align-items: center;
    text-align: center;
    margin: 1.5rem 0;
    color: #9ca3af;
    font-size: 0.875rem;
  }

  .divider::before,
  .divider::after {
    content: "";
    flex: 1;
    border-bottom: 1px solid #e5e7eb;
  }

  .divider span {
    padding: 0 1rem;
  }

  .social-buttons {
    display: flex;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .social-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    padding: 0.875rem 1rem;
    border: 2px solid #e5e7eb;
    border-radius: 10px;
    background: white;
    font-size: 0.875rem;
    font-weight: 600;
    color: #374151;
    cursor: pointer;
    transition: all 0.2s;
  }

  .social-btn:hover {
    border-color: #d1d5db;
    background: #f9fafb;
  }

  .social-icon {
    width: 20px;
    height: 20px;
  }

  .login-link {
    text-align: center;
    color: #6b7280;
    font-size: 0.875rem;
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
    border: 1px solid #fca5a5;
  }

  .success-message {
    background-color: #dcfce7;
    color: #166534;
    padding: 1rem 1.25rem;
    border-radius: 10px;
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    border: 1px solid #86efac;
  }

  .success-icon {
    width: 24px;
    height: 24px;
    flex-shrink: 0;
  }

  .success-message p {
    margin: 0;
    font-weight: 500;
  }

  .form-input:disabled,
  .submit-btn:disabled,
  .social-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .password-toggle:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
