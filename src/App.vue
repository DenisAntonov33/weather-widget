<template>
  <div class="weather-widget">
    <div v-if="loading" class="loading">Loading weather...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="weather" class="weather-content">
      <div class="location">{{ weather.location }}</div>
      <div class="temperature">
        <span class="temp-value">{{ weather.temperature }}</span>
        <span class="temp-unit">°C</span>
      </div>
      <div class="condition">
        <img
            v-if="weather.icon"
            :src="`https://openweathermap.org/img/wn/${weather.icon}@2x.png`"
            :alt="weather.condition"
            class="weather-icon"
        />
        <span class="condition-text">{{ weather.description }}</span>
      </div>
      <div class="details">
        <div class="detail-item">
          <span class="label">Humidity:</span>
          <span class="value">{{ weather.humidity }}%</span>
        </div>
        <div class="detail-item">
          <span class="label">Wind:</span>
          <span class="value">{{ weather.windSpeed }} m/s</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, onMounted} from 'vue';
import {WeatherData} from './api/weather/types';
import {fetchWeather} from './api/weather/weatherApi';

const weather = ref<WeatherData | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);

// Get city from data attribute or use default
const getCity = (): string => {
  const element = document.querySelector('weather-widget');
  return element?.getAttribute('data-city') || 'London';
};

onMounted(async () => {
  try {
    const city = getCity();
    weather.value = await fetchWeather(city);
    loading.value = false;
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unknown error';
    loading.value = false;
  }
});
</script>

<style scoped lang="scss">
@use './styles/main.scss';
</style>
