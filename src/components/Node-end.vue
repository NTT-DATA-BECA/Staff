<template>
    <div>
        <p id="node-title" className="text-sm">{{ t("nodes.end") }}</p>
    </div>
</template>

<script lang="ts"> 
import { useI18n } from 'vue-i18n'
    export default {
        name: 'NodeEnd', 
        setup() {
    const { t } = useI18n()
    return { t }
  }   
    }
</script>
