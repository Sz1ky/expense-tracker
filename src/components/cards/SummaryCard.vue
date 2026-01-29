<template>
  <div class="summary-card">
    <!-- Label at top -->
    <div class="card-label">{{ label }}</div>

    <!-- Main value -->
    <div class="card-value">{{ value }}</div>

    <!-- Bottom line: trend + text -->
    <div v-if="trend || description" class="card-bottom-line">
      <!-- Trend indicator (colored) -->
      <span v-if="trend" class="trend-indicator" :class="trendType">
        {{ trend }}
      </span>

      <!-- Description text -->
      <span v-if="description" class="description-text">
        {{ description }}
      </span>
    </div>
  </div>
</template>

<script setup>
  defineProps({
    label: {
      type: String,
      required: true,
    },
    value: {
      type: [String, Number],
      required: true,
    },
    trend: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    trendType: {
      type: String,
      default: "neutral",
      validator: (value) => ["positive", "negative", "neutral"].includes(value),
    },
  });
</script>

<style scoped>
  .summary-card {
    background: white;
    border-radius: 16px;
    padding: 1.5rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    transition:
      transform 0.2s,
      box-shadow 0.2s;
    border: 1px solid #f1f5f9;
  }

  .summary-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
  }

  .card-label {
    font-size: 0.875rem;
    color: #64748b;
    font-weight: 500;
    margin-bottom: 0.5rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .card-value {
    font-size: 2rem;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 0.5rem;
    line-height: 1;
  }

  .card-bottom-line {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
  }

  .trend-indicator {
    padding: 0.25rem 0.5rem;
    border-radius: 999px;
    font-weight: 600;
    font-size: 0.75rem;
  }

  .trend-indicator.positive {
    background-color: #dcfce7;
    color: #166534;
  }

  .trend-indicator.negative {
    background-color: #fee2e2;
    color: #991b1b;
  }

  .trend-indicator.neutral {
    background-color: #f1f5f9;
    color: #475569;
  }

  .description-text {
    color: #94a3b8;
  }
</style>
