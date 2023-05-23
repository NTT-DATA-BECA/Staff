<template>
  <div ref="el" class="nodeselect">
     <p id="node-title" >Template</p>
     <v-select for="mytemplate" style="color:#2d495c; 
     width: 155px;" v-model="mytemplate" :options="options" @option:selected="onChangeFile()" df-mytemplate />
     <input for="headers" type="hidden" v-model="headers" df-headers>
     <input for="variable1" type="hidden" v-model="variable1" df-variable1>

  </div>
 </template>
 <script lang="ts">
 import { getCurrentInstance  } from 'vue'
 import { ipcRenderer } from 'electron';
 import store from '../store'; // Import the Vuex store

 export default {
   name: 'SelectSearch',
   data() {
     return {
       el:null as any,
       nodeId:0,
       outputnodeId:0,
       df:null as any,
       mytemplate:'nothing',
       headers: [],
       variable1: [],
       dataNode : {} as any, 
       options : []
     };
   },
  async mounted() { 
     this.el=this.$refs.el;
     const internalInstance: any = getCurrentInstance();
     this.df = internalInstance.appContext.config.globalProperties.$df.value;
     this.options = await ipcRenderer.invoke('getQuillContentName');
     this.nodeId = this.el?.parentElement?.parentElement?.id?.slice(5);
     this.dataNode = this.df.getNodeFromId(this.nodeId)
     this.mytemplate = this.dataNode.data.mytemplate;
     this.headers = this.dataNode.data.headers;
     this.variable1 = this.dataNode.data.variable1;

  },
   
   methods: {
    async onChangeFile() {
      this.nodeId = this.el?.parentElement?.parentElement?.id?.slice(5);
      this.dataNode = this.df.getNodeFromId(this.nodeId)
      const headers = store.getters.getHeaders // Access headers from Vuex getter
      const variable1 = store.getters.getVariable1 // Access variable1 from Vuex getter
       this.df.updateNodeDataFromId(this.nodeId, { mytemplate: this.mytemplate, csv: "",headers:headers,variable1:variable1,variable2:"" })
       if (this.dataNode.outputs.output_1.connections[0]?.node) { 
       this.outputnodeId = parseFloat(this.dataNode.outputs.output_1.connections[0].node)
       this.df.updateNodeDataFromId(this.outputnodeId, { mytemplate: this.mytemplate, csv: "",headers: headers,variable1: variable1,variable2:"" })
       }
    }  
   },
   
 };
 </script>
  <style>
  .nodeselect .vs__clear {
    margin-bottom: 10px;
  }
  
  .nodeselect .vs__open-indicator {
    display: none;
  }
  </style>