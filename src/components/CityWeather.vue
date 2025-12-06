<template>
  <div class="city-weather">
    <CityWeatherSkeleton v-if="loading" />
    <CityWeatherError
      v-else-if="error"
      :city-name="props.cityName"
      :error-message="error"
      :retrying="retrying"
      @retry="handleRetry"
    />
    <div v-else-if="weather" class="weather-content">
      <div class="location">{{ locationString }}</div>
      <div class="main-info">
        <div class="icon-section">
          <img
            v-if="weather.icon"
            :src="`https://openweathermap.org/img/wn/${weather.icon}@2x.png`"
            :alt="`${weather.condition} weather icon`"
            class="weather-icon"
          />
        </div>
        <div class="temperature">
          <span class="temp-value">{{ weather.temperature }}</span>
          <span class="temp-unit">°C</span>
        </div>
      </div>
      <div class="feels-like-condition">
        Feels like {{ weather.feelsLike }}°C. {{ capitalizedDescription }}. {{ weather.windDescription }}.
      </div>
      <div class="details-grid">
        <div class="details-column">
          <div class="detail-item">
            <ArrowRightIcon 
              class="wind-icon" 
              :style="windIconStyle"
              aria-hidden="true"
            />
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
            <MapPinIcon 
              class="pressure-icon" 
              aria-hidden="true"
            />
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
import {ref, onMounted, watch, computed} from 'vue';
import {ArrowRightIcon, MapPinIcon} from '@heroicons/vue/24/outline';
import {WeatherData} from '../api/weather/types';
import {fetchWeather} from '../api/weather/weatherApi';
import CityWeatherSkeleton from './CityWeatherSkeleton.vue';
import CityWeatherError from './CityWeatherError.vue';
import {capitalize} from '../utils/capitalize/capitalize';

const props = defineProps<{
  cityName: string;
}>();

const weather = ref<WeatherData | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);
const retrying = ref(false);

// Computed properties
const locationString = computed(() => {
  return weather.value 
    ? `${weather.value.location}, ${weather.value.country}`
    : '';
});

const capitalizedDescription = computed(() => {
  return weather.value ? capitalize(weather.value.description) : '';
});

const windIconStyle = computed(() => {
  return weather.value 
    ? { transform: `rotate(${weather.value.windDegrees}deg)` }
    : {};
});

const loadWeather = async () => {
  loading.value = true;
  error.value = null;
  try {
    weather.value = await fetchWeather(props.cityName);
  } catch (err) {
    const errorMessage = err instanceof Error 
      ? err.message 
      : 'Failed to load weather data. Please try again.';
    error.value = errorMessage;
    console.error('Weather loading error:', err);
  } finally {
    loading.value = false;
    retrying.value = false;
  }
};

const handleRetry = async () => {
  retrying.value = true;
  await loadWeather();
};

onMounted(() => {
  loadWeather();
});

watch(() => props.cityName, () => {
  loadWeather();
}, { immediate: false });
</script>

<style scoped lang="scss">
@use '../styles/variables' as *;
@use '../styles/mixins' as *;

.city-weather {
  margin-bottom: $spacing-2xl;
  padding-bottom: $spacing-2xl;
  border-bottom: 1px solid rgba($color-white, $opacity-border);

  &:last-child {
    margin-bottom: 0;
    padding-bottom: 0;
    border-bottom: none;
  }

  .weather-content {
    .location {
      font-size: $font-md;
      font-weight: $weight-semibold;
      margin-bottom: $spacing-md;
      text-align: left;
      opacity: $opacity-high;
    }

    .main-info {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: $spacing-sm;

      .icon-section {
        flex: 0 0 auto;
      }

      .weather-icon {
        width: $icon-weather;
        height: $icon-weather;
      }

      .temperature {
        text-align: right;
        flex: 1;

        .temp-value {
          font-size: $font-2xl;
          font-weight: $weight-bold;
          line-height: 1;
        }

        .temp-unit {
          font-size: $font-xl;
          opacity: $opacity-high;
          vertical-align: top;
        }
      }
    }

    .feels-like-condition {
      font-size: $font-sm;
      opacity: $opacity-medium;
      text-align: left;
      margin-bottom: $spacing-lg;
      line-height: 1.4;
    }

    .details-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: $spacing-md $spacing-xl;
      padding-top: $spacing-lg;

      .details-column {
        @include flex-column;
        gap: 10px;
      }

      .detail-item {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: $spacing-sm;
        font-size: $font-xs;

        .wind-icon {
          @include icon($icon-sm);
          opacity: $opacity-medium;
          transform-origin: center;
        }

        .pressure-icon {
          @include icon($icon-sm);
          opacity: $opacity-medium;
        }

        .label {
          opacity: $opacity-medium;
          font-weight: $weight-medium;
        }

        .value {
          opacity: $opacity-high;
          font-weight: $weight-normal;
        }
      }
    }
  }
}
</style>
