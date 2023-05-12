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
 import { defineComponent, onMounted, getCurrentInstance, ref,nextTick } from 'vue'
 import * as XLSX from 'xlsx';
 import * as fs from 'fs';
 import * as path from 'path';
 export default defineComponent({
   setup() {
     const el = ref(null) as any;
     const nodeId = ref(0);
     let df = null as any;
     const csv = ref('');
     const dataNode = ref({}) as any;
     const internalInstance: any = getCurrentInstance();
     df = internalInstance.appContext.config.globalProperties.$df.value;
    function loadExcelFile(event){
       csv.value = event.target.files[0].name;
       nodeId.value = el.value?.parentElement.parentElement.id.slice(5)
       dataNode.value = df.getNodeFromId(nodeId.value)
       df.updateNodeDataFromId(nodeId.value, { mytemplate: "", csv: csv.value })
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
         const outputFile = path.join('C:\\uploads\\', `${csv.value}`);
         fs.writeFileSync(outputFile, jsonData);
       };
       reader.readAsBinaryString(file);
     }
     onMounted(async () => {
      await nextTick()
       nodeId.value = el.value?.parentElement.parentElement.id.slice(5)
       console.log(nodeId.value+"nodeId")
        dataNode.value = df.getNodeFromId(nodeId.value)
        csv.value = dataNode.value.data.csv;
     }
     );
 
     return {
       el, csv,loadExcelFile
     }
 
   }
 
 })
 </script>
 <style>
 .nodeselect .vs__clear {
   margin-bottom: 10px;
 }
 
 .nodeselect .vs__open-indicator {
   display: none;
 }
 </style>
 
 