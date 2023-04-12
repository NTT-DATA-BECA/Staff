<template>
  <div className="h-full w-full flex flex-col p-4">

      <div className="flex justify-end mb-3 text-gray-100"> 

        <v-select
              v-model="selectedOption"
              :options="files" 
              label="name"
              class=" mb-5 hover:bg-blue-200 rounded w-60 text-blue-600 hover:text-blue-400"
              style="border: 2px solid blue; border-radius: 5px;"
              @click="() => loadNameFiles()"  
              @option:selected="onchangeSelect()"        
              ></v-select> 
      </div>
          
      <div class="flex flex-row w-full h-full">
          <div className="flex flex-col gap-2 w-[200px] mx-auto mr-3">
              <h2 className="border-b-4 p-2 border-green-300 text-center font-bold text-emerald-700  ">Node Excel</h2>
              <div>
                  
                  <div class="file_upload p-1 relative border-4 border-dotted border-green-500 rounded-lg" style="width: 190px; height: 130px;">
                      <svg class="text-green-500 w-24 mx-auto mb-2" style="width: 100px; height: 70px;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                      <div class="input_field flex flex-col w-max mx-auto text-center">
                          <label>
                            <input class="text-sm cursor-pointer w-36 hidden" type="file" @change="loadExcelFile" />
                            <div class="text-gray-900 bg-gradient-to-r from-teal-200 to-lime-200 hover:bg-gradient-to-l hover:from-teal-200 hover:to-lime-200 focus:ring-4 focus:outline-none focus:ring-lime-200 dark:focus:ring-teal-700 font-medium rounded-lg text-sm px-5 py-2 text-center mr-2 mb-2">Select Excel file</div>
                          </label>

                      </div>
                  </div>
                  <div v-if="columns.length > 0">
                      <h3 class=" text-center font-boldml-6 text-black-500 font-bold">Headers:</h3>
                  

                      <ul class="ml-5">
                        <li draggable="true"  v-for="(column, index) in columns" :key="index" @click="selectColumn(column)"  
>
                        <div class="node"><span>{{ column }}</span></div>
                        </li>
                      </ul>
                  </div>
                  <table ref="table"></table>
              </div>
                  
              <table>
                    <thead>
                      <tr>
                        <th>{{ selectedColumn }}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(value, index) in selectedColumnValues" :key="index">
                        <td>{{ value }}</td>
                      </tr>
                    </tbody>
              </table>
          </div>
          <div class="w-full h-full">
          <div class="" id="editor" ref="editor">
           </div></div>
          
      </div>
     
      <div class="flex justify-end mt-16 text-gray-100">
            

            <input className="input focus:ring-2 focus:outline-none focus:ring-cyan-300  font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2 heught"  placeholder="Add File Name"
                        v-model="fileName"  /> 
            <button class="w-36 text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-bold rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2" @click="saveToDatabase">Save File</button>  
             
            <label> 
            <input class="text-sm cursor-pointer w-36 hidden" type="file"  @input="ImportDoc" accept=".doc, .docx">
            <div class="w-30 text-white bg-gradient-to-br from-green-400 to-blue-600 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800 font-bold rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2 cursor-pointer">Open docx file</div>
            </label>
            
            <button class="w-36 text-white bg-gradient-to-r from-red-400 via-red-500 to-red-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-bold rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2" @click="downloadPdf">GENERATE PDF</button>
  
      </div>
  </div>

</template>

<script lang="ts">
import * as XLSX from 'xlsx';
import Quill from 'quill' 
import 'quill/dist/quill.snow.css'
import quillCss from 'quill/dist/quill.snow.css'
import ResizeModule from "@ssumo/quill-resize-module";
import beautify from 'js-beautify'
import mammoth from 'mammoth/mammoth.browser.js'
import { ipcRenderer } from 'electron';
Quill.register("modules/resize", ResizeModule);

export default {
  inject: ['ipcRenderer'],
  name: 'Editor', 
  data() {
    return {
      editor:null as Quill, 
      selectedOption:"",
      files:[],
      fileName:"",
      columns: [] as string[],
      selectedColumn: '',
      selectedColumnValues: [] as any[],
      dataRows: [] as any[],
      workbook: null,
      worksheet: null,
    }
  },
  mounted() {
        var toolbarOptions = [
      ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
      ['image','blockquote', 'code-block'],

      [{ 'header': 1 }, { 'header': 2 }],               // custom button values
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
      [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
      [{ 'direction': 'rtl' }], 
      [{ 'size': ['small', false, 'large', 'huge'] }],                        // text direction
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],

      [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
      [{ 'font': [] }],
      [{ 'align': [] }],
      ['clean']  ,  // remove formatting button
    ];
    this.editor = new Quill(this.$refs.editor, {
      theme: 'snow', 
      modules: {
        toolbar:toolbarOptions,
        resize: {
      locale: {
        altTip: "altTip",
        floatLeft: "floatLeft",
        floatRight: "floatRight",
        center: "center",
        restore: "restore"
      }
    }
      },
    
    })
  },
  methods: {
    loadExcelFile(event) {
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
      };
      reader.readAsBinaryString(file);
    },
    selectColumn(column: string) {
      this.selectedColumn = column;
      this.selectedColumnValues = this.filterColumnValues(column);
    },
    filterColumnValues(column: string): any[] {
      const columnValues: any[] = [];
      for (let row of this.dataRows) {
        if (row[column]) {
          columnValues.push(row[column]);
        }
      }
      return columnValues;
    },
   async ImportDoc(event: Event){
       const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) {
        return;
      }  
      const arrayBuffer = await file.arrayBuffer()
      const rawHtml = await mammoth.convertToHtml({ arrayBuffer })
      const httml=rawHtml.value
      const html =beautify.html(
        httml.replace(/\u00A0/g, ' '));
      this.editor.root.innerHTML=html;
    },
    async downloadPdf(){
       
          var htmleditor = this.editor.root.innerHTML;
          htmleditor = htmleditor.replace(/>\s+|\s+</g, function(match) {
            return match.includes('>') ? '>' + '&nbsp;'.repeat(match.length-2) + ' ' : ' ' + '&nbsp;'.repeat(match.length-2) + '<'; 
          }); 
        var pdf = require('html-pdf');
        var options = { 
    format: 'A4',
    
};
     var name = this.selectedOption 
        var html='<html><head><style>'+quillCss+'</style></head><body><div class="ql-editor">'+htmleditor+'</div></body></html>'
        pdf.create(html, options).toFile('src/assets/pdfs/'+name+'.pdf', function(err, res) {
            if (err) return console.log(err);
            console.log(res); 
          });

    }
   ,
    saveToDatabase(){
      ipcRenderer.invoke('insertQuillcontent', { name: this.fileName, data: this.editor.root.innerHTML })
        .catch((error) => {
          console.error(`Error insert: ${error}`);
        });
        this.selectedOption=this.fileName;
    },
    async loadNameFiles(){
      const response = await ipcRenderer.invoke('getQuillContentName');
      this.files=response;   

    },
   async onchangeSelect(){
      const selectedFile = this.selectedOption;
      const response = await ipcRenderer.invoke('getQuillContentData', { name: selectedFile });
      this.fileName="";
      this.editor.root.innerHTML =response;
    }

  },
}
</script>
<style scoped>

.node {
    @apply text-white bg-gradient-to-br from-green-400 to-blue-600 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800 font-bold rounded-lg text-sm px-5 py-3 text-center mr-2 mb-2 ; 
}
</style>


