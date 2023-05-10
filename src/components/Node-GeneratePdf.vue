<template>
  <div ref="el">
    <input class="text-black ml-4 w-28 align-middle" v-model="mytemplate" type="text" df-mytemplate />
  </div>
</template>
<script lang="ts">
import { ref, onMounted, getCurrentInstance } from 'vue'
export default {
  name: 'GeneratePdf',

  setup() {
    var mytemplate = ref("");
    const el = ref(null) as any;
    const nodeId = ref(0);
    let df = null as any;
    const dataNode = ref({}) as any;
    const internalInstance: any = getCurrentInstance();
    df = internalInstance.appContext.config.globalProperties.$df.value;
    onMounted(async () => {
      nodeId.value = el.value?.parentElement.parentElement.id.slice(5)
      if (nodeId.value) {
        dataNode.value = df.getNodeFromId(nodeId.value)
        mytemplate.value = dataNode.value.data.mytemplate;
      }
    }

    );
    return {
      mytemplate,
    };
  }

};

</script>

