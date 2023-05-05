<template>
  <p id="node-title" className="text-sm">Search for a template</p>
  <!-- <select for="mytemplate" df-mytemplate class=" ml-1 w-36 text-primary-dark" v-model="selectedOption">
    <option value="" disabled>Select a file</option>
    <option v-for="file in files" :value="file">{{ file }}</option>
  </select> -->
  <select  df-mytemplate className="ml-1 w-36 text-primary-dark">
                <option value="test docx">test docx</option>
                <option value="Startup">Startup</option>
  </select>
</template>
<script lang="ts"> 
import { ipcRenderer } from 'electron';
export default {
 name: 'NodeFileInput',
 data(){
   return {
      files:[] as any,
      selectedOption:"",
     
   }
 },
 mounted() {
   this.loadFiles();
 },
 methods: {
  async loadFiles (){
     const response =await ipcRenderer.invoke('getQuillContentName');
     this.files= response;
 },

 },


};
</script>
