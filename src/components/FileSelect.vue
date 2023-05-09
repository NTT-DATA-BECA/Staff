<template>
  <div ref="el">
      <nodeHeader  title="Get/Post"/>
      <el-select v-model="mytemplate" placeholder="Select" @change="updateSelect" size="small" df-mytemplate>
      <el-option
      v-for="item in options"
      :key="item.value"
      :label="item.label"
      :value="item.value"
      >
      </el-option>
  </el-select>
  <br><br>
      <el-input v-model="mytemplate" df-mytemplate placeholder="Please input" size="small">
      <template #prepend>https://</template>
      </el-input>
  </div>
</template>

<script>
import { defineComponent, onMounted, getCurrentInstance, readonly, ref, nextTick } from 'vue'


export default defineComponent({
  setup() {
      const el = ref(null);
      const nodeId = ref(0);
      let df = null
      const mytemplate = ref('get');
      const dataNode = ref({});
      const options = readonly([
          {
              value: 'get',
              label: 'GET'
          },
          {
              value: 'post',
              label: 'POST'
          }
      ]);
      
      df = getCurrentInstance().appContext.config.globalProperties.$df.value;

      const updateSelect = (value) => {
          dataNode.value.data.mytemplate = value;
          df.updateNodeDataFromId(nodeId.value, dataNode.value);
      }
      
      
      onMounted(async () => {
          await nextTick()
          nodeId.value = el.value.parentElement.parentElement.id.slice(5)
          dataNode.value = df.getNodeFromId(nodeId.value)
          
          
          mytemplate.value = dataNode.value.data.mytemplate;
      });
      
      return {
          el,  mytemplate, options, updateSelect
      }

  }    
  
})
</script>