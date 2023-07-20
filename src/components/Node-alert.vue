<template>
    <h2 id="node-title">{{ t("nodes.alert") }}</h2>
    <div ref="el" class="-end-px w-64 text-black">
        <select v-model="variable1" df-variable1 class="ml-1 w-14 text-primary-dark mr-2 h-6">
            <option v-for="header in headers" :key="header" :value="header">{{ header }}</option>
        </select>
        <select df-symbole class="h-6">
            <option value="<">&lt;</option>
            <option value=">">&gt;</option>
            <option value="<=">&le;</option>
            <option value=">=">&ge;</option>
            <option value="=">&#61;</option>
        </select>  
        <input df-variable2 v-model="variable2" class="w-10 ml-2 h-6" type="number">
        <input v-model="message" class="text-black ml-1 w-36 align-middle" type="text" df-message/>
    </div>
</template>

<script lang="ts">
import { getCurrentInstance, nextTick } from 'vue'
import { mapState } from 'vuex';
import { useI18n } from 'vue-i18n'
export default {
    name: 'alert',
    setup() {
    const { t } = useI18n()
    return { t }
  },
    data() {
        return {
            el: null as any,
            nodeId: 0,
            dataNode: {} as any,
            df: null as any,
            variable1: '',
            symbole:'',
            variable2:0,
            message:"",
            headerTester:[] as any,
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
            this.message = this.dataNode.data.message;

        }


    },
    computed: {
    ...mapState(['headers']),
    },
}
</script>