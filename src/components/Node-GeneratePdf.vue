<template>
  <div ref="el">
    <h2 id="node-title">{{ t("nodes.path") }}</h2>
    <input v-model="pdfpath" class="text-black ml-2 w-36 align-middle" type="text" df-pdfpath/>
  </div>
</template>
<script lang="ts">
 import { getCurrentInstance , nextTick } from 'vue'
 import { useI18n } from 'vue-i18n'
export default {
  name: 'GeneratePdf',
  setup() {
    const { t } = useI18n()
    return { t }
  },
  data(){
    return {
      el:null as any,
      nodeId:0,
      df:null as any,
      pdfpath:"",
      dataNode : {} as any,
  }},
   async mounted(){
     this.el=this.$refs.el;
     const internalInstance: any = getCurrentInstance();
     this.df = internalInstance.appContext.config.globalProperties.$df.value;
     await nextTick()
     this.nodeId = this.el?.parentElement?.parentElement?.id?.slice(5);
     this.dataNode = this.df.getNodeFromId(this.nodeId)
     this.pdfpath = this.dataNode.data.pdfpath

  } 
};
</script>