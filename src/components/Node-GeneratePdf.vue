<template>
  <div>
    <input for="myinput" class="text-black ml-4 w-28 align-middle" v-model="fileN" type="text" df-myinput>
  </div>
</template>
<script lang="ts">
import { ref } from 'vue'
export default {
  name: 'GeneratePdf',

  setup() {
    var fileN = ref("");
    return {
      fileN,
    };
  }

};

</script>
<!-- =======
      <p id="node-title" class="text-sm">Generate PDF</p>
      <input class="text-class w-full" type="text" v-model="inputText" />
    </div>
  </template>
  
  <script lang="ts"> 
    export default {
      name: 'NodeGeneratePdf',
      data() {
        return {
          inputText: ''
        }
      }
    }
  </script>
  
>>>>>>> origin/develop -->
