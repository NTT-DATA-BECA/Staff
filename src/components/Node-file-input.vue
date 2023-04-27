<template>
    <div>
      <button @click="allowSelect" id="node-title" cli class="pl-4 text-white text-sm">Choose a Template</button>
    <FileSelect
      class="w-full"
      v-show="isModalVisible"
      @close="closeModal"
    />
    </div>
</template>
  
  <script lang="ts" >
  import FileSelect from './FileSelect.vue';
  export default {
    name: 'NodeFileInput',
  
    components: {
      FileSelect ,
    },
    data() {
      return {
        fileN:'',
        selectedFile: '',
        isModalVisible: false,
      };
    },
    methods: {
      allowSelect (){
        this.isModalVisible = true;
      },     
       showModal() {
       
      },
      closeModal() {
        this.isModalVisible = false;
      }
    }
  };
  </script>
  