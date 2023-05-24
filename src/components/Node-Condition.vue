<template>
    <h2 id="node-title">Condition</h2>
    <div ref="el" class="-end-px w-64 text-black">
        <select v-model="variable1" df-variable1 class="w-14 text-primary-dark mr-2 h-6">
            <option v-for="header in headers" :key="header" :value="header">{{ header }}</option>
        </select>
        <select df-symbole class="h-6">
            <option value="-">-</option>
            <option value="<">&lt;</option>
            <option value=">">&gt;</option>
            <option value="<=">&le;</option>
            <option value=">=">&ge;</option>
            <option value="=">&#61;</option>
        </select>  
        <input df-variable2 v-model="variable2" class="w-10 ml-2 h-6" type="number">
    </div>
</template>

<script lang="ts">
import { getCurrentInstance, nextTick } from 'vue'
import { mapState } from 'vuex';

export default {
    name: 'Condition',
    data() {
        return {
            el: null as any,
            nodeId: 0,
            dataNode: {} as any,
            df: null as any,
            variable1: '',
            inputnodeId: 0,
            dataNodeInput: {} as any,
            symbole:'',
            variable2:0,
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
            this.symbole = this.dataNode.data.symbole;
            this.variable2 = this.dataNode.data.variable2;
            
        }


    },
    computed: {
    ...mapState(['headers']),
    },
}
</script>