import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { useRouter } from "vue-router";

export const useAuthStore = defineStore("auth", () => {
  const router = useRouter();

  // State
  const user = ref(null);
  const token = ref(localStorage.getItem("authToken") || null);
  const isAuthenticated = computed(() => !!token.value);

  // User data from localStorage
  const savedUser = localStorage.getItem("userData");
  if (savedUser) {
    user.value = JSON.parse(savedUser);
  }

  // ===== MOCK API FUNCTIONS (Replace with real API calls later) =====

  // Mock: Get all accounts from localStorage
  const mockGetAccounts = () => {
    const accounts = localStorage.getItem("expenseTrackerAccounts");
    return accounts ? JSON.parse(accounts) : [];
  };

  // Mock: Save accounts to localStorage
  const mockSaveAccounts = (accounts) => {
    localStorage.setItem("expenseTrackerAccounts", JSON.stringify(accounts));
  };

  // Mock: API call delay simulation
  const simulateApiDelay = () => {
    return new Promise((resolve) => setTimeout(resolve, 1000));
  };

  // ===== AUTH ACTIONS =====

  // Register
  async function register(userData) {
    await simulateApiDelay();

    if (!userData.email || !userData.password || !userData.fullName) {
      throw new Error("Missing required fields");
    }

    // Check if email already exists
    const accounts = mockGetAccounts();
    const existingAccount = accounts.find(
      (acc) => acc.email === userData.email,
    );

    if (existingAccount) {
      throw new Error("Email already registered");
    }

    // Create new account
    const newAccount = {
      id: Date.now(),
      name: userData.fullName,
      email: userData.email,
      password: userData.password, // TODO: Hash this before API integration
      createdAt: new Date().toISOString(),
      currency: "EUR",
      monthlyBudget: 3000,
    };

    // Add to accounts
    accounts.push(newAccount);
    mockSaveAccounts(accounts);

    // Auto-login after registration
    const newUser = {
      id: newAccount.id,
      name: newAccount.name,
      email: newAccount.email,
      currency: newAccount.currency,
      monthlyBudget: newAccount.monthlyBudget,
    };

    const mockToken = `mock-token-${Date.now()}`;

    // Save auth state
    user.value = newUser;
    token.value = mockToken;

    // Save to localStorage (temporary)
    localStorage.setItem("authToken", mockToken);
    localStorage.setItem("userData", JSON.stringify(newUser));

    // Save default settings
    localStorage.setItem(
      "expenseTrackerSettings",
      JSON.stringify({
        currency: newAccount.currency,
        monthlyBudget: newAccount.monthlyBudget,
      }),
    );

    console.log("✅ Registration successful:", newUser);
    return newUser;
  }

  // Login
  async function login(credentials) {
    await simulateApiDelay();

    if (!credentials.email || !credentials.password) {
      throw new Error("Email and password required");
    }

    const accounts = mockGetAccounts();
    const account = accounts.find(
      (acc) =>
        acc.email === credentials.email &&
        acc.password === credentials.password,
    );

    if (!account) {
      throw new Error("Invalid email or password");
    }

    // Create user object (without password)
    const loggedInUser = {
      id: account.id,
      name: account.name,
      email: account.email,
      currency: account.currency,
      monthlyBudget: account.monthlyBudget,
    };

    const mockToken = `mock-token-${account.id}`;

    // Save auth state
    user.value = loggedInUser;
    token.value = mockToken;

    // Save to localStorage (temporary)
    localStorage.setItem("authToken", mockToken);
    localStorage.setItem("userData", JSON.stringify(loggedInUser));

    // Ensure settings are loaded
    const savedSettings = localStorage.getItem("expenseTrackerSettings");
    if (!savedSettings) {
      localStorage.setItem(
        "expenseTrackerSettings",
        JSON.stringify({
          currency: account.currency,
          monthlyBudget: account.monthlyBudget,
        }),
      );
    }

    console.log("✅ Login successful:", loggedInUser);
    return loggedInUser;
  }

  // Logout
  function logout() {
    // Clear state
    user.value = null;
    token.value = null;

    // Clear localStorage (temporary)
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");

    // Redirect to login
    router.push("/login");

    console.log("✅ Logged out successfully");
  }

  // Update profile
  async function updateProfile(profileData) {
    if (!user.value) return;

    await simulateApiDelay();

    // Update local state
    user.value = { ...user.value, ...profileData };
    localStorage.setItem("userData", JSON.stringify(user.value));

    // Update in accounts storage
    const accounts = mockGetAccounts();
    const accountIndex = accounts.findIndex(
      (acc) => acc.email === user.value.email,
    );

    if (accountIndex !== -1) {
      accounts[accountIndex] = {
        ...accounts[accountIndex],
        name: profileData.name || accounts[accountIndex].name,
        currency: profileData.currency || accounts[accountIndex].currency,
        monthlyBudget:
          profileData.monthlyBudget || accounts[accountIndex].monthlyBudget,
      };
      mockSaveAccounts(accounts);
    }

    console.log("✅ Profile updated:", user.value);
  }

  // ===== HELPER FUNCTIONS =====

  // Get user by email
  function getUserByEmail(email) {
    const accounts = mockGetAccounts();
    return accounts.find((acc) => acc.email === email);
  }

  // Check if email exists (for forgot password, etc.)
  function checkEmailExists(email) {
    const accounts = mockGetAccounts();
    return accounts.some((acc) => acc.email === email);
  }

  return {
    // State
    user,
    token,
    isAuthenticated,

    // Auth Actions
    login,
    register,
    logout,
    updateProfile,

    // Helper Functions
    getUserByEmail,
    checkEmailExists,
  };
});
