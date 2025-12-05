<template>
  <div class="weather-widget">
    <button v-if="!showSettings" class="settings-button" @click="toggleSettings">
      <Cog6ToothIcon class="icon" />
    </button>
    
    <div ref="contentWrapper" class="content-wrapper">
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
import { ref, onMounted, nextTick, watch } from 'vue';
import { Cog6ToothIcon } from '@heroicons/vue/24/outline';
import CityWeather from './components/CityWeather.vue';
import Settings from './components/Settings.vue';

interface City {
  id: string;
  name: string;
  country?: string;
}

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

const updateWrapperHeight = () => {
  nextTick(() => {
    if (!contentWrapper.value) return;
    
    let targetHeight = 0;
    
    if (showSettings.value) {
      // Find the settings panel element
      const settingsEl = contentWrapper.value.querySelector('.settings-panel') as HTMLElement;
      if (settingsEl) {
        targetHeight = settingsEl.scrollHeight;
      }
    } else {
      // Use weather view height
      const weatherEl = weatherViewRef.value;
      if (weatherEl) {
        targetHeight = weatherEl.scrollHeight;
      }
    }
    
    if (targetHeight > 0) {
      contentWrapper.value.style.minHeight = `${targetHeight}px`;
    }
  });
};

const toggleSettings = () => {
  showSettings.value = !showSettings.value;
  updateWrapperHeight();
};

watch(cities, () => {
  updateWrapperHeight();
}, { deep: true });

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
  updateWrapperHeight();
});

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
  min-width: 350px;
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
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    z-index: 10;

    .icon {
      width: 18px;
      height: 18px;
      color: white;
    }

    &:hover {
      background: rgba(255, 255, 255, 0.3);
    }

    &:active {
      background: rgba(255, 255, 255, 0.4);
    }
  }

  .content-wrapper {
    position: relative;
    transition: min-height 0.2s ease;
  }

  .weather-view {
    display: flex;
    flex-direction: column;
    min-height: 300px;
  }
}
</style>
