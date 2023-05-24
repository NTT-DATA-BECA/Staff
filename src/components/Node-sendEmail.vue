<template>
    <h2 id="node-title">Email</h2>
    <div ref="el" class="-end-px w-64 text-black">
      <select v-model="mytemplate" df-mytemplate class="w-40 text-primary-dark mr-2 h-6">
        <option v-for="header in headers" :key="header" :value="header">{{ header }}</option>
      </select>
      <input type="hidden" v-model="mytemplate" df-mytemplate>
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
        inputnodeId: 0,
        dataNodeInput: {} as any,
        excelData: [] as any[],
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
        this.excelData = this.dataNode.data.excelData;
      }
  
      this.df.on('connectionCreated', (data) => {
        const inputData = this.df.getNodeFromId(data.input_id);
        if(inputData.name === "send-email" || inputData.name === "zip-folder"){
          this.mytemplate = inputData.data.mytemplate;
        }
      });
    },
    computed: {
    ...mapState(['headers', 'excelData']),
    },
  };
  </script>
  