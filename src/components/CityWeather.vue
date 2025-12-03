<template>
  <div class="city-weather">
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
import {ref, onMounted, watch} from 'vue';
import {WeatherData} from '../api/weather/types';
import {fetchWeather} from '../api/weather/weatherApi';

const props = defineProps<{
  cityName: string;
}>();

const weather = ref<WeatherData | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);

const loadWeather = async () => {
  loading.value = true;
  error.value = null;
  try {
    weather.value = await fetchWeather(props.cityName);
    loading.value = false;
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unknown error';
    loading.value = false;
  }
};

onMounted(() => {
  loadWeather();
});

watch(() => props.cityName, () => {
  loadWeather();
});
</script>

<style scoped lang="scss">
.city-weather {
  .loading,
  .error {
    text-align: center;
    padding: 20px;
    font-size: 16px;
  }

  .error {
    color: #ffebee;
    background: rgba(244, 67, 54, 0.2);
    border-radius: 8px;
  }

  .weather-content {
    .location {
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 16px;
      text-align: center;
    }

    .temperature {
      text-align: center;
      margin-bottom: 16px;

      .temp-value {
        font-size: 64px;
        font-weight: 700;
        line-height: 1;
      }

      .temp-unit {
        font-size: 32px;
        opacity: 0.8;
        vertical-align: top;
      }
    }

    .condition {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      margin-bottom: 24px;

      .weather-icon {
        width: 64px;
        height: 64px;
      }

      .condition-text {
        font-size: 18px;
        text-transform: capitalize;
        opacity: 0.9;
      }
    }

    .details {
      display: flex;
      justify-content: space-around;
      padding-top: 24px;
      border-top: 1px solid rgba(255, 255, 255, 0.2);

      .detail-item {
        display: flex;
        flex-direction: column;
        gap: 4px;

        .label {
          font-size: 12px;
          opacity: 0.7;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .value {
          font-size: 18px;
          font-weight: 600;
        }
      }
    }
  }
}
</style>
