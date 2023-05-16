<template>
  <div ref="el" class="input_field flex flex-col w-max mx-auto text-center">
    <label>
      <input class="text-sm cursor-pointer w-36 hidden" type="file" @change="loadExcelFile" />
      <div class="text-white bg-blue font-bold rounded-lg text-sm px-2 py-2 text-center">
        {{ csv || 'Import Excel' }}
      </div>
    </label>
    <input type="hidden" v-model="csv" df-csv>
    <input df-variable1 type="hidden" v-model="variable1">
  </div>
</template>
<script lang="ts">
import { getCurrentInstance, nextTick } from 'vue'
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';
export default {
  name: 'ImportExcel',
  data() {
    return {
      el: null as any,
      nodeId: 0,
      outputnodeId: 0,
      df: null as any,
      csv: '',
      variable1:[] as any,
      headersName: [] as any,
      dataNode: {} as any,
      dataNodeOutput: {} as any,
    };
  },
  async mounted() {
    this.el = this.$refs.el;
    const internalInstance: any = getCurrentInstance();
    this.df = internalInstance.appContext.config.globalProperties.$df.value;
    await nextTick()
    this.nodeId = this.el?.parentElement?.parentElement?.id?.slice(5);
    this.dataNode = this.df.getNodeFromId(this.nodeId)
    this.csv = this.dataNode.data.csv;
    this.headersName = this.dataNode.data.headers;
    this.variable1 = this.dataNode.data.variable1;
    console.log(this.variable1+" variable1");

  },
  methods: {
   async loadExcelFile(event) {
      const file = event.target.files[0];
      const reader = new FileReader();
      const headNames = [] as string[];
      reader.onload = (e) => {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        var columns: string[] = [];
        var dataRows: any[] = [];

        const rangen = sheet['!ref'];
        if (rangen) {
          const range = XLSX.utils.decode_range(rangen);
          for (let C = range.s.c; C <= range.e.c; ++C) {
            const cell = sheet[XLSX.utils.encode_cell({ r: range.s.r, c: C })];
            const columnName: string = XLSX.utils.format_cell(cell);
            columns.push(columnName);
          }
          for (let C = range.s.c; C <= range.e.c; ++C) {
            const cell = sheet[XLSX.utils.encode_cell({ r: range.s.r, c: C })];
            const columnName: string = XLSX.utils.format_cell(cell);
            headNames.push(columnName);
          }
          for (let R = range.s.r + 1; R <= range.e.r; ++R) {
            const row: any = {};
            for (let C = range.s.c; C <= range.e.c; ++C) {
              const cell = sheet[XLSX.utils.encode_cell({ r: R, c: C })];
              const columnName: string = columns[C];
              const cellValue: string = XLSX.utils.format_cell(cell);
              row[columnName] = cellValue;
            }
            dataRows.push(row);
          }
        }
        const dir = 'C:/uploads';
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir);
        }
         const outputFile = path.join(dir, `${this.csv}`);
        this.el = this.$refs.el;
        this.csv = outputFile;
        this.csv = event.target.files[0].name;
        this.variable1=dataRows;
        this.nodeId = this.el?.parentElement?.parentElement?.id?.slice(5);
        this.dataNode = this.df.getNodeFromId(this.nodeId)
        this.headersName = headNames;
        this.df.updateNodeDataFromId(this.nodeId, { mytemplate: "", csv: this.csv, headers: this.headersName,variable1:this.variable1,variable2:"" })
        if (this.dataNode.outputs.output_1.connections[0]?.node) {
          this.outputnodeId = parseFloat(this.dataNode.outputs.output_1.connections[0].node)
          this.dataNodeOutput = this.df.getNodeFromId(this.outputnodeId)
          this.df.updateNodeDataFromId(this.outputnodeId, { mytemplate: this.dataNodeOutput.data.mytemplate, csv: "", headers: this.headersName,variable1:"",variable2:"" })
          this.df.removeConnectionNodeId('node-'+this.outputnodeId);
          if(this.dataNodeOutput.outputs.output_1.connections[0]?.node){
            const outputnodeId = parseFloat(this.dataNode.outputs.output_1.connections[0].node)
            this.df.removeConnectionNodeId('node-'+outputnodeId);
          }
          if(this.dataNodeOutput.outputs.output_1.connections[1]?.node){
            const outputnodeId = parseFloat(this.dataNode.outputs.output_1.connections[1].node)
            this.df.removeConnectionNodeId('node-'+outputnodeId);
          }
         
        }
      };
      reader.readAsBinaryString(file);
       
    }

  },
};
</script>