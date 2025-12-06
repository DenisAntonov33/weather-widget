<template>
  <div class="weather-widget">
    <button v-if="!showSettings" class="settings-button" @click="toggleSettings">
      <Cog6ToothIcon class="icon" />
    </button>
    
    <div 
      ref="contentWrapper" 
      class="content-wrapper"
    >
      <Settings
        v-show="showSettings"
        :cities="cities"
        @close="toggleSettings"
        @add-city="handleAddCity"
        @remove-city="handleRemoveCity"
        @reorder-cities="handleReorderCities"
      />
      
      <div v-show="!showSettings" ref="weatherViewRef" class="weather-view">
        <CityWeather
          v-for="city in cities"
          :key="city.id"
          :city-name="city.name"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Cog6ToothIcon } from '@heroicons/vue/24/outline';
import CityWeather from './components/CityWeather.vue';
import Settings from './components/Settings.vue';
import { City } from './types/city';

const showSettings = ref(false);
const cities = ref<City[]>([]);

const contentWrapper = ref<HTMLElement | null>(null);
const weatherViewRef = ref<HTMLElement | null>(null);

const STORAGE_KEY = 'weather-widget-cities';

const DEFAULT_CITIES: City[] = [
  { id: '1', name: 'London', country: 'UK' },
  { id: '2', name: 'Moscow', country: 'RU' }
];

const loadCities = async () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        cities.value = parsed;
        return;
      }
    } catch (e) {
      console.warn('Failed to parse stored cities, using defaults');
    }
  }
  // If no stored cities, try to get user's location first
  await requestUserLocation();
  
  // If no user location was added, use default cities
  if (cities.value.length === 0) {
    cities.value = [...DEFAULT_CITIES];
    saveCities(); // Save defaults on first visit
  }
};

const requestUserLocation = async () => {
  if (!navigator.geolocation) {
    console.warn('Geolocation is not supported by this browser');
    return;
  }

  return new Promise<void>((resolve) => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { fetchWeatherByCoords } = await import('./api/weather/weatherApi');
          const weather = await fetchWeatherByCoords(
            position.coords.latitude,
            position.coords.longitude
          );
          
          // Add user's location as the first city
          const userCity: City = {
            id: 'user-location',
            name: weather.location,
            country: weather.country
          };
          
          // Check if city already exists
          const exists = cities.value.some(
            c => c.name.toLowerCase() === userCity.name.toLowerCase()
          );
          
          if (!exists) {
            cities.value.unshift(userCity); // Add at the beginning
            saveCities();
          }
        } catch (error) {
          console.warn('Failed to fetch weather for user location:', error);
        } finally {
          resolve();
        }
      },
      (error) => {
        // User denied permission or geolocation failed
        console.warn('Geolocation error:', error.message);
        resolve();
      },
      {
        timeout: 10000,
        enableHighAccuracy: false
      }
    );
  });
};

const saveCities = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cities.value));
  } catch (e) {
    console.error('Failed to save cities to localStorage:', e);
  }
};

const toggleSettings = () => {
  showSettings.value = !showSettings.value;
};

const handleAddCity = async (cityName: string) => {
  const trimmedName = cityName.trim();
  if (trimmedName && !cities.value.some(c => c.name.toLowerCase() === trimmedName.toLowerCase())) {
    // Try to fetch country code from API
    let country: string | undefined;
    try {
      const { fetchWeather } = await import('./api/weather/weatherApi');
      const weather = await fetchWeather(trimmedName);
      country = weather.country;
    } catch (e) {
      // If API call fails, add city without country
      console.warn('Could not fetch country for city:', trimmedName);
    }
    
    const newCity: City = {
      id: Date.now().toString(),
      name: trimmedName,
      country: country
    };
    cities.value.push(newCity);
    saveCities();
  }
};

const handleRemoveCity = (index: number) => {
  // Prevent deleting the last city
  if (cities.value.length <= 1) {
    return;
  }
  cities.value.splice(index, 1);
  saveCities();
};

const handleReorderCities = (fromIndex: number, toIndex: number) => {
  const [moved] = cities.value.splice(fromIndex, 1);
  cities.value.splice(toIndex, 0, moved);
  saveCities();
};

onMounted(() => {
  loadCities();
});

</script>

<style lang="scss">
@use './styles/variables' as *;
@use './styles/mixins' as *;

.weather-widget {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  background: linear-gradient(135deg, $color-primary 0%, $color-secondary 100%);
  border-radius: $radius-xl;
  padding: $spacing-2xl;
  color: $color-white;
  box-shadow: $shadow-md;
  max-width: 350px;
  min-width: 350px;
  margin: 0 auto;
  position: relative;
  width: fit-content;

  .settings-button {
    @include button-base($button-md);
    position: absolute;
    top: $spacing-md;
    right: $spacing-md;
    z-index: $z-button;

    .icon {
      @include icon($icon-md);
    }
  }

  .content-wrapper {
    position: relative;
  }

  .weather-view {
    @include flex-column;
    min-height: 300px;
  }
}
</style>
