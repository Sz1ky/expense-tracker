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

  // Actions
  function login(credentials) {
    // Mock login - replace with real API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (credentials.email && credentials.password) {
          const mockUser = {
            id: 1,
            name: "John Doe",
            email: credentials.email,
            avatar: null,
          };

          const mockToken = "mock-jwt-token-12345";

          // Save to state
          user.value = mockUser;
          token.value = mockToken;

          // Save to localStorage
          localStorage.setItem("authToken", mockToken);
          localStorage.setItem("userData", JSON.stringify(mockUser));

          console.log("Login successful:", mockUser);
          resolve(mockUser);
        } else {
          reject(new Error("Invalid credentials"));
        }
      }, 1000); // Simulate API delay
    });
  }

  function register(userData) {
    // Mock registration
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (userData.email && userData.password && userData.fullName) {
          const newUser = {
            id: Date.now(),
            name: userData.fullName,
            email: userData.email,
            avatar: null,
          };

          const mockToken = "mock-jwt-token-" + Date.now();

          // Save to state
          user.value = newUser;
          token.value = mockToken;

          // Save to localStorage
          localStorage.setItem("authToken", mockToken);
          localStorage.setItem("userData", JSON.stringify(newUser));

          console.log("Registration successful:", newUser);
          resolve(newUser);
        } else {
          reject(new Error("Missing required fields"));
        }
      }, 1000);
    });
  }

  function logout() {
    // Clear state
    user.value = null;
    token.value = null;

    // Clear localStorage
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");

    // Redirect to login
    router.push("/login");

    console.log("Logged out successfully");
  }

  function updateProfile(profileData) {
    if (user.value) {
      user.value = { ...user.value, ...profileData };
      localStorage.setItem("userData", JSON.stringify(user.value));
    }
  }

  function register(userData) {
    // Mock registration
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (userData.email && userData.password && userData.fullName) {
          const newUser = {
            id: Date.now(),
            name: userData.fullName,
            email: userData.email,
            avatar: null,
            currency: "EUR", // Default currency
            monthlyBudget: 3000, // Default budget
          };

          const mockToken = "mock-jwt-token-" + Date.now();

          // Save to state
          user.value = newUser;
          token.value = mockToken;

          // Save to localStorage
          localStorage.setItem("authToken", mockToken);
          localStorage.setItem("userData", JSON.stringify(newUser));

          // Also save default settings
          localStorage.setItem(
            "expenseTrackerSettings",
            JSON.stringify({
              currency: "EUR",
              monthlyBudget: 3000,
            }),
          );

          console.log("Registration successful:", newUser);
          resolve(newUser);
        } else {
          reject(new Error("Missing required fields"));
        }
      }, 1000);
    });
  }

  return {
    // State
    user,
    token,
    isAuthenticated,

    // Actions
    login,
    register,
    logout,
    updateProfile,
  };
});
