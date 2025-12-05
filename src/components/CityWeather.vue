<template>
  <div class="city-weather">
    <CityWeatherSkeleton v-if="loading" />
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="weather" class="weather-content">
      <div class="location">{{ weather.location }}, {{ weather.country }}</div>
      <div class="main-info">
        <div class="icon-section">
          <img
              v-if="weather.icon"
              :src="`https://openweathermap.org/img/wn/${weather.icon}@2x.png`"
              :alt="weather.condition"
              class="weather-icon"
          />
        </div>
        <div class="temperature">
          <span class="temp-value">{{ weather.temperature }}</span>
          <span class="temp-unit">°C</span>
        </div>
      </div>
      <div class="feels-like-condition">
        Feels like {{ weather.feelsLike }}°C. {{ capitalize(weather.description) }}. {{ weather.windDescription }}.
      </div>
      <div class="details-grid">
        <div class="details-column">
          <div class="detail-item">
            <ArrowRightIcon class="wind-icon" :style="{ transform: `rotate(${weather.windDegrees}deg)` }" />
            <span class="value">{{ weather.windSpeed }}m/s {{ weather.windDirection }}</span>
          </div>
          <div class="detail-item">
            <span class="label">Humidity:</span>
            <span class="value">{{ weather.humidity }}%</span>
          </div>
          <div class="detail-item">
            <span class="label">Visibility:</span>
            <span class="value">{{ weather.visibility }}km</span>
          </div>
        </div>
        <div class="details-column">
          <div class="detail-item">
            <MapPinIcon class="pressure-icon" />
            <span class="value">{{ weather.pressure }}hPa</span>
          </div>
          <div class="detail-item">
            <span class="label">Dew point:</span>
            <span class="value">{{ weather.dewPoint }}°C</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, onMounted, watch} from 'vue';
import {ArrowRightIcon, MapPinIcon} from '@heroicons/vue/24/outline';
import {WeatherData} from '../api/weather/types';
import {fetchWeather} from '../api/weather/weatherApi';
import CityWeatherSkeleton from './CityWeatherSkeleton.vue';

const props = defineProps<{
  cityName: string;
}>();

const weather = ref<WeatherData | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);

const capitalize = (str: string): string => {
  return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

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
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);

  &:last-child {
    margin-bottom: 0;
    padding-bottom: 0;
    border-bottom: none;
  }

  .error {
    text-align: center;
    padding: 20px;
    font-size: 16px;
    color: #ffebee;
    background: rgba(244, 67, 54, 0.2);
    border-radius: 8px;
  }

  .weather-content {
    .location {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 12px;
      text-align: left;
      opacity: 0.95;
    }

    .main-info {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8px;

      .icon-section {
        flex: 0 0 auto;
      }

      .weather-icon {
        width: 64px;
        height: 64px;
      }

      .temperature {
        text-align: right;
        flex: 1;

        .temp-value {
          font-size: 56px;
          font-weight: 700;
          line-height: 1;
        }

        .temp-unit {
          font-size: 32px;
          opacity: 0.95;
          vertical-align: top;
        }
      }
    }

    .feels-like-condition {
      font-size: 14px;
      opacity: 0.9;
      text-align: left;
      margin-bottom: 16px;
      line-height: 1.4;
    }

    .details-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px 20px;
      padding-top: 16px;

      .details-column {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .detail-item {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 8px;
        font-size: 13px;

        .wind-icon {
          width: 16px;
          height: 16px;
          color: white;
          opacity: 0.9;
          transform-origin: center;
        }

        .pressure-icon {
          width: 16px;
          height: 16px;
          color: white;
          opacity: 0.9;
        }

        .label {
          opacity: 0.9;
          font-weight: 500;
        }

        .value {
          opacity: 0.95;
          font-weight: 400;
        }
      }
    }
  }
}
</style>
