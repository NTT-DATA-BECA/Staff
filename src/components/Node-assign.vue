<template>
    <h2 id="node-title" className="text-sm">Assign</h2>
    <input class="w-full text-sm" type="text" df-variable="Add a name">
    <input class="w-full text-xs" type="text" disabled df-assign>
</template>

<script lang="ts">
    export default {
        name: 'NodeAssign'    
    }
</script>