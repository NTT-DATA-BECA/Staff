<template>
    <h2 id="node-title">Email</h2>
    <div ref="el" class="-end-px w-64 text-black">
      <select v-model="mytemplate" df-mytemplate class="w-40 text-primary-dark mr-2 h-6">
        <option v-for="header in headersName" :key="header" :value="header">{{ header }}</option>
      </select>
      <input type="hidden" v-model="mytemplate" df-mytemplate>
    </div>
  </template>
  
  <script lang="ts">
  import { getCurrentInstance, nextTick } from 'vue';
  
  export default {
    name: 'sendEmail',
    data() {
      return {
        el: null as any,
        nodeId: 0,
        dataNode: {} as any,
        df: null as any,
        headersName: [] as string[],
        mytemplate: '',
        inputnodeId: 0,
        dataNodeInput: {} as any,
        variable1: [] as any[],
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
        this.headersName = this.dataNode.data.headers;
        this.mytemplate = this.dataNode.data.mytemplate;
        this.variable1 = this.dataNode.data.variable1;
      }
  
      this.df.on('connectionCreated', (data) => {
        const inputData = this.df.getNodeFromId(data.input_id);
        if (inputData.name === "send-email" || inputData.name === "ImportExcel") {
          this.headersName = inputData.data.headers;
         }//else if(inputData.name === "send-email" || inputData.name === "GeneratePdf"){
        //   this.mytemplate = inputData.data.mytemplate;
        // }
      });
    },
  };
  </script>
  