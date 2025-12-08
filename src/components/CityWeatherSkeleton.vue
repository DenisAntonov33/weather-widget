<template>
  <div class="skeleton-loader">
    <div class="skeleton-location"></div>
    <div class="skeleton-main-info">
      <div class="skeleton-icon"></div>
      <div class="skeleton-temperature"></div>
    </div>
    <div class="skeleton-feels-like"></div>
    <div class="skeleton-details-grid">
      <div class="skeleton-details-column">
        <div class="skeleton-detail-item"></div>
        <div class="skeleton-detail-item"></div>
        <div class="skeleton-detail-item"></div>
      </div>
      <div class="skeleton-details-column">
        <div class="skeleton-detail-item"></div>
        <div class="skeleton-detail-item"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// No props needed - this is a pure presentational component
</script>

<style scoped lang="scss">
@use '../styles/variables' as *;
@use '../styles/mixins' as *;

.skeleton-loader {
  .skeleton-location {
    width: 60%;
    height: 20px;
    background: rgba($color-white, $opacity-border);
    border-radius: $radius-sm;
    margin-bottom: $spacing-md;
    animation: skeleton-pulse 1.5s ease-in-out infinite;
  }

  .skeleton-main-info {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: $spacing-sm;

    .skeleton-icon {
      width: $icon-weather;
      height: $icon-weather;
      background: rgba($color-white, $opacity-border);
      border-radius: $radius-lg;
      animation: skeleton-pulse 1.5s ease-in-out infinite;
    }

    .skeleton-temperature {
      width: 120px;
      height: $font-2xl;
      background: rgba($color-white, $opacity-border);
      border-radius: $radius-sm;
      margin-left: auto;
      animation: skeleton-pulse 1.5s ease-in-out infinite;
    }
  }

  .skeleton-feels-like {
    width: 85%;
    height: $spacing-lg;
    background: rgba($color-white, $opacity-border);
    border-radius: $radius-sm;
    margin-bottom: $spacing-lg;
    animation: skeleton-pulse 1.5s ease-in-out infinite;
  }

  .skeleton-details-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: $spacing-md $spacing-xl;
    padding-top: $spacing-lg;

    .skeleton-details-column {
      @include flex-column;
      gap: 10px;
    }

    .skeleton-detail-item {
      height: $spacing-lg;
      background: rgba($color-white, $opacity-border);
      border-radius: $radius-sm;
      animation: skeleton-pulse 1.5s ease-in-out infinite;

      &:nth-child(1) {
        width: 70%;
      }

      &:nth-child(2) {
        width: 60%;
      }

      &:nth-child(3) {
        width: 55%;
      }
    }
  }
}

@keyframes skeleton-pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>
