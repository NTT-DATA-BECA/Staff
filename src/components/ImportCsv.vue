<template>
  <div ref="el" class="input_field flex flex-col w-max mx-auto text-center">
       <label >
         <input class="text-sm cursor-pointer w-36 hidden" type="file" @change="loadExcelFile" />
         <div class="text-white bg-blue font-bold rounded-lg text-sm px-2 py-2 text-center">
           {{ csv || 'Import Excel' }}
         </div>
       </label>
       <input type="hidden" v-model="csv" df-csv>
  </div>
  </template>
  <script lang="ts">
  import {  getCurrentInstance,nextTick } from 'vue'
  import * as XLSX from 'xlsx';
  import * as fs from 'fs';
  import * as path from 'path';
  export default {
    name: 'ImportExcel',
    data() {
      return {
        el:null as any,
        nodeId:0,
        df:null as any,
        csv:'',
        dataNode : {} as any, 
      };
    },
    async mounted() { 
      this.el=this.$refs.el;
      const internalInstance: any = getCurrentInstance();
      this.df = internalInstance.appContext.config.globalProperties.$df.value;
      await nextTick()
      this.nodeId = this.el?.parentElement.parentElement.id.slice(5)
      console.log(this.nodeId+"nodeId")
      this.dataNode = this.df.getNodeFromId(this.nodeId)
      this.csv = this.dataNode.data.csv;
    },
    methods: {
     loadExcelFile(event){
         this.el=this.$refs.el;
         this.csv = event.target.files[0].name;
         this.nodeId = this.el?.parentElement.parentElement.id.slice(5)
         this.dataNode = this.df.getNodeFromId(this.nodeId)
         this.df.updateNodeDataFromId(this.nodeId, { mytemplate: "", csv: this.csv })
         const file = event.target.files[0];
         const reader = new FileReader();
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
           // Convert data to JSON format
           const jsonData = JSON.stringify(dataRows, null, 2);
           // Save JSON data to file
           const outputFile = path.join('C:\\uploads\\', `${this.csv}`);
           fs.writeFileSync(outputFile, jsonData);
         };
         reader.readAsBinaryString(file);
       }
    },
  };
  </script>