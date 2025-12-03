<template>
  <div class="weather-widget">
    <CityWeather :city-name="'London'" />
    <CityWeather :city-name="'New York'" />
  </div>
</template>

<script setup lang="ts">
import CityWeather from './components/CityWeather.vue';

</script>

<style scoped lang="scss">
@use './styles/main.scss';
</style>
