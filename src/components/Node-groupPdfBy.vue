<template>
  <div ref="el">
    <h2 id="node-title">{{ t("nodes.path") }}</h2>
    <input v-model="pdfpath" class="text-black mb-1 ml-2 w-36 align-middle" type="text" df-pdfpath/>
    <select v-model="group" df-group class="w-36 text-primary-dark ml-2 h-6">
            <option disabled>{{ t("nodes.group") }}</option>
            <option v-for="header in headers" :key="header" :value="header">{{ header }}</option>
    </select>
  </div>
</template>

<script lang="ts">
import { getCurrentInstance, nextTick } from 'vue'
import { mapState } from 'vuex';
import { useI18n } from 'vue-i18n'
export default {
    name: 'groupPdfBy',
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
            group: '',
            pdfpath:"",
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
            this.group = this.dataNode.data.group;   
            this.pdfpath = this.dataNode.data.pdfpath         
        }
    },
    computed: {
    ...mapState(['headers']),
    },
}
</script>