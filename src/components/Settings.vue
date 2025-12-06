<template>
  <div class="settings-panel">
    <div class="settings-header">
      <h2 class="settings-title">Settings</h2>
      <button class="close-button" @click="$emit('close')">
        <ArrowLeftIcon class="icon" />
      </button>
    </div>
    
    <div class="cities-list">
      <div
        v-for="(city, index) in props.cities"
        :key="city.id"
        class="city-item"
        :class="{ 
          'drag-over': dragOverIndex === index,
          'dragging': draggedIndex === index
        }"
        :draggable="true"
        @dragstart="handleDragStart(index, $event)"
        @dragover.prevent="handleDragOver(index, $event)"
        @drop="handleDrop(index, $event)"
        @dragend="handleDragEnd"
      >
        <Bars3Icon class="drag-handle" />
        <span class="city-name">{{ city.country ? `${city.name}, ${city.country}` : city.name }}</span>
        <button 
          class="delete-button" 
          :class="{ disabled: props.cities.length <= MIN_CITIES_REQUIRED }"
          @click="removeCity(index)" 
          :disabled="props.cities.length <= MIN_CITIES_REQUIRED"
          :title="props.cities.length <= MIN_CITIES_REQUIRED ? 'Cannot delete the last city' : 'Delete'"
        >
          <XMarkIcon class="icon" />
        </button>
      </div>
    </div>

    <div class="add-location-section">
      <label class="add-label">Add Location:</label>
      <div class="input-group">
        <div class="input-wrapper">
          <input
            v-model="newCityName"
            type="text"
            class="city-input"
            placeholder="New York"
            @input="handleSearch"
            @focus="showSuggestions = true"
            @blur="handleBlur"
            @keydown.enter="handleEnter"
            @keydown.down="navigateSuggestions(1)"
            @keydown.up="navigateSuggestions(-1)"
          />
          <ul v-if="showSuggestions && citySuggestions.length > 0" class="suggestions-list">
            <li
              v-for="(suggestion, index) in citySuggestions"
              :key="`${suggestion.name}-${suggestion.country}-${index}`"
              :class="{ active: selectedIndex === index }"
              @mousedown="selectCity(suggestion)"
            >
              {{ suggestion.name }}{{ suggestion.state ? `, ${suggestion.state}` : '' }}, {{ suggestion.country }}
            </li>
          </ul>
        </div>
        <button class="add-button" @click="addCity" title="Add">
          <PlusIcon class="icon" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue';
import { ArrowLeftIcon, Bars3Icon, XMarkIcon, PlusIcon } from '@heroicons/vue/24/outline';
import { searchCities } from '../api/weather/weatherApi';
import { CitySearchResult } from '../api/weather/types';
import { City } from '../types/city';

const props = defineProps<{
  cities: City[];
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'addCity', cityName: string): void;
  (e: 'removeCity', index: number): void;
  (e: 'reorderCities', fromIndex: number, toIndex: number): void;
}>();

// Constants
const SEARCH_DEBOUNCE_MS = 300;
const BLUR_DELAY_MS = 200;
const MIN_QUERY_LENGTH = 2;
const MIN_CITIES_REQUIRED = 1;

const newCityName = ref('');
const citySuggestions = ref<CitySearchResult[]>([]);
const showSuggestions = ref(false);
const selectedIndex = ref(-1);
const draggedIndex = ref<number | null>(null);
const dragOverIndex = ref<number | null>(null);
let searchTimeout: ReturnType<typeof setTimeout> | null = null;
let blurTimeout: ReturnType<typeof setTimeout> | null = null;

const handleSearch = async () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }

  searchTimeout = setTimeout(async () => {
    const query = newCityName.value.trim();
    if (query.length >= MIN_QUERY_LENGTH) {
      try {
        citySuggestions.value = await searchCities(query);
        showSuggestions.value = true;
        selectedIndex.value = -1;
      } catch (error) {
        console.error('City search failed:', error);
        citySuggestions.value = [];
        showSuggestions.value = false;
      }
    } else {
      citySuggestions.value = [];
      showSuggestions.value = false;
    }
  }, SEARCH_DEBOUNCE_MS);
};

const handleBlur = () => {
  // Delay to allow click on suggestion
  if (blurTimeout) {
    clearTimeout(blurTimeout);
  }
  blurTimeout = setTimeout(() => {
    showSuggestions.value = false;
  }, BLUR_DELAY_MS);
};

const handleEnter = () => {
  if (selectedIndex.value >= 0 && citySuggestions.value[selectedIndex.value]) {
    selectCity(citySuggestions.value[selectedIndex.value]);
  } else if (citySuggestions.value.length > 0) {
    selectCity(citySuggestions.value[0]);
  } else {
    addCity();
  }
};

const navigateSuggestions = (direction: number) => {
  if (citySuggestions.value.length === 0) return;
  
  selectedIndex.value += direction;
  if (selectedIndex.value < 0) {
    selectedIndex.value = citySuggestions.value.length - 1;
  } else if (selectedIndex.value >= citySuggestions.value.length) {
    selectedIndex.value = 0;
  }
};

const selectCity = (suggestion: CitySearchResult) => {
  emit('addCity', suggestion.name);
  newCityName.value = '';
  citySuggestions.value = [];
  showSuggestions.value = false;
};

const addCity = () => {
  const cityName = newCityName.value.trim();
  if (cityName) {
    emit('addCity', cityName);
    newCityName.value = '';
    citySuggestions.value = [];
    showSuggestions.value = false;
  }
};

const removeCity = (index: number) => {
  // Prevent deleting the last city
  if (props.cities.length <= MIN_CITIES_REQUIRED) {
    return;
  }
  emit('removeCity', index);
};

const handleDragStart = (index: number, event: DragEvent) => {
  draggedIndex.value = index;
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/html', '');
  }
};

const handleDragOver = (index: number, event: DragEvent) => {
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move';
  }
  if (draggedIndex.value !== null && draggedIndex.value !== index) {
    dragOverIndex.value = index;
  }
};

const handleDrop = (index: number, event: DragEvent) => {
  event.preventDefault();
  if (draggedIndex.value !== null && draggedIndex.value !== index) {
    emit('reorderCities', draggedIndex.value, index);
  }
  dragOverIndex.value = null;
};

const handleDragEnd = () => {
  draggedIndex.value = null;
  dragOverIndex.value = null;
};

onUnmounted(() => {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
  if (blurTimeout) {
    clearTimeout(blurTimeout);
  }
});
</script>

<style scoped lang="scss">
.settings-panel {
  .settings-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    position: relative;

    .settings-title {
      font-size: 18px;
      font-weight: 600;
      margin: 0;
      opacity: 0.95;
    }

    .close-button {
      position: absolute;
      top: -12px;
      right: -12px;
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
        stroke-width: 2.5;
      }

      &:hover {
        background: rgba(255, 255, 255, 0.3);
      }

      &:active {
        background: rgba(255, 255, 255, 0.4);
      }
    }
  }

  .cities-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 24px;

    .city-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      cursor: move;
      transition: background-color 0.2s ease;

      &:hover {
        background: rgba(255, 255, 255, 0.15);
      }

      &.drag-over {
        border-top: 2px solid rgba(255, 255, 255, 0.5);
      }

      &.dragging {
        opacity: 0.5;
      }

      .drag-handle {
        width: 14px;
        height: 14px;
        color: white;
        opacity: 0.7;
        cursor: grab;
        user-select: none;

        &:active {
          cursor: grabbing;
        }
      }

      .city-name {
        flex: 1;
        font-size: 14px;
        opacity: 0.95;
      }

      .delete-button {
        width: 28px;
        height: 28px;
        border: none;
        background: transparent;
        cursor: pointer;
        opacity: 0.7;
        transition: opacity 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;

        .icon {
          width: 24px;
          height: 24px;
          color: white;
        }

        &:hover:not(.disabled) {
          opacity: 1;
        }

        &.disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        &:disabled {
          cursor: not-allowed;
        }
      }
    }
  }

  .add-location-section {
    .add-label {
      display: block;
      font-size: 14px;
      font-weight: 500;
      margin-bottom: 8px;
      opacity: 0.9;
    }

    .input-group {
      display: flex;
      gap: 8px;
      align-items: flex-start;
      position: relative;

      .input-wrapper {
        flex: 1;
        position: relative;
        min-width: 0;
      }

      .city-input {
        width: 100%;
        padding: 10px 12px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.1);
        color: white;
        font-size: 14px;
        outline: none;
        transition: border-color 0.2s ease;
        box-sizing: border-box;

        &::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }

        &:focus {
          border-color: rgba(255, 255, 255, 0.6);
        }
      }

      .suggestions-list {
        position: absolute;
        top: calc(100% + 4px);
        left: 0;
        right: 0;
        background: rgba(102, 126, 234, 0.95);
        backdrop-filter: blur(10px);
        border-radius: 8px;
        list-style: none;
        padding: 4px;
        max-height: 200px;
        overflow-y: auto;
        z-index: 100;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        border: 2px solid rgba(255, 255, 255, 0.3);

        li {
          padding: 10px 12px;
          cursor: pointer;
          border-radius: 6px;
          font-size: 14px;
          color: white;
          font-weight: 500;
          transition: background-color 0.2s ease;

          &:hover,
          &.active {
            background: rgba(255, 255, 255, 0.2);
          }
        }
      }

      .add-button {
        width: 40px;
        height: 40px;
        border: none;
        background: rgba(255, 255, 255, 0.2);
        color: white;
        border-radius: 8px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background-color 0.2s ease;
        flex-shrink: 0;

        .icon {
          width: 20px;
          height: 20px;
          color: white;
        }

        &:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        &:active {
          background: rgba(255, 255, 255, 0.4);
        }
      }
    }
  }
}
</style>

