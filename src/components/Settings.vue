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
          :class="{ disabled: props.cities.length === 1 }"
          @click="removeCity(index)" 
          :disabled="props.cities.length === 1"
          :title="props.cities.length === 1 ? 'Cannot delete the last city' : 'Delete'"
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
import { ref } from 'vue';
import { ArrowLeftIcon, Bars3Icon, XMarkIcon, PlusIcon } from '@heroicons/vue/24/outline';
import { searchCities, CitySearchResult } from '../api/weather/weatherApi';

interface City {
  id: string;
  name: string;
  country?: string;
}

const props = defineProps<{
  cities: City[];
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'addCity', cityName: string): void;
  (e: 'removeCity', index: number): void;
  (e: 'reorderCities', fromIndex: number, toIndex: number): void;
}>();

const newCityName = ref('');
const citySuggestions = ref<CitySearchResult[]>([]);
const showSuggestions = ref(false);
const selectedIndex = ref(-1);
let searchTimeout: ReturnType<typeof setTimeout> | null = null;
let draggedIndex: number | null = null;

const handleSearch = async () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }

  searchTimeout = setTimeout(async () => {
    const query = newCityName.value.trim();
    if (query.length >= 2) {
      citySuggestions.value = await searchCities(query);
      showSuggestions.value = true;
      selectedIndex.value = -1;
    } else {
      citySuggestions.value = [];
      showSuggestions.value = false;
    }
  }, 300); // Debounce 300ms
};

const handleBlur = () => {
  // Delay to allow click on suggestion
  setTimeout(() => {
    showSuggestions.value = false;
  }, 200);
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
  if (props.cities.length <= 1) {
    return;
  }
  emit('removeCity', index);
};

const handleDragStart = (index: number, event: DragEvent) => {
  draggedIndex = index;
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/html', '');
  }
  const target = event.currentTarget as HTMLElement;
  if (target) {
    target.style.opacity = '0.5';
  }
};

const handleDragOver = (index: number, event: DragEvent) => {
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move';
  }
  if (draggedIndex !== null && draggedIndex !== index) {
    const items = document.querySelectorAll('.city-item');
    items.forEach((item, i) => {
      if (i === index) {
        item.classList.add('drag-over');
      } else {
        item.classList.remove('drag-over');
      }
    });
  }
};

const handleDrop = (index: number, event: DragEvent) => {
  event.preventDefault();
  if (draggedIndex !== null && draggedIndex !== index) {
    emit('reorderCities', draggedIndex, index);
  }
  document.querySelectorAll('.city-item').forEach(item => {
    item.classList.remove('drag-over');
  });
};

const handleDragEnd = () => {
  document.querySelectorAll('.city-item').forEach(item => {
    if (item instanceof HTMLElement) {
      item.style.opacity = '1';
    }
    item.classList.remove('drag-over');
  });
  draggedIndex = null;
};
</script>

<style scoped lang="scss">
.settings-panel {
  .settings-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    .settings-title {
      font-size: 18px;
      font-weight: 600;
      margin: 0;
      opacity: 0.95;
    }

    .close-button {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      border: none;
      background: rgba(255, 255, 255, 0.2);
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background-color 0.2s ease;

      .icon {
        width: 18px;
        height: 18px;
        color: white;
        stroke-width: 2.5;
      }

      &:hover {
        background: rgba(255, 255, 255, 0.3);
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

