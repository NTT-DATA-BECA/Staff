<template>
  <div>
    <button  @click="allowSelect" id="node-title" class="pl-4 text-white text-sm" >{{ selectedFile || 'Choose a Template' }}</button>
    <FileSelect for="myfileselect" class="w-full" v-show="isModalVisible" @close="closeModal" @select="onFileSelect" df-myfileselect />
  </div>
</template>
  
<script lang="ts" >
import FileSelect from './FileSelect.vue';
export default {
  name: 'NodeFileInput',

  components: {
    FileSelect,
  },
  data() {
    return {
      fileN: '',
      selectedFile: '',
      isModalVisible: false,
    };
  },
  methods: {
    allowSelect() {
      this.isModalVisible = true;
    },
    onFileSelect(fileName) {
    this.selectedFile = fileName;
    this.isModalVisible = false;
  },
    closeModal() {
      this.isModalVisible = false;
    }
  }
};
</script>