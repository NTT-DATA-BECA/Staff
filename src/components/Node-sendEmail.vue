<template>
    <div ref="el" class="flex flex-col w-max mx-auto text-center">
       <label >
         <input class="text-sm cursor-pointer w-36 hidden" type="text" />
         <div class="text-white bg-blue font-bold rounded-lg text-sm px-2 py-2 text-center">
           {{ 'Send Email' }}
         </div>
       </label>
       <input type="hidden" v-model="mytemplate" df-mytemplate>

    </div>
  </template>
  
<script lang="ts">
import { getCurrentInstance } from 'vue'
export default {
  name: 'SendEmail',
  data() {
    return {
        el:null as any,
        nodeId:0,
        df:null as any,
        mytemplate:'',
        dataNode : {} as any, 
    };
  },
 async mounted() { 
   this.el=this.$refs.el;
   const internalInstance: any = getCurrentInstance();
   this.df = internalInstance.appContext.config.globalProperties.$df.value;
   this.nodeId = this.el?.parentElement.parentElement.id.slice(5);
      if (this.nodeId) {
        this.dataNode = this.df.getNodeFromId(this.nodeId)
        this.mytemplate = this.dataNode.data.mytemplate;
      }
  },
};
</script>
  