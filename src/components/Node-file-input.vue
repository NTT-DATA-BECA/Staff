<template>
  <div ref="el" class="nodeselect">
    <p id="node-title" className="text-sm">Search for a template</p>
    <v-select for="mytemplate" style="color:#2d495c; 
    width: 155px;" v-model="mytemplate" :options="options" @option:selected="onChangeFile()" df-mytemplate />
  </div>
</template>
<script lang="ts">
import { defineComponent, onMounted, getCurrentInstance, ref } from 'vue'
import { ipcRenderer } from 'electron';
export default defineComponent({
  setup() {
    const el = ref(null) as any;
    const nodeId = ref(0);
    let df = null as any;
    const mytemplate = ref('empty');
    const dataNode = ref({}) as any;
    const outputnodeId = ref(0);
    const options = ref([
    ]);
    const internalInstance: any = getCurrentInstance();
    df = internalInstance.appContext.config.globalProperties.$df.value;
    async function onChangeFile() {
      nodeId.value = el.value?.parentElement.parentElement.id.slice(5)
      dataNode.value = df.getNodeFromId(nodeId.value)
      df.updateNodeDataFromId(nodeId.value, { mytemplate: mytemplate.value, csv: "" })
      if (dataNode.value.outputs.output_1.connections[0].node) {
        outputnodeId.value = parseFloat(dataNode.value.outputs.output_1.connections[0].node)
        df.updateNodeDataFromId(outputnodeId.value, { mytemplate: mytemplate.value, csv: "" })
      }
    }
    onMounted(async () => {
      options.value = await ipcRenderer.invoke('getQuillContentName');
      nodeId.value = el.value?.parentElement.parentElement.id.slice(5)
      dataNode.value = df.getNodeFromId(nodeId.value)
      mytemplate.value = dataNode.value.data.mytemplate;
    }

    );

    return {
      el, mytemplate, options, onChangeFile
    }

  }

})
</script>
<style>
.nodeselect .vs__clear {
  margin-bottom: 10px;
}

.nodeselect .vs__open-indicator {
  display: none;
}
</style>
