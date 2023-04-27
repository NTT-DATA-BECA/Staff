<template>
    <div>
      <p id="node-title" class="text-sm">Generate PDF</p>
      <input class="text-class w-full" type="text" v-model="inputText" />
    </div>
  </template>
  
  <script lang="ts"> 
    export default {
      name: 'NodeGeneratePdf',
      data() {
        return {
          inputText: ''
        }
      }
    }
  </script>
  