<template>
  <h2 id="node-title">{{ t("nodes.Qr-Code") }}</h2>
  <input v-model="qrCodePath" class="text-black ml-2 w-36 align-middle" type="text" df-pdfpath />
</template> 
  
<script lang="ts">
import { getCurrentInstance, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
export default {
  name: 'Qr-Code',
  setup() {
    const { t } = useI18n()
    return { t }
  },
  data() {
    return {
      el: null as any,
      nodeId: 0,
      df: null as any,
      qrCodePath: "",
      dataNode: {} as any,
    }
  },
  async mounted() {
    this.el = this.$refs.el;
    const internalInstance: any = getCurrentInstance();
    this.df = internalInstance.appContext.config.globalProperties.$df.value;
    await nextTick()
    this.nodeId = this.el?.parentElement?.parentElement?.id?.slice(5);
    this.dataNode = this.df.getNodeFromId(this.nodeId)
    this.qrCodePath = this.dataNode.data.qrCodePath
  }
};
</script>