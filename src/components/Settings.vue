<template>
  <div class="settings-panel">
    <div class="settings-header">
      <h2 class="settings-title">Settings</h2>
      <button class="close-button" @click="$emit('close')">←</button>
    </div>
    
    <div class="cities-list">
      <div
        v-for="(city, index) in cities"
        :key="city.id"
        class="city-item"
        :draggable="true"
        @dragstart="handleDragStart(index, $event)"
        @dragover.prevent="handleDragOver(index, $event)"
        @drop="handleDrop(index, $event)"
        @dragend="handleDragEnd"
      >
        <span class="drag-handle">☰</span>
        <span class="city-name">{{ city.country ? `${city.name}, ${city.country}` : city.name }}</span>
        <button 
          class="delete-button" 
          :class="{ disabled: cities.length === 1 }"
          @click="removeCity(index)" 
          :disabled="cities.length === 1"
          :title="cities.length === 1 ? 'Cannot delete the last city' : 'Delete'"
        >
          ×
        </button>
      </div>
    </div>

    <div class="add-location-section">
      <label class="add-label">Add Location:</label>
      <div class="input-group">
        <input
          v-model="newCityName"
          type="text"
          class="city-input"
          placeholder="New York"
          @keyup.enter="addCity"
        />
        <button class="add-button" @click="addCity" title="Add">
          ↶
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

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
let draggedIndex: number | null = null;

const addCity = () => {
  const cityName = newCityName.value.trim();
  if (cityName) {
    emit('addCity', cityName);
    newCityName.value = '';
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
      font-size: 22px;
      font-weight: 900;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background-color 0.2s ease;
      line-height: 1;

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
        font-size: 18px;
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
        width: 24px;
        height: 24px;
        border: none;
        background: transparent;
        cursor: pointer;
        font-size: 20px;
        font-weight: 300;
        color: white;
        opacity: 0.7;
        transition: opacity 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        line-height: 1;

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
      align-items: center;

      .city-input {
        flex: 1;
        padding: 10px 12px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.1);
        color: white;
        font-size: 14px;
        outline: none;
        transition: border-color 0.2s ease;

        &::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }

        &:focus {
          border-color: rgba(255, 255, 255, 0.6);
        }
      }

      .add-button {
        width: 40px;
        height: 40px;
        border: none;
        background: rgba(255, 255, 255, 0.2);
        color: white;
        font-size: 20px;
        border-radius: 8px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background-color 0.2s ease;

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

