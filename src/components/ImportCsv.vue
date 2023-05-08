<template>
  <div class="input_field flex flex-col w-max mx-auto text-center">
    <label id="node-title">
      <input class="text-sm cursor-pointer w-36 hidden" type="file" @change="loadExcelFile" df-mytemplate/>
      <div class="text-white bg-blue font-bold rounded-lg text-sm px-2 py-2 text-center">
        {{ fileName || 'Import Excel' }}
      </div>
    </label>
  </div>
</template>

<script lang="ts">
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';
import ExcelJS from 'exceljs';

export default {
  name: 'ImportCsv',
  data() {
    return {
      fileName: '',
      columns: [] as string[],
      selectedColumn: '',
      dataRows: [] as any[],
    };
  },
  methods: {
    loadExcelFile(event) {
      this.fileName = event.target.files[0].name;
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const columns: string[] = [];
        const dataRows: any[] = [];
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
        this.columns = columns;
        this.dataRows = dataRows;

        // Convert data to JSON format
        const jsonData = JSON.stringify(dataRows, null, 2);

        // Save JSON data to file
        const outputFile = path.join('C:\\uploads\\', `${this.fileName}`);
        fs.writeFileSync(outputFile, jsonData);
      };
      reader.readAsBinaryString(file);
    },
  },
};
</script>
