import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { useAuthStore } from "@/stores/auth";

export const useSettingsStore = defineStore("settings", () => {
  const authStore = useAuthStore();

  // Default settings (NOT in localStorage - user-specific)
  const settings = ref({
    currency: "EUR",
    monthlyBudget: 3000,
  });

  const exchangeRates = ref({
    EUR: 1.0, // Base currency
    USD: 1.09, // 1 EUR = 1.09 USD (example rate)
    GBP: 0.86, // 1 EUR = 0.86 GBP
    JPY: 163.0, // 1 EUR = 163 JPY
  });

  // Store state
  const isLoading = ref(false);
  const isLoadingRates = ref(false);
  const error = ref(null);
  const ratesError = ref(null);
  const ratesLastUpdated = ref(null);

  // Track when budget was set - PER USER
  const budgetEffectiveFrom = ref(new Date().toISOString().slice(0, 7));

  // Load saved exchange rates from localStorage
  const savedRates = localStorage.getItem("exchangeRates");
  if (savedRates) {
    try {
      const parsed = JSON.parse(savedRates);
      exchangeRates.value = parsed.rates;
      ratesLastUpdated.value = parsed.lastUpdated;
    } catch (e) {
      console.error("Failed to parse saved exchange rates:", e);
    }
  }

  // Currency symbol
  const currencySymbol = computed(() => {
    const symbols = {
      EUR: "€",
      USD: "$",
      GBP: "£",
      JPY: "¥",
    };
    return symbols[settings.value.currency] || "€";
  });

  // ===== LOAD USER SETTINGS FROM API =====
  async function loadSettings() {
    if (!authStore.isAuthenticated) {
      resetToDefaults();
      return;
    }

    isLoading.value = true;
    error.value = null;

    try {
      const token = await authStore.getToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL}/settings`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Failed to load settings: ${response.status}`,
        );
      }

      const data = await response.json();

      // Update local state with user-specific settings
      settings.value = {
        currency: data.currency || "EUR",
        monthlyBudget: data.monthlyBudget || 3000,
      };

      budgetEffectiveFrom.value =
        data.budgetEffectiveFrom || new Date().toISOString().slice(0, 7);
    } catch (err) {
      console.error("Error loading settings:", err);
      error.value = err.message;
      resetToDefaults();
    } finally {
      isLoading.value = false;
    }
  }

  // ===== SAVE USER SETTINGS TO API =====
  async function saveSettings(newSettings) {
    if (!authStore.isAuthenticated) {
      throw new Error("User not authenticated");
    }

    isLoading.value = true;
    error.value = null;

    try {
      const token = await authStore.getToken();

      const response = await fetch(`${import.meta.env.VITE_API_URL}/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currency: newSettings.currency,
          monthlyBudget: newSettings.monthlyBudget,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Failed to save settings: ${response.status}`,
        );
      }

      const data = await response.json();

      // Update local state with new settings
      settings.value = {
        currency: data.currency,
        monthlyBudget: data.monthlyBudget,
      };

      budgetEffectiveFrom.value = data.budgetEffectiveFrom;

      return data;
    } catch (err) {
      console.error("Error saving settings:", err);
      error.value = err.message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  // ===== EXCHANGE RATE API (EUR as base) =====

  // Fetch real exchange rates with EUR as base
  async function fetchExchangeRates() {
    isLoadingRates.value = true;
    ratesError.value = null;

    try {
      const response = await fetch(
        "https://api.exchangerate-api.com/v4/latest/EUR",
      );

      if (!response.ok) {
        throw new Error("Failed to fetch exchange rates");
      }

      const data = await response.json();

      exchangeRates.value = {
        EUR: 1.0,
        USD: data.rates.USD || 1.09,
        GBP: data.rates.GBP || 0.86,
        JPY: data.rates.JPY || 163.0,
      };

      ratesLastUpdated.value = new Date().toISOString();

      // Save to localStorage
      localStorage.setItem(
        "exchangeRates",
        JSON.stringify({
          rates: exchangeRates.value,
          lastUpdated: ratesLastUpdated.value,
        }),
      );

      return exchangeRates.value;
    } catch (error) {
      console.error("Failed to fetch exchange rates:", error);

      // Try Frankfurter as fallback
      try {
        const fallbackResponse = await fetch(
          "https://api.frankfurter.app/latest?from=USD",
        );
        const fallbackData = await fallbackResponse.json();

        // Convert USD-based rates to EUR-based
        const usdToEur = fallbackData.rates.EUR;
        exchangeRates.value = {
          EUR: 1.0,
          USD: 1 / usdToEur,
          GBP: (1 / usdToEur) * fallbackData.rates.GBP,
          JPY: (1 / usdToEur) * fallbackData.rates.JPY,
        };

        // Save fallback rates
        ratesLastUpdated.value = new Date().toISOString();
        localStorage.setItem(
          "exchangeRates",
          JSON.stringify({
            rates: exchangeRates.value,
            lastUpdated: ratesLastUpdated.value,
          }),
        );
      } catch (fallbackError) {
        console.error("Fallback also failed:", fallbackError);
        ratesError.value = error.message;
      }

      return exchangeRates.value;
    } finally {
      isLoadingRates.value = false;
    }
  }

  // Check if rates need updating
  function shouldUpdateRates() {
    if (!ratesLastUpdated.value) return true;

    const lastUpdate = new Date(ratesLastUpdated.value);
    const now = new Date();
    const hoursDiff = (now - lastUpdate) / (1000 * 60 * 60);

    return hoursDiff > 24;
  }

  // Initialize: fetch rates on store creation if needed
  if (shouldUpdateRates()) {
    fetchExchangeRates();
  }

  // ===== CURRENCY CONVERSION =====

  // Convert amount FROM EUR TO display currency
  function convertFromEUR(amount) {
    if (!amount || amount === 0) return 0;

    const rate = exchangeRates.value[settings.value.currency];
    if (!rate) return amount;

    const converted = amount * rate;
    return Math.round(converted * 100) / 100; // Round to 2 decimals
  }

  // Convert amount FROM display currency TO EUR (for storage)
  function convertToEUR(amount) {
    if (!amount || amount === 0) return 0;

    const rate = exchangeRates.value[settings.value.currency];
    if (!rate) return amount;

    const converted = amount / rate;
    return Math.round(converted * 100) / 100; // Round to 2 decimals
  }

  // Format amount with currency symbol (for display)
  function formatCurrency(amount) {
    if (amount === null || amount === undefined) return "-";

    const convertedAmount = convertFromEUR(amount);
    return `${currencySymbol.value}${convertedAmount.toFixed(2)}`;
  }

  // Get the current exchange rate
  function getCurrentRate() {
    return exchangeRates.value[settings.value.currency] || 1.0;
  }

  // ===== BUDGET FUNCTIONS =====

  // Check if month has budget
  function hasBudgetForMonth(yearMonth) {
    return yearMonth >= budgetEffectiveFrom.value;
  }

  // Get budget for specific month (converted to display currency)
  function getBudgetForMonth(yearMonth) {
    if (!hasBudgetForMonth(yearMonth)) return null;
    return convertFromEUR(settings.value.monthlyBudget);
  }

  // Get raw budget in EUR
  function getBudgetInEUR() {
    return settings.value.monthlyBudget;
  }

  // Update settings (public method that calls saveSettings)
  async function updateSettings(newSettings) {
    return await saveSettings(newSettings);
  }

  function resetToDefaults() {
    settings.value = {
      currency: "EUR",
      monthlyBudget: 3000,
    };
    budgetEffectiveFrom.value = new Date().toISOString().slice(0, 7);
  }

  return {
    // State
    settings,
    exchangeRates,
    isLoading,
    isLoadingRates,
    error,
    ratesError,
    ratesLastUpdated,

    // Computed
    currencySymbol,
    budgetEffectiveFrom,

    // Actions
    loadSettings,
    saveSettings,
    hasBudgetForMonth,
    getBudgetForMonth,
    getBudgetInEUR,
    convertFromEUR,
    convertToEUR,
    formatCurrency,
    getCurrentRate,
    fetchExchangeRates,
    updateSettings,
    resetToDefaults,
  };
});
