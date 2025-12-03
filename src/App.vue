<template>
  <div class="weather-widget">
    <button class="settings-button" @click="handleButtonClick">
      X
    </button>
    <CityWeather :city-name="'London'" />
    <CityWeather :city-name="'New York'" />
  </div>
</template>

<script setup lang="ts">
import CityWeather from './components/CityWeather.vue';

const handleButtonClick = () => {
  // Action will be implemented later
};

</script>

<style lang="scss">
.weather-widget {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 24px;
  color: white;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  max-width: 350px;
  margin: 0 auto;
  position: relative;
  width: fit-content;

  .settings-button {
    position: absolute;
    top: 12px;
    right: 12px;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: none;
    background: rgba(255, 255, 255, 0.2);
    color: white;
    font-size: 18px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    z-index: 10;

    &:hover {
      background: rgba(255, 255, 255, 0.3);
    }

    &:active {
      background: rgba(255, 255, 255, 0.4);
    }
  }
}
</style>
