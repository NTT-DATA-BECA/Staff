<template>
    <div class="modal-backdrop">
      <div class="modal">
        <header class="modal-header">
          <slot name="header">
            Editor template
          </slot>
          <button
            type="button"
            class="btn-close"
            @click="close"
          >
            x
          </button>
        </header>
  
        <section class="modal-body">
          <slot name="body">
            <v-select id="mySelect" v-model="selectedOption" :options="files"
                     class="w-60"  />
          </slot>
         </section>
  
        <footer class="modal-footer">
          
          <button
            type="button"
            class="btn-green"
            @click="confirm"
          >
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
      confirm() {}
    },
  };
</script>
<style>
  .modal-backdrop {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: rgba(0, 0, 0, 0.3);
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .modal {
    background: #FFFFFF;
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
    color: blue;
    justify-content: space-between;
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
    color: blue;
    background: transparent;
  }

  .btn-green {
    color: white;
    background: blue;
    border: 1px solid blue;
    border-radius: 2px;
  }
</style>