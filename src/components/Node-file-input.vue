<template>
    <div class="node-file">
      <p id="node-title" class="text-sm">Choose Template</p>
      <FileSelect v-model="selectedFile" @htmlData="onHtmlData" />
    </div>
  </template>
  
  <script>
  import FileSelect from './FileSelect.vue';
  
  export default {
    name: 'NodeFileInput',
  
    props: {
      nodeId: String,
      port: String
    },
  
    components: {
      FileSelect
    },
    
    emits: ['htmlData'], // declare the "htmlData" event 
  
    data() {
      return {
        selectedFile: '',
        htmlData: ''
      };
    },
  
    methods: {
      onHtmlData(data) {
        this.htmlData = data;
      }
    }
  };
  </script>
  