<template>
  <div ref="el">
    <input class="text-black ml-4 w-28 align-middle" v-model="mytemplate" 
    type="text" df-mytemplate/>
  </div>
</template>
<script lang="ts">
import { ref,onMounted,getCurrentInstance,nextTick } from 'vue'
export default {
  name: 'GeneratePdf',

  setup() {
    var mytemplate = ref("");
    const el = ref(null) as any;
    const nodeId = ref(0);
    const inputnodeId = ref(0);
    let df = null as any;
    const dataNode = ref({}) as any;
    const datainputNode = ref({}) as any;
    const internalInstance: any = getCurrentInstance();
    df = internalInstance.appContext.config.globalProperties.$df.value;
    onMounted(async () => {
      await nextTick()
          nodeId.value = el.value?.parentElement.parentElement.id.slice(5)
          console.log('nodeId.value '+nodeId.value)
          dataNode.value = df.getNodeFromId(nodeId.value)
          mytemplate.value=dataNode.value.data.mytemplate; 
          // inputnodeId.value=parseFloat(dataNode.value.inputs.input_1.connections[0].node)
          // datainputNode.value=df.getNodeFromId(nodeId.value)
          // mytemplate.value=datainputNode.value.data.mytemplate;
          // dataNode.value.data.mytemplate==datainputNode.value.data.mytemplate; 
          // df.updateNodeDataFromId(nodeId.value, { mytemplate: mytemplate.value, csv: "" })
      }
      
      );
    return {
      mytemplate,
    };
  }

};

</script>

