<template>
    <div>
        <p id="node-title" class="text-sm">{{ t("nodes.start") }}</p>
    </div>
</template>

<script lang="ts"> 
 import { useI18n } from 'vue-i18n'
    export default {
        name: 'NodeStart', 
        setup() {
    const { t } = useI18n()
    return { t }
  }   
    }
</script>
