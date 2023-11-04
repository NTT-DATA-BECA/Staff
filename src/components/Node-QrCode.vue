<template>
    <h2 id="node-title">{{ t("nodes.Qr-Code") }}</h2>
    <input v-model="imgpath" class="text-black ml-2 w-36 align-middle" type="text" df-imgpath />
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
        imgpath: "",
        dataNode: {} as any,
      }
    },
    async mounted() {
      this.el = this.$refs.el;
      const internalInstance: any = getCurrentInstance();
      this.df = internalInstance.appContext.config.globalProperties.$df.value;
      await nextTick()
      this.nodeId = this.el?.parentElement?.parentElement?.id?.slice(5);
      if (this.nodeId) {
      this.dataNode = this.df.getNodeFromId(this.nodeId)
      this.imgpath = this.dataNode.data.imgpath
      }
    }
  };
  </script>