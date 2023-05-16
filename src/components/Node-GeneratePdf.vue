<template>
  <div ref="el">
    <h2 id="node-title">Choose a path</h2>
    <input v-model="mytemplate" class="text-black ml-2 w-36 align-middle" type="text" df-mytemplate/>
  </div>
</template>
<script lang="ts">
 import { getCurrentInstance , nextTick } from 'vue'
export default {
  name: 'GeneratePdf',
  data(){
    return {
      el:null as any,
      nodeId:0,
      df:null as any,
      mytemplate:[],
      dataNode : {} as any,
  }},
   async mounted(){
     this.el=this.$refs.el;
     const internalInstance: any = getCurrentInstance();
     this.df = internalInstance.appContext.config.globalProperties.$df.value;
     await nextTick()
     this.nodeId = this.el?.parentElement?.parentElement?.id?.slice(5);
     console.log( this.nodeId +"  this.nodeId ")
     this.dataNode = this.df.getNodeFromId(this.nodeId)
     this.mytemplate = this.dataNode.data.mytemplate
  } 
};
</script>