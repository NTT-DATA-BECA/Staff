<template>
    <h2 id="node-title">Email</h2>
    <div ref="el" class="-end-px w-64 text-black">
      <select v-model="mytemplate" df-mytemplate class="w-40 text-primary-dark mr-2 h-6">
        <option v-for="header in headersName" :key="header" :value="header">{{ header }}</option>
      </select>
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
  
    // methods: {
    //   checkEmails() {
    //     const selectedHeader = this.mytemplate;
    //     console.log("Selected header:", selectedHeader);
  
    //     if (this.dataNode.data && this.dataNode.data.hasOwnProperty(selectedHeader)) {
    //       const headers = this.dataNode.data.headers;
    //       const variable1 = this.dataNode.data.variable1;
  
    //       const headerIndex = headers.indexOf(selectedHeader);
    //       if (headerIndex !== -1) {
    //         const columnData = variable1.map((row) => row[headerIndex]);
    //         console.log("Column data:", columnData);
  
    //         const emailsExist = columnData.some((value: string) => /\S+@\S+\.\S+/.test(value));
  
    //         if (emailsExist) {
    //           console.log("Emails exist");
    //         } else {
    //           console.log("Emails don't exist");
    //         }
    //       } else {
    //         console.log("Invalid column data: header not found");
    //       }
    //     } else {
    //       console.log("Invalid column data: header not found");
    //     }
    //   },
    // },
  
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
        }
      });
    },
  
    // watch: {
    //   dataNode: {
    //     deep: true,
    //     immediate: true,
    //     handler() {
    //       if (this.dataNode && this.dataNode.data) {
    //         this.checkEmails();
    //       }
    //     },
    //   },
    //   mytemplate() {
    //     this.checkEmails();
    //   },
    // },
  };
  </script>
  