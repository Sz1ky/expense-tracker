import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth";
import { app } from "@/firebase";
import { useSettingsStore } from "./settings";

export const useAuthStore = defineStore("auth", () => {
  const router = useRouter();
  const auth = getAuth(app);

  // State
  const user = ref(null);
  const isLoading = ref(false);
  const error = ref(null);

  // Computed
  const isAuthenticated = computed(() => !!user.value);

  // Initialize: Check if user is already logged in
  auth.onAuthStateChanged((firebaseUser) => {
    if (firebaseUser) {
      user.value = {
        id: firebaseUser.uid,
        name: firebaseUser.displayName,
        email: firebaseUser.email,
      };

      // Load user-specific settings
      const settingsStore = useSettingsStore();
      settingsStore.loadSettings();
    } else {
      user.value = null;

      // Reset settings when logging out
      const settingsStore = useSettingsStore();
      settingsStore.resetToDefaults();
    }
  });

  // Actions
  async function register(userData) {
    isLoading.value = true;
    error.value = null;

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        userData.email,
        userData.password,
      );

      // Update profile with name
      await updateProfile(userCredential.user, {
        displayName: userData.fullName,
      });

      // IMPORTANT: Force refresh the user object
      await userCredential.user.reload();

      // Update local state immediately
      const refreshedUser = auth.currentUser;
      user.value = {
        id: refreshedUser.uid,
        name: refreshedUser.displayName,
        email: refreshedUser.email,
      };

      console.log("✅ Registration successful", user.value);
    } catch (err) {
      error.value = err.message;
      console.error("Registration error:", err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function login(credentials) {
    isLoading.value = true;
    error.value = null;

    try {
      await signInWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password,
      );

      console.log("✅ Login successful");
    } catch (err) {
      error.value = err.message;
      console.error("Login error:", err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function logout() {
    try {
      await signOut(auth);

      router.push("/login");
      console.log("✅ Logged out successfully");
    } catch (err) {
      console.error("Logout error:", err);
      throw err;
    }
  }

  async function resetPassword(email) {
    isLoading.value = true;
    error.value = null;

    try {
      await sendPasswordResetEmail(auth, email);
      console.log("✅ Password reset email sent");
      return true;
    } catch (err) {
      error.value = err.message;
      console.error("Password reset error:", err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  // Get Firebase ID token for API requests
  async function getToken() {
    if (!auth.currentUser) {
      throw new Error("User not authenticated");
    }
    return await auth.currentUser.getIdToken();
  }

  return {
    // State
    user,
    isLoading,
    error,

    // Computed
    isAuthenticated,

    // Actions
    register,
    login,
    logout,
    resetPassword,
    getToken,
  };
});
