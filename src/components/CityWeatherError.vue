<template>
  <div class="error-content">
    <div class="error-location">{{ cityName }}</div>
    <div class="error-main">
      <ExclamationTriangleIcon class="error-icon" aria-hidden="true" />
      <div class="error-message">
        <div class="error-title">Unable to load weather</div>
        <div class="error-description">{{ errorMessage }}</div>
      </div>
    </div>
    <div class="error-spacer"></div>
    <button 
      class="retry-button" 
      @click="handleRetry"
      :disabled="retrying"
      aria-label="Retry loading weather data"
    >
      <ArrowPathIcon 
        v-if="!retrying" 
        class="retry-icon" 
        aria-hidden="true"
      />
      <span v-if="retrying">Retrying...</span>
      <span v-else>Retry</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/vue/24/outline';

defineProps<{
  cityName: string;
  errorMessage: string;
  retrying: boolean;
}>();

const emit = defineEmits<{
  retry: [];
}>();

const handleRetry = () => {
  emit('retry');
};
</script>

<style scoped lang="scss">
.error-content {
  display: flex;
  flex-direction: column;
  min-height: 270px;

  .error-location {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 12px;
    text-align: left;
    opacity: 0.95;
  }

  .error-main {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    margin-bottom: 8px;
    padding: 16px;
    background: rgba(244, 67, 54, 0.15);
    border-radius: 8px;
    border: 1px solid rgba(244, 67, 54, 0.3);

    .error-icon {
      width: 32px;
      height: 32px;
      color: #ffebee;
      flex-shrink: 0;
      margin-top: 2px;
    }

    .error-message {
      flex: 1;

      .error-title {
        font-size: 16px;
        font-weight: 600;
        color: #ffebee;
        margin-bottom: 6px;
      }

      .error-description {
        font-size: 14px;
        color: rgba(255, 235, 238, 0.8);
        line-height: 1.4;
      }
    }
  }

  .error-spacer {
    flex: 1;
    min-height: 16px;
  }

  .retry-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    padding: 12px 16px;
    background: rgba(255, 255, 255, 0.2);
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 8px;
    color: white;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    margin-top: 16px;

    .retry-icon {
      width: 18px;
      height: 18px;
      color: white;
    }

    &:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.3);
      border-color: rgba(255, 255, 255, 0.4);
    }

    &:active:not(:disabled) {
      background: rgba(255, 255, 255, 0.25);
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }
}
</style>

