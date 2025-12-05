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
.skeleton-loader {
  .skeleton-location {
    width: 60%;
    height: 20px;
    background: rgba(255, 255, 255, 0.15);
    border-radius: 4px;
    margin-bottom: 12px;
    animation: skeleton-pulse 1.5s ease-in-out infinite;
  }

  .skeleton-main-info {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;

    .skeleton-icon {
      width: 64px;
      height: 64px;
      background: rgba(255, 255, 255, 0.15);
      border-radius: 8px;
      animation: skeleton-pulse 1.5s ease-in-out infinite;
    }

    .skeleton-temperature {
      width: 120px;
      height: 56px;
      background: rgba(255, 255, 255, 0.15);
      border-radius: 4px;
      margin-left: auto;
      animation: skeleton-pulse 1.5s ease-in-out infinite;
    }
  }

  .skeleton-feels-like {
    width: 85%;
    height: 16px;
    background: rgba(255, 255, 255, 0.15);
    border-radius: 4px;
    margin-bottom: 16px;
    animation: skeleton-pulse 1.5s ease-in-out infinite;
  }

  .skeleton-details-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px 20px;
    padding-top: 16px;

    .skeleton-details-column {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .skeleton-detail-item {
      height: 16px;
      background: rgba(255, 255, 255, 0.15);
      border-radius: 4px;
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
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>

