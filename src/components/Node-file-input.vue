<template>
  <div>
    <button @click="allowSelect" id="node-title" cli class="pl-4 text-white text-sm">Choose a Template</button>
    <FileSelect class="w-full" v-show="isModalVisible" @close="closeModal" />
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
    showModal() {

    },
    closeModal() {
      this.isModalVisible = false;
    }
  }
};
</script>
  
<!-- =======
  <div class="node-file">
    <p id="node-title" class="text-sm">Choose Template</p>
    <FileSelect v-model="selectedFile" @fileSelected="onFileSelected" />
  </div>
</template>

<script lang="ts">
import FileSelect from "./FileSelect.vue";

export default {
  name: "NodeFileInput",

  components: {
    FileSelect,
  },

  data() {
    return {
      selectedFile: "",
    };
  },

  methods: {
    onFileSelected(filename) {
      this.selectedFile = filename;
      this.$emit("updateFile", filename);
    },
  },
};
</script>
>>>>>>> origin/develop -->
