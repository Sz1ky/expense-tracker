<template>
  <div class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <!-- Modal Header -->
      <div class="modal-header">
        <h2 class="modal-title">Settings</h2>
        <button class="close-btn" @click="$emit('close')" aria-label="Close">
          &times;
        </button>
      </div>

      <div class="settings-container">
        <!-- Profile Section (Just avatar) -->
        <section class="settings-section">
          <h3 class="section-title">Profile</h3>

          <!-- Profile Picture Only -->
          <div class="profile-picture">
            <div class="avatar-large">
              {{ userInitials }}
            </div>
          </div>
        </section>

        <!-- Preferences Section -->
        <section class="settings-section">
          <h3 class="section-title">Preferences</h3>

          <!-- Currency -->
          <div class="form-group">
            <label class="form-label">Currency</label>
            <select v-model="userData.currency" class="form-select">
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="JPY">JPY (¥)</option>
            </select>
          </div>

          <!-- Monthly Budget -->
          <div class="form-group">
            <label class="form-label">Monthly Budget</label>
            <div class="budget-input">
              <span class="currency-symbol">{{ currencySymbol }}</span>
              <input
                v-model="userData.monthlyBudget"
                type="number"
                min="0"
                step="100"
                class="form-input"
                placeholder="3000"
              />
            </div>
          </div>
        </section>

        <!-- Danger Zone -->
        <section class="settings-section danger-zone">
          <h3 class="section-title">Danger Zone</h3>

          <div class="danger-actions">
            <button class="btn-danger" @click="exportData">
              Export All Data
            </button>

            <button class="btn-danger logout-btn" @click="handleLogout">
              <svg class="logout-icon" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M10.09 15.59L11.5 17l5-5-5-5-1.41 1.41L12.67 11H3v2h9.67l-2.58 2.59zM19 3H5a2 2 0 0 0-2 2v4h2V5h14v14H5v-4H3v4a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"
                />
              </svg>
              Log Out
            </button>
          </div>
        </section>
      </div>

      <!-- Modal Footer -->
      <div class="modal-footer">
        <button class="btn-cancel" @click="$emit('close')">Cancel</button>
        <button class="btn-save" @click="saveSettings">Save Changes</button>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed, onMounted } from "vue";
  import { useRouter } from "vue-router";

  const emit = defineEmits(["close", "save", "logout"]);

  const router = useRouter();

  // Mock user data
  const userData = ref({
    name: "John Doe",
    currency: "EUR",
    monthlyBudget: 3000,
  });

  // User initials for avatar
  const userInitials = computed(() => {
    return userData.value.name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  });

  // Currency symbol based on selection
  const currencySymbol = computed(() => {
    const symbols = {
      USD: "$",
      EUR: "€",
      GBP: "£",
      JPY: "¥",
    };
    return symbols[userData.value.currency] || "€";
  });

  // Load saved settings
  onMounted(() => {
    const savedSettings = localStorage.getItem("expenseTrackerSettings");
    if (savedSettings) {
      userData.value = { ...userData.value, ...JSON.parse(savedSettings) };
    }
  });

  // Save settings
  function saveSettings() {
    console.log("Saving settings:", userData.value);
    localStorage.setItem(
      "expenseTrackerSettings",
      JSON.stringify(userData.value),
    );
    emit("save", userData.value);
    emit("close");
  }

  // Export data
  function exportData() {
    console.log("Exporting data...");
    alert("Data export feature coming soon!");
  }

  // Logout
  function handleLogout() {
    if (confirm("Are you sure you want to log out?")) {
      console.log("Logging out...");
      emit("logout");
      router.push("/login");
    }
  }

  // Close modal when clicking overlay
  function closeModal(event) {
    if (event.target.classList.contains("modal-overlay")) {
      emit("close");
    }
  }
</script>

<style scoped>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
    padding: 1rem;
    backdrop-filter: blur(4px);
  }

  .modal-content {
    background: white;
    border-radius: 20px;
    width: 100%;
    max-width: 500px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    display: flex;
    flex-direction: column;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem 2rem;
    border-bottom: 1px solid #e5e7eb;
    position: sticky;
    top: 0;
    background: white;
    z-index: 10;
    border-radius: 20px 20px 0 0;
  }

  .modal-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1e293b;
    margin: 0;
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 2rem;
    color: #94a3b8;
    cursor: pointer;
    line-height: 1;
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: background-color 0.2s;
  }

  .close-btn:hover {
    background-color: #f1f5f9;
    color: #64748b;
  }

  .settings-container {
    padding: 0 2rem;
    flex: 1;
    overflow-y: auto;
  }

  .settings-section {
    padding: 1.5rem 0;
    border-bottom: 1px solid #e5e7eb;
  }

  .settings-section:last-of-type {
    border-bottom: none;
  }

  .section-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: #374151;
    margin-bottom: 1.5rem;
  }

  .profile-picture {
    display: flex;
    justify-content: center;
    margin-bottom: 1rem;
  }

  .avatar-large {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 2rem;
    border: 4px solid white;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  }

  .form-group {
    margin-bottom: 1.25rem;
  }

  .form-label {
    display: block;
    font-size: 0.875rem;
    font-weight: 600;
    color: #374151;
    margin-bottom: 0.5rem;
  }

  .form-input,
  .form-select {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 2px solid #e5e7eb;
    border-radius: 10px;
    font-size: 1rem;
    color: #1f2937;
    transition: all 0.2s;
    background: white;
    box-sizing: border-box;
  }

  .form-input:focus,
  .form-select:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  .form-select {
    appearance: none;
    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-position: right 1rem center;
    background-size: 1rem;
    padding-right: 2.5rem;
  }

  .budget-input {
    position: relative;
    display: flex;
    align-items: center;
  }

  .currency-symbol {
    position: absolute;
    left: 1rem;
    font-size: 1rem;
    color: #6b7280;
    font-weight: 500;
  }

  .budget-input .form-input {
    padding-left: 2.5rem;
  }

  .danger-zone .section-title {
    color: #dc2626;
  }

  .danger-actions {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .btn-danger {
    padding: 0.75rem 1rem;
    border-radius: 10px;
    border: 2px solid #fca5a5;
    background: #fef2f2;
    color: #dc2626;
    font-weight: 600;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }

  .btn-danger:hover {
    background: #fee2e2;
    border-color: #f87171;
  }

  .logout-btn {
    border-color: #d1d5db;
    background: #f9fafb;
    color: #374151;
  }

  .logout-btn:hover {
    background: #f3f4f6;
    border-color: #9ca3af;
  }

  .logout-icon {
    width: 18px;
    height: 18px;
  }

  .modal-footer {
    display: flex;
    gap: 1rem;
    padding: 1.5rem 2rem;
    border-top: 1px solid #e5e7eb;
    background: #f9fafb;
    border-radius: 0 0 20px 20px;
    position: sticky;
    bottom: 0;
  }

  .btn-cancel,
  .btn-save {
    flex: 1;
    padding: 0.875rem 1.5rem;
    border-radius: 12px;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s;
    border: none;
  }

  .btn-cancel {
    background: #f1f5f9;
    color: #64748b;
  }

  .btn-cancel:hover {
    background: #e2e8f0;
  }

  .btn-save {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }

  .btn-save:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }
</style>
