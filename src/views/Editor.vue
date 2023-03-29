<template>
  <div class="m-5">
    
    <v-select
        v-model="selectedOption"
        :options="files" 
        label="name"
        class="left-3/4 ml-3 mb-5 h-9 hover:bg-blue-200 rounded w-60 text-blue-600 hover:text-blue-400"
        @click="() => loadNameFiles()"  
        @option:selected="onchangeSelect()"        
      ></v-select>  
    <div ref="editor"></div>
    <input type="file" class="mt-5 mr-5 w-30 p-2 " @input="ImportDocument">
    <input className="input mr-5" placeholder="Add File name"
                 v-model="fileName"  /> 
    <button class="mt-5 mr-5 w-30 p-2 border-2 border-cyan-600 hover:bg-orange-500 hover:text-white" @click="saveToDatabase">Save</button>
    <button class="mt-5 w-30 p-2 border-2 border-cyan-600 hover:bg-orange-500 hover:text-white" @click="downloadPdf">Generate PDF</button>
  </div>
</template>

<script lang="ts">
import Quill from 'quill' 
import 'quill/dist/quill.snow.css' 
import ResizeModule from "@ssumo/quill-resize-module";
import html2pdf from 'html2pdf.js';
import * as pdfjsLib from "pdfjs-dist/build/pdf"
import { pdfExporter } from "quill-to-pdf";
import { saveAs } from "file-saver";
import { ipcRenderer } from 'electron';

Quill.register("modules/resize", ResizeModule);
pdfjsLib.GlobalWorkerOptions.workerSrc = '../../node_modules/pdfjs-dist/build/pdf.worker.js'
export default {
  inject: ['ipcRenderer'],
  name: 'Editor', 
  data() {
    return {
      editor:null as Quill, 
      selectedOption:"",
      files:[],
      fileName:""
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
      [{ 'direction': 'rtl' }],                         // text direction

      [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],

      [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
      [{ 'font': [] }],
      [{ 'align': [] }],

      ['clean']                                         // remove formatting button
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
   async ImportDocument(event: Event){
   
       const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) {
        return;
      }   
      // const buffer = await file.arrayBuffer();
      // const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
      // const page = await pdf.getPage(1);
      // const content = await page.getTextContent();
      // const text = content.items.map(item => item.str).join(' ');
     // this.editor.root.innerHTML=html;
    },
   async downloadPdf(){
      //html2pdf().from( this.editor.root.innerHTML).save('editor-content.pdf');
      const pdfAsBlob = await pdfExporter.generatePdf(this.editor.getContents()); // converts to PDF
       saveAs(pdfAsBlob, "pdf-export.pdf");
       console.log("je suis là")
    },
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

<style>

</style>
