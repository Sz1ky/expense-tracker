import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useSettingsStore = defineStore("settings", () => {
  // Default settings
  const settings = ref({
    currency: "EUR",
    monthlyBudget: 3000,
  });

  // Default to current month
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

  // Currency symbol
  const currencySymbol = computed(() => {
    const symbols = {
      USD: "$",
      EUR: "€",
      GBP: "£",
      JPY: "¥",
    };
    return symbols[settings.value.currency] || "€";
  });

  // Simple check: does this month have a budget?
  function hasBudgetForMonth(yearMonth) {
    // Budget only applies from budgetEffectiveFrom onward
    return yearMonth >= budgetEffectiveFrom.value;
  }

  // Get budget for a specific month (null if no budget for that month)
  function getBudgetForMonth(yearMonth) {
    return hasBudgetForMonth(yearMonth) ? settings.value.monthlyBudget : null;
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
    settings,
    currencySymbol,
    budgetEffectiveFrom,
    hasBudgetForMonth,
    getBudgetForMonth,
    updateSettings,
    resetToDefaults,
  };
});
