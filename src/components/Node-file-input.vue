<template>
  <div ref="el" class="nodeselect">
     <p id="node-title" >Template</p>
     <v-select for="mytemplate" style="color:#2d495c; 
     width: 155px;" v-model="mytemplate" :options="options" @option:selected="onChangeFile()" df-mytemplate />
  </div>
 </template>
 <script lang="ts">
 import { getCurrentInstance  } from 'vue'
 import { ipcRenderer } from 'electron';
 
 export default {
   name: 'SelectSearch',
   data() {
     return {
       el:null as any,
       nodeId:0,
       outputnodeId:0,
       df:null as any,
       mytemplate:'nothing',
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
   },
   methods: {
    async onChangeFile() {
      this.nodeId = this.el?.parentElement?.parentElement?.id?.slice(5);
       this.dataNode = this.df.getNodeFromId(this.nodeId)
       this.df.updateNodeDataFromId(this.nodeId, { mytemplate: this.mytemplate, csv: "",headers:[],variable1:"",variable2:"" })
       if (this.dataNode.outputs.output_1.connections[0]?.node) { 
       this.outputnodeId = parseFloat(this.dataNode.outputs.output_1.connections[0].node)
       this.df.updateNodeDataFromId(this.outputnodeId, { mytemplate: this.mytemplate, csv: "",headers:[],variable1:"",variable2:"" })
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