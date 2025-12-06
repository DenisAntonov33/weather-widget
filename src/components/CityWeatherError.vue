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
@use '../styles/variables' as *;
@use '../styles/mixins' as *;

.error-content {
  @include flex-column;
  min-height: 270px;

  .error-location {
    font-size: $font-md;
    font-weight: $weight-semibold;
    margin-bottom: $spacing-md;
    text-align: left;
    opacity: $opacity-high;
  }

  .error-main {
    display: flex;
    align-items: flex-start;
    gap: $spacing-lg;
    margin-bottom: $spacing-sm;
    padding: $spacing-lg;
    background: rgba(244, 67, 54, 0.15);
    border-radius: $radius-lg;
    border: 1px solid rgba(244, 67, 54, 0.3);

    .error-icon {
      @include icon($icon-2xl);
      color: #ffebee;
      flex-shrink: 0;
      margin-top: 2px;
    }

    .error-message {
      flex: 1;

      .error-title {
        font-size: $font-md;
        font-weight: $weight-semibold;
        color: #ffebee;
        margin-bottom: 6px;
      }

      .error-description {
        font-size: $font-sm;
        color: rgba(255, 235, 238, 0.8);
        line-height: 1.4;
      }
    }
  }

  .error-spacer {
    flex: 1;
    min-height: $spacing-lg;
  }

  .retry-button {
    @include flex-center;
    gap: $spacing-sm;
    width: 100%;
    padding: $spacing-md $spacing-lg;
    background: rgba($color-white, $opacity-background);
    border: 2px solid rgba($color-white, 0.3);
    border-radius: $radius-lg;
    color: $color-white;
    font-size: $font-sm;
    font-weight: $weight-medium;
    cursor: pointer;
    transition: all $transition-fast;
    margin-top: $spacing-lg;

    .retry-icon {
      @include icon($icon-md);
    }

    &:hover:not(:disabled) {
      background: rgba($color-white, $opacity-background-hover);
      border-color: rgba($color-white, 0.4);
    }

    &:active:not(:disabled) {
      background: rgba($color-white, $opacity-background-active);
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }
}
</style>

