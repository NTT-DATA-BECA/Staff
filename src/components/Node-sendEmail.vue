<template>
  <h2 id="node-title">Email</h2>
  <div ref="el" class="-end-px w-64 text-black">
    <select v-model="mytemplate" df-mytemplate class="w-40 text-primary-dark mr-2 h-6">
      <option v-for="header in headers" :key="header" :value="header">{{ header }}</option>
    </select>
    <!-- <select hidden v-model="mytemplate" df-mytemplate  class="w-40 text-primary-dark mr-2 h-6">
      <option  hidden v-for="excelDat in excelData" :key="excelDat" :value="excelDat">{{ excelDat }}</option>
    </select> -->

  </div> 
</template> 

<script lang="ts">
import { getCurrentInstance, nextTick } from 'vue';
import { mapState } from 'vuex';

export default {
  name: 'sendEmail',
  data() {
    return {
      el: null as any,
      nodeId: 0,
      dataNode: {} as any,
      df: null as any,
      mytemplate: '',
      dataNodeInput: {} as any,
    };
  },

  async mounted() {
    this.el = this.$refs.el;
    const internalInstance: any = getCurrentInstance();
    this.df = internalInstance.appContext.config.globalProperties.$df.value;
    await nextTick();
    this.nodeId = this.el?.parentElement?.parentElement?.id?.slice(5);
    if (this.nodeId) {
      this.dataNode = this.df.getNodeFromId(this.nodeId);
      await nextTick();
      this.mytemplate = this.dataNode.data.mytemplate;
      this.headers = this.dataNode.data.headers;
     // this.excelData = this.dataNode.data.excelData;

    }
   // this.df.updateNodeDataFromId(this.nodeId, { mytemplate: this.mytemplate, headers: this.headers, excelData: this.excelData})

  
  },
  computed: {
  ...mapState(['headers']),
  
  },
  

};
</script>