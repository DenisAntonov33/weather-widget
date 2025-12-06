<template>
  <div class="settings-panel">
    <div class="settings-header">
      <h2 class="settings-title">Settings</h2>
      <button 
        class="close-button" 
        @click="$emit('close')"
        aria-label="Close settings"
      >
        <ArrowLeftIcon class="icon" aria-hidden="true" />
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
        <Bars3Icon 
          class="drag-handle" 
          aria-label="Drag to reorder"
          role="button"
          tabindex="0"
        />
        <span class="city-name">{{ city.country ? `${city.name}, ${city.country}` : city.name }}</span>
        <button 
          class="delete-button" 
          :class="{ disabled: props.cities.length <= MIN_CITIES_REQUIRED }"
          @click="removeCity(index)" 
          :disabled="props.cities.length <= MIN_CITIES_REQUIRED"
          :aria-label="props.cities.length <= MIN_CITIES_REQUIRED ? 'Cannot delete the last city' : `Delete ${city.name}`"
          :title="props.cities.length <= MIN_CITIES_REQUIRED ? 'Cannot delete the last city' : 'Delete'"
        >
          <XMarkIcon class="icon" aria-hidden="true" />
        </button>
      </div>
    </div>

    <div class="add-location-section">
      <label class="add-label" for="city-input">Add Location:</label>
      <div class="input-group">
        <div class="input-wrapper">
          <input
            id="city-input"
            v-model="newCityName"
            type="text"
            class="city-input"
            placeholder="New York"
            :aria-expanded="showSuggestions && (citySuggestions.length > 0 || searching)"
            aria-autocomplete="list"
            aria-controls="city-suggestions"
            aria-label="Search for a city"
            @input="handleSearch"
            @focus="showSuggestions = true"
            @blur="handleBlur"
            @keydown.enter="handleEnter"
            @keydown.down.prevent="navigateSuggestions(1)"
            @keydown.up.prevent="navigateSuggestions(-1)"
            @keydown.escape="handleEscape"
          />
          <ul 
            id="city-suggestions"
            v-if="showSuggestions && (citySuggestions.length > 0 || searching)" 
            class="suggestions-list"
            role="listbox"
            aria-label="City suggestions"
          >
            <li v-if="searching" class="searching-item" role="status" aria-live="polite">
              <ArrowPathIcon class="spinner-icon" aria-hidden="true" />
              <span>Searching...</span>
            </li>
            <template v-else>
              <li
                v-for="(suggestion, index) in citySuggestions"
                :key="`${suggestion.name}-${suggestion.country}-${index}`"
                role="option"
                :aria-selected="selectedIndex === index"
                :class="{ active: selectedIndex === index }"
                @mousedown="selectCity(suggestion)"
              >
                {{ suggestion.name }}{{ suggestion.state ? `, ${suggestion.state}` : '' }}, {{ suggestion.country }}
              </li>
            </template>
          </ul>
        </div>
        <button 
          class="add-button" 
          @click="addCity"
          :disabled="!canAddCity"
          :aria-label="canAddCity ? 'Add city' : 'Add city, input is empty'"
          title="Add city"
        >
          <PlusIcon class="icon" aria-hidden="true" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue';
import { ArrowLeftIcon, Bars3Icon, XMarkIcon, PlusIcon, ArrowPathIcon } from '@heroicons/vue/24/outline';
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

const SEARCH_DEBOUNCE_MS = 300;
const BLUR_DELAY_MS = 200;
const MIN_QUERY_LENGTH = 2;
const MIN_CITIES_REQUIRED = 1;

const newCityName = ref('');
const citySuggestions = ref<CitySearchResult[]>([]);
const showSuggestions = ref(false);
const selectedIndex = ref(-1);
const searching = ref(false);
const draggedIndex = ref<number | null>(null);
const dragOverIndex = ref<number | null>(null);
let searchTimeout: ReturnType<typeof setTimeout> | null = null;

const canAddCity = computed(() => {
  return newCityName.value.trim().length > MIN_QUERY_LENGTH;
});

const handleSearch = async () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }

  searchTimeout = setTimeout(async () => {
    const query = newCityName.value.trim();
    if (query.length >= MIN_QUERY_LENGTH) {
      searching.value = true;
      try {
        citySuggestions.value = await searchCities(query);
        showSuggestions.value = true;
        selectedIndex.value = -1;
      } catch (error) {
        console.error('City search failed:', error);
        citySuggestions.value = [];
        showSuggestions.value = false;
      } finally {
        searching.value = false;
      }
    } else {
      citySuggestions.value = [];
      showSuggestions.value = false;
      searching.value = false;
    }
  }, SEARCH_DEBOUNCE_MS);
};

const handleBlur = () => {
  showSuggestions.value = false;
};

const handleEscape = () => {
  showSuggestions.value = false;
  selectedIndex.value = -1;
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

const clearSuggestions = () => {
  newCityName.value = '';
  citySuggestions.value = [];
  showSuggestions.value = false;
  selectedIndex.value = -1;
};

const selectCity = (suggestion: CitySearchResult) => {
  emit('addCity', suggestion.name);
  clearSuggestions();
};

const addCity = () => {
  const cityName = newCityName.value.trim();
  if (cityName) {
    emit('addCity', cityName);
    clearSuggestions();
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
});
</script>

<style scoped lang="scss">
@use '../styles/variables' as *;
@use '../styles/mixins' as *;

.settings-panel {
  .settings-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $spacing-xl;
    position: relative;

    .settings-title {
      font-size: $font-lg;
      font-weight: $weight-semibold;
      margin: 0;
      opacity: $opacity-high;
    }

    .close-button {
      @include button-base($button-md);
      position: absolute;
      top: -$spacing-md;
      right: -$spacing-md;
      z-index: $z-button;

      .icon {
        @include icon($icon-md);
        stroke-width: 2.5;
      }
    }
  }

  .cities-list {
    @include flex-column;
    gap: $spacing-sm;
    margin-bottom: $spacing-2xl;

    .city-item {
      display: flex;
      align-items: center;
      gap: $spacing-md;
      padding: $spacing-md;
      background: rgba($color-white, 0.1);
      border-radius: $radius-lg;
      cursor: move;
      transition: background-color $transition-fast;

      &:hover {
        background: rgba($color-white, 0.15);
      }

      &.drag-over {
        border-top: 2px solid rgba($color-white, 0.5);
      }

      &.dragging {
        opacity: 0.5;
      }

      .drag-handle {
        @include icon($icon-xs);
        opacity: $opacity-low;
        cursor: grab;
        user-select: none;

        &:active {
          cursor: grabbing;
        }
      }

      .city-name {
        flex: 1;
        font-size: $font-sm;
        opacity: $opacity-high;
      }

      .delete-button {
        @include button-transparent($button-sm);
        transition: opacity $transition-fast;

        .icon {
          @include icon($icon-xl);
        }

        &.disabled,
        &:disabled {
          opacity: $opacity-disabled;
        }
      }
    }
  }

  .add-location-section {
    .add-label {
      display: block;
      font-size: $font-sm;
      font-weight: $weight-medium;
      margin-bottom: $spacing-sm;
      opacity: $opacity-medium;
    }

    .input-group {
      display: flex;
      gap: $spacing-sm;
      align-items: flex-start;
      position: relative;

      .input-wrapper {
        flex: 1;
        position: relative;
        min-width: 0;
      }

      .city-input {
        @include input-base;
      }

      .suggestions-list {
        position: absolute;
        top: calc(100% + $spacing-xs);
        left: 0;
        right: 0;
        background: rgba($color-primary, 0.95);
        backdrop-filter: blur(10px);
        border-radius: $radius-lg;
        list-style: none;
        padding: $spacing-xs;
        max-height: 200px;
        overflow-y: auto;
        z-index: $z-dropdown;
        box-shadow: $shadow-sm;
        border: 2px solid rgba($color-white, 0.3);

        li {
          padding: 10px $spacing-md;
          cursor: pointer;
          border-radius: $radius-md;
          font-size: $font-sm;
          color: $color-white;
          font-weight: $weight-medium;
          transition: background-color $transition-fast;
          @include flex-center;
          gap: $spacing-sm;

          &:hover,
          &.active {
            background: rgba($color-white, $opacity-background);
          }

          &.searching-item {
            cursor: default;
            opacity: $opacity-low;
            justify-content: center;

            .spinner-icon {
              @include icon($icon-sm);
              animation: spin 1s linear infinite;
            }
          }
        }
      }

      .add-button {
        @include button-base($button-lg);
        border-radius: $radius-lg;
        flex-shrink: 0;
        transition: background-color $transition-fast, opacity $transition-fast;

        .icon {
          @include icon($icon-lg);
        }
      }
    }
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>

