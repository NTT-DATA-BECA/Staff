<template>
  <div ref="el" class="nodeselect">
    <p id="node-title" className="text-sm">Search for a template</p>
    <v-select for="mytemplate" style="color:#2d495c; 
    width: 155px;" v-model="mytemplate" :options="options"
    @option:selected="onChangeFile()" df-mytemplate/>
    <!-- <select class="text-primary-dark w-36 pl" v-model="mytemplate" placeholder="Select" size="small" df-mytemplate>
        <option
        v-for="item in options"
        :key="item"
        :label="item"
        :value="item"
        >
        </option>
      </select> -->
  </div>
</template>
<script lang="ts">
import { defineComponent, onMounted, getCurrentInstance, ref, nextTick } from 'vue'
import { ipcRenderer } from 'electron';
export default defineComponent({
  setup() {
      const el = ref(null) as any;
      const nodeId = ref(0);
      let df = null as any;
      const mytemplate = ref('empty');
      const dataNode = ref({}) as any;
      const options = ref([
      ]);
      
      const internalInstance: any = getCurrentInstance();
      df = internalInstance.appContext.config.globalProperties.$df.value;
     async function onChangeFile (){
        await nextTick()
        nodeId.value = el.value?.parentElement.parentElement.id.slice(5)
        dataNode.value = df.getNodeFromId(nodeId.value)
        df.updateNodeDataFromId(nodeId.value, { mytemplate: mytemplate.value, csv: "" })
      }
      onMounted(async () => {
        options.value=await ipcRenderer.invoke('getQuillContentName');
          await nextTick()
          nodeId.value = el.value?.parentElement.parentElement.id.slice(5)
          dataNode.value = df.getNodeFromId(nodeId.value)
          mytemplate.value=dataNode.value.data.mytemplate;    
      }
      
      );
      
      return {
          el,  mytemplate, options,onChangeFile
      }

  }    
  
})
</script>
<style>
.nodeselect .vs__clear{
  margin-bottom: 10px;
}
.nodeselect .vs__open-indicator{
  display: none;
}
</style>