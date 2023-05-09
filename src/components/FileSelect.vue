<template>
  <div class="modal-backdrop">
    <div class="modal">
      <header class="modal-header">
          Editor template
        <button type="button" class="btn-close" @click="close">
          x
        </button>
      </header>
      <section class="modal-body">
          <v-select for="myfileselect" style="color:#2d495c;" v-model="selectedOption" :options="files" class="w-72" df-myfileselect/>
      </section>
      <footer class="modal-footer">

        <button type="button" class="btn-blue" @click="confirm">
          Choose
        </button>
      </footer>
    </div>
  </div>
</template>
<script lang="ts">
import { ref } from 'vue'
import { ipcRenderer } from 'electron';
export default {
  name: 'Modal',
  setup() {

    const files = ref([]);
    const selectedOption = ref("");
    const loadFiles = async () => {
      const response = await ipcRenderer.invoke('getQuillContentName');
      files.value = response;

    };

    loadFiles();

    return {
      files,
      selectedOption,
    };
  },
  methods: {
    close() {
      this.$emit('close');
    },
    async confirm() {
      try {
        const data = await ipcRenderer.invoke('getQuillContentData', { name: this.selectedOption });
        this.$emit('select', this.selectedOption);
        this.close();
      } catch (error) {
        console.error(error);
      }
    },
  },
};
</script>
<style>
.modal-body .vs__clear{
  margin-bottom: 10px;
}
.modal-body .vs__open-indicator{
  display: none;
}
.modal-backdrop {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal {
  background: #6484c4;
  box-shadow: 2px 2px 20px 1px;
  overflow-x: auto;
  display: flex;
  flex-direction: column;
}

.modal-header,
.modal-footer {
  padding: 15px;
  display: flex;
}

.modal-header {
  position: relative;
  border-bottom: 1px solid #eeeeee;
  color: white;
  justify-content: center;
}

.modal-footer {
  border-top: 1px solid #eeeeee;
  flex-direction: column;
  justify-content: flex-end;
}

.modal-body {
  position: relative;
  padding: 20px 10px;
}

.btn-close {
  position: absolute;
  top: 0;
  right: 0;
  border: none;
  font-size: 20px;
  padding: 10px;
  cursor: pointer;
  font-weight: bold;
  color: #2d495c;
  background: transparent;
}

.btn-blue {
  color: white;
  background: #2d495c;
  border: 1px solid #6484c4;
  border-radius: 2px;
}
</style>