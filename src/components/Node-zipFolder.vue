<template>
  <div ref="el">
    <h2 id="node-title">Zip Folder</h2>
    <input v-model="myzip" class="text-black ml-2 w-36 align-middle" type="text" df-myzip/>
  </div>
</template>
<script lang="ts">
import { getCurrentInstance , nextTick } from 'vue'
export default {
  name: 'NodeZipFolder',
  data(){
  return {
    el:null as any,
    nodeId:0,
    df:null as any,
    myzip:"",
    dataNode : {} as any,
  }},  
  async mounted(){
   this.el=this.$refs.el;
   const internalInstance: any = getCurrentInstance();
   this.df = internalInstance.appContext.config.globalProperties.$df.value;
   await nextTick()
   this.nodeId = this.el?.parentElement?.parentElement?.id?.slice(5);
   if (this.nodeId) {
      this.dataNode = this.df.getNodeFromId(this.nodeId)
      this.myzip = this.dataNode.data.myzip;
   };
   this.df.updateNodeDataFromId(this.nodeId, { myzip: this.myzip })  
  },
}

</script>