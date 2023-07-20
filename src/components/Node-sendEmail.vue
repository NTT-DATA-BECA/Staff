<template>
  <h2 id="node-title">{{ t("nodes.email") }}</h2>
</template> 

<script lang="ts">
 import { useI18n } from 'vue-i18n'
export default {
  name: 'sendEmail',
  setup() {
    const { t } = useI18n()
    return { t }
  }
};
</script>