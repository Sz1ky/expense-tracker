import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useSettingsStore = defineStore("settings", () => {
  // Default settings
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
  const isLoadingRates = ref(false);
  const ratesError = ref(null);
  const ratesLastUpdated = ref(null);

  // Track when budget was set
  const budgetEffectiveFrom = ref(
    localStorage.getItem("budgetEffectiveFrom") ||
      new Date().toISOString().slice(0, 7),
  );

  // Load from localStorage on init
  const savedSettings = localStorage.getItem("expenseTrackerSettings");
  if (savedSettings) {
    const parsed = JSON.parse(savedSettings);
    settings.value = {
      currency: parsed.currency || "EUR",
      monthlyBudget: parsed.monthlyBudget || 3000,
    };
  }

  // Load saved exchange rates
  const savedRates = localStorage.getItem("exchangeRates");
  if (savedRates) {
    const parsed = JSON.parse(savedRates);
    exchangeRates.value = parsed.rates;
    ratesLastUpdated.value = parsed.lastUpdated;
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
      console.log("ExchangeRate-API data (EUR base):", data);

      exchangeRates.value = {
        EUR: 1.0,
        USD: data.rates.USD || 1.09,
        GBP: data.rates.GBP || 0.86,
        JPY: data.rates.JPY || 163.0,
      };

      console.log("Final exchange rates:", exchangeRates.value);

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
      console.log("Trying Frankfurter API as fallback...");
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

        console.log("Using Frankfurter fallback rates:", exchangeRates.value);
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

  // Update settings
  function updateSettings(newSettings) {
    // If monthlyBudget is being updated, update the effective date too
    if (newSettings.monthlyBudget !== undefined) {
      budgetEffectiveFrom.value = new Date().toISOString().slice(0, 7);
      localStorage.setItem("budgetEffectiveFrom", budgetEffectiveFrom.value);
    }

    settings.value = { ...settings.value, ...newSettings };

    // Save to localStorage
    localStorage.setItem(
      "expenseTrackerSettings",
      JSON.stringify(settings.value),
    );
  }

  function resetToDefaults() {
    settings.value = {
      currency: "EUR",
      monthlyBudget: 3000,
    };
    budgetEffectiveFrom.value = new Date().toISOString().slice(0, 7);

    localStorage.setItem("budgetEffectiveFrom", budgetEffectiveFrom.value);
    localStorage.setItem(
      "expenseTrackerSettings",
      JSON.stringify(settings.value),
    );
  }

  return {
    // State
    settings,
    exchangeRates,
    isLoadingRates,
    ratesError,
    ratesLastUpdated,

    // Computed
    currencySymbol,
    budgetEffectiveFrom,

    // Actions
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
