<template>
    <div ref="el">
      <h2 id="node-title">Path</h2>
      <input v-model="pdfpath" class="text-black mb-1 ml-2 w-36 align-middle" type="text" df-pdfpath/>
      <select v-model="variable1" df-variable1 class="w-36 text-primary-dark ml-2 h-6">
              <option disabled>choose a group</option>
              <option v-for="header in headers" :key="header" :value="header">{{ header }}</option>
      </select>
    </div>
  </template>
  
  <script lang="ts">
  import { getCurrentInstance, nextTick } from 'vue'
  import { mapState } from 'vuex';
  
  export default {
      name: 'groupPdfBy',
      data() {
          return {
              el: null as any,
              nodeId: 0,
              dataNode: {} as any,
              df: null as any,
              variable1: '',
              pdfpath:"",
          }
      },
      async mounted() {
          this.el = this.$refs.el;
          const internalInstance: any = getCurrentInstance();
          this.df = internalInstance.appContext.config.globalProperties.$df.value;
          await nextTick()
          this.nodeId = this.el?.parentElement?.parentElement?.id?.slice(5);
          if (this.nodeId) {
              this.dataNode = this.df.getNodeFromId(this.nodeId);
              await nextTick()
              this.variable1 = this.dataNode.data.variable1;   
              this.pdfpath = this.dataNode.data.pdfpath         
          };
          this.df.updateNodeDataFromId(this.nodeId, { pdfpath: this.pdfpath, variable1: this.variable1})   
  
  
  
      },
      
      computed: {
      ...mapState(['headers']),
      },
  }
  </script>