<template>
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
