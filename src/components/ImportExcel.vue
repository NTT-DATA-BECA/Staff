<template>
  <div ref="el" class="input_field flex flex-col w-max mx-auto text-center">
    <p id="node-title">Data :</p>
    <label>
      <input class="cursor-pointer w-36 hidden" type="file" @change="loadExcelFile" />
      <div class="text-white bg-blue font-bold rounded-lg text-sm text-center">
        {{ excelName || 'Import Excel' }}
      </div>
    </label>
    <input type="hidden" v-model="excelName" df-excelName>
    <input df-excelData type="hidden" v-model="excelData">
  </div>
</template>
<script lang="ts">
import { getCurrentInstance, nextTick } from 'vue'
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';
import { mapState, mapActions } from 'vuex';

export default {
  name: 'ImportExcel',
  data() {
    return {
      el: null as any,
      nodeId: 0,
      outputnodeId: 0,
      df: null as any,
      excelName: '',
      excelData:[] as any,
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
    this.excelName = this.dataNode.data.excelName;
    this.headersName = this.dataNode.data.headers;
    this.excelData = this.dataNode.data.excelData;

  },
  computed: {
    ...mapState(['headers', 'excelData']),
  },
  methods: {
    ...mapActions(['setHeaders', 'setExcelData']),
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
         const outputFile = path.join(dir, `${this.excelName}`);
        this.el = this.$refs.el;
        this.excelName = outputFile;
        this.excelName = event.target.files[0].name;
        this.excelData=dataRows;
        this.nodeId = this.el?.parentElement?.parentElement?.id?.slice(5);
        this.dataNode = this.df.getNodeFromId(this.nodeId)
        this.headersName = headNames;
        // Update Vuex state with new headers and excelData
        this.setHeaders(headNames);
        this.setExcelData(dataRows);
        this.df.updateNodeDataFromId(this.nodeId, {excelName: this.excelName, headers: this.headersName, excelData: this.excelData})
      };
      reader.readAsBinaryString(file);
       
    }

  },
};
</script>