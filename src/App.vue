<template>
  <div class="left-0 h-screen flex flex-col">
    <nav class="flex bg-slate-50 shadow justify-between">
      <div class="flex items-center">
        <div class="flex">
          <router-link class="link-item" to="/">{{ t("nav.editor") }}</router-link>
          <router-link class="link-item" to="/flow">{{ t("nav.flow") }}</router-link>
          <router-link class="link-item" to="/generator">{{ t("nav.generator") }}</router-link>
          <router-link class="link-item" to="/managers">{{ t("nav.managers") }}</router-link>
        </div>
      </div>
      <div class="flex items-center ml-auto mr-2">
        <LocaleChanger></LocaleChanger>
      </div>
    </nav>
    <router-view />
  </div>
</template>



<script lang="ts">
 import { useI18n } from 'vue-i18n'
 import LocaleChanger from "./components/LocaleChanger.vue"
export default {
  name:"App",
  components: { LocaleChanger },
  setup() {
      const { t } = useI18n()
      return { t }
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