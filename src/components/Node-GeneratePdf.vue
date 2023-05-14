<template>
  <div ref="el">
    <input class="text-black ml-4 w-28 align-middle" v-model="mytemplate" type="text" df-mytemplate/>
  </div>
</template>
<script lang="ts">
import { getCurrentInstance } from 'vue'
export default {
  name: 'GeneratePdf',
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