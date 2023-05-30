<template>
    <h2 id="node-title">Group PDF By</h2>
    <div ref="el" class="-end-px w-64 text-black">
        <select v-model="variable1" df-variable1 class="w-36 text-primary-dark ml-1 h-6">
            <option v-for="header in headers" :key="header" :value="header">{{ header }}</option>
        </select>
    </div>
</template>

<script lang="ts">
import { getCurrentInstance, nextTick } from 'vue'
import { mapState } from 'vuex';

export default {
    name: 'groupPdfBy',
    data() {
        return {
            el: null as any,
            nodeId: 0,
            dataNode: {} as any,
            df: null as any,
            variable1: '',
        }
    },
    async mounted() {
        this.el = this.$refs.el;
        const internalInstance: any = getCurrentInstance();
        this.df = internalInstance.appContext.config.globalProperties.$df.value;
        await nextTick()
        this.nodeId = this.el?.parentElement?.parentElement?.id?.slice(5);
        if (this.nodeId) {
            this.dataNode = this.df.getNodeFromId(this.nodeId);
            await nextTick()
            this.variable1 = this.dataNode.data.variable1;            
        }


    },
    computed: {
    ...mapState(['headers']),
    },
}
</script>