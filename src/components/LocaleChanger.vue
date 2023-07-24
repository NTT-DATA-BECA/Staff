<script setup lang="ts">
import { ref } from 'vue';

const langs = ref([
  { code: "en", text: "English" },
  { code: "esp", text: "Español" },
]);
</script>

<template>
  <button class="btn flex items-center">
    <select class="bg-primary-dark" v-model="$i18n.locale">
      <option v-for="(lang, i) in langs" :key="`Lang${i}`" :value="lang.code">
        {{ lang.text }}
      </option>
    </select>
    <!-- Your SVG code here -->
  </button>
</template>

<style scoped>
select {
  -webkit-appearance: none;
  -moz-appearance: none;
  text-indent: 1px;
  text-overflow: '';
}
</style>
