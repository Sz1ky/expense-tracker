<template>
  <div class="forgot-page">
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
        <h1 class="title">Forgot Password?</h1>
        <p class="subtitle">
          Enter your email address and we'll send you a link to reset your
          password.
        </p>

        <!-- Success Message -->
        <div v-if="emailSent">
          <div class="success-message">
            <svg class="success-icon" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
              />
            </svg>
            <p>
              Reset link sent! Check your email.
              <small
                >💡 <strong>Tip:</strong> Check your spam folder if you don't
                see the email.</small
              >
            </p>
          </div>

          <!-- Back to Login -->
          <div class="back-to-login">
            <router-link to="/login" class="link">
              ← Back to Sign In
            </router-link>
          </div>
        </div>

        <!-- Form -->
        <form v-else class="forgot-form" @submit.prevent="handleResetRequest">
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

          <!-- Error message display -->
          <div v-if="error" class="error-message">
            {{ error }}
          </div>

          <!-- Submit Button -->
          <button type="submit" class="submit-btn" :disabled="isLoading">
            <span v-if="isLoading">Sending...</span>
            <span v-else>Send Reset Link</span>
          </button>

          <!-- Back to Login -->
          <div class="back-to-login">
            <router-link to="/login" class="link">
              ← Back to Sign In
            </router-link>
          </div>
        </form>
      </div>
    </div>

    <!-- Right Panel: Illustration/Image -->
    <div class="right-panel">
      <div class="illustration">
        <div class="illustration-text">
          <h2>Secure Access</h2>
          <p>
            We'll help you regain access to your account quickly and securely.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref } from "vue";
  import { useAuthStore } from "@/stores/auth";

  // Form data
  const form = ref({
    email: "",
  });

  const emailSent = ref(false);
  const isLoading = ref(false);
  const error = ref("");
  const authStore = useAuthStore();

  // Handle form submission
  async function handleResetRequest() {
    isLoading.value = true;
    error.value = "";

    try {
      await authStore.resetPassword(form.value.email);
      emailSent.value = true;
    } catch (err) {
      error.value = err.message || "Failed to send reset email";
    } finally {
      isLoading.value = false;
    }
  }
</script>

<style scoped>
  .forgot-page {
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
    line-height: 1.6;
  }

  .success-message {
    background-color: #dcfce7;
    border: 1px solid #86efac;
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 2rem;
    display: flex;
    align-items: flex-start;
    gap: 1rem;
  }

  .success-icon {
    width: 24px;
    height: 24px;
    color: #166534;
    flex-shrink: 0;
    margin-top: 0.125rem;
  }

  .success-message p {
    color: #166534;
    font-weight: 500;
    margin: 0;
    line-height: 1.5;
    align-self: center;
  }

  .forgot-form {
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

  .submit-btn:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
  }

  .submit-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .back-to-login {
    text-align: center;
    margin-top: 1rem;
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
</style>
