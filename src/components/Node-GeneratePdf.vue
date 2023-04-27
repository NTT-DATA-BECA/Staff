<template>
    <div>
    <input for="myinput" class="ml-4 w-28 align-middle" v-model="fileN" type="text" df-myinput>
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