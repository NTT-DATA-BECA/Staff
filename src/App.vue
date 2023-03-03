<template>
  <div class="h-screen flex flex-col">
    <nav class="flex bg-slate-50 shadow justify-between">
      <div class="flex">
        <router-link class="link-item" to="/">Flow</router-link>
        <router-link class="link-item" to="/word">Word</router-link>
        <router-link class="link-item" to="/generator">Generator</router-link>
      </div>
      <a class="py-3 px-4 block bg-red-500 text-slate-50 transition-all" @click="closeApp()">Quit</a>
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
  @apply py-3 px-4 block text-slate-500 hover:bg-slate-300 hover:text-slate-500 transition-all;
}

.router-link-active {
  @apply bg-slate-600 text-slate-100;
}
</style>