<template>
  <div class="h-screen flex flex-col">
    <nav class="flex bg-slate-50 shadow justify-between">
      <div class="flex">
        <router-link class="link-item" to="/">Editor</router-link>
        <router-link class="link-item" to="/flow">Flow</router-link>
        <router-link class="link-item" to="/generator">Generator</router-link>
      </div>
      <!-- <a class="py-3 px-4 block bg-red-500 text-slate-50 transition-all" @click="closeApp()">Quit</a> -->
    </nav>
    <router-view />
  </div>
</template>

<script lang="ts">
export default {
  methods: {
    closeApp() {
      window.close();
    }
  }
}
</script>

<style>
.link-item {
  @apply py-2 px-6 block text-primary-dark hover:bg-slate-100 transition-all;
}

.router-link-active {
  @apply bg-primary-dark text-slate-100 hover:bg-primary-dark;
}
</style>