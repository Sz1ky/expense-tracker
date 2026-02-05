<template>
  <nav class="navbar">
    <!-- Left: Logo -->
    <div class="navbar-left">
      <div class="logo">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="30"
          height="30"
          fill="currentColor"
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
        <p>ExpenseTracker</p>
      </div>
    </div>

    <!-- Center: Month Selector -->
    <div class="navbar-center">
      <div class="month-selector">
        <button class="arrow-btn" @click="prevMonth">←</button>
        <span class="current-month">{{ currentMonth }}</span>
        <button class="arrow-btn" @click="nextMonth">→</button>
      </div>
    </div>

    <!-- Right: User Avatar -->
    <div class="navbar-right">
      <div class="user-avatar" @click="$emit('openSettings')">
        <div class="avatar-initials">
          {{ userInitials }}
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
  import { ref, computed } from "vue";
  import { useAuthStore } from "@/stores/auth";

  const currentDate = ref(new Date());
  const emit = defineEmits(["openSettings", "monthChanged"]);
  const authStore = useAuthStore();

  const currentMonth = computed(() => {
    return currentDate.value.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  });

  function prevMonth() {
    const newDate = new Date(currentDate.value);
    newDate.setMonth(newDate.getMonth() - 1);
    currentDate.value = newDate;
    emit("monthChanged", newDate);
  }

  function nextMonth() {
    const newDate = new Date(currentDate.value);
    newDate.setMonth(newDate.getMonth() + 1);
    currentDate.value = newDate;
    emit("monthChanged", newDate);
  }

  const userInitials = computed(() => {
    const userName = authStore.user?.name;
    if (!userName) return "U";

    return userName
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  });
</script>

<style scoped>
  .navbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 2rem;
    background-color: white;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    position: sticky;
    top: 0;
    z-index: 100;
    border-radius: 16px;
  }

  .navbar-left,
  .navbar-center,
  .navbar-right {
    flex: 1;
    display: flex;
    align-items: center;
  }

  .navbar-left {
    justify-content: flex-start;
  }

  .navbar-center {
    justify-content: center;
  }

  .navbar-right {
    justify-content: flex-end;
  }

  .logo {
    font-size: 1.5rem;
    font-weight: 700;
    color: #333;
    letter-spacing: -0.5px;
    display: flex;
    align-items: center;
  }

  .logo p {
    margin-left: 10px;
  }

  .month-selector {
    display: flex;
    align-items: center;
    gap: 1rem;
    background: #f8f9fa;
    padding: 0.5rem 1rem;
    border-radius: 12px;
  }

  .arrow-btn {
    background: none;
    border: none;
    font-size: 1.2rem;
    cursor: pointer;
    color: #666;
    padding: 0.25rem 0.5rem;
    border-radius: 6px;
    transition: background-color 0.2s;
  }

  .arrow-btn:hover {
    background-color: #e9ecef;
  }

  .current-month {
    font-weight: 600;
    color: #333;
    min-width: 140px;
    text-align: center;
  }

  .user-avatar {
    cursor: pointer;
    transition: transform 0.2s;
  }

  .user-avatar:hover {
    transform: scale(1.05);
  }

  .avatar-image {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid #f0f0f0;
  }

  .avatar-initials {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 0.9rem;
    border: 2px solid white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
</style>
