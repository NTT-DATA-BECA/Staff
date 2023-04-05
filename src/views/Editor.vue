<template>
  <div class="m-5">
    <div class="row">
    <v-select
        v-model="selectedOption"
        :options="files" 
        label="name"
        class="left-1 mb-5 h-9 hover:bg-blue-200 rounded w-60 text-blue-600 hover:text-blue-400"
        @click="() => loadNameFiles()"  
        @option:selected="onchangeSelect()"        
      ></v-select>  
    <div ref="editor"></div>
    
    <input type="file" class="mt-5 mr-5 w-30 p-2 " @input="ImportDoc" accept=".doc, .docx">
    <input className="input mr-5" placeholder="Add File name"
                 v-model="fileName"  /> 
    <button class="mt-5 mr-5 w-30 p-2 border-2 border-cyan-600 hover:bg-orange-500 hover:text-white" @click="saveToDatabase">Save</button>
    <button id="btn" class="mt-5 w-30 p-2 border-2 border-cyan-600 hover:bg-orange-500 hover:text-white" @click="downloadPdf">Generate PDF</button>
    </div>
    <iframe id="main-iframe" style="width: 100%; height: 100%; z-index: 2; border: none; margin-top: 40px;"></iframe>
  </div>
  

</template>

<script lang="ts">
import Quill from 'quill' 
import 'quill/dist/quill.snow.css' 
import ResizeModule from "@ssumo/quill-resize-module";
//import * as pdfjsLib from "pdfjs-dist/build/pdf"
import beautify from 'js-beautify'
import mammoth from 'mammoth/mammoth.browser.js'
import jsPDF from 'jspdf'
import { ipcRenderer } from 'electron';
//import html2pdf from "html2pdf.js";
Quill.register("modules/resize", ResizeModule);

//pdfjsLib.GlobalWorkerOptions.workerSrc = '../../node_modules/pdfjs-dist/build/pdf.worker.js'
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
      var doc = new jsPDF();
          var name = this.selectedOption
          var htmleditor = this.editor.root.innerHTML;
          htmleditor = htmleditor.replace(/>\s+|\s+</g, function(match) {
            return match.includes('>') ? '>' + '&nbsp;'.repeat(match.length-2) + ' ' : ' ' + '&nbsp;'.repeat(match.length-2) + '<'; 
          }); 
          doc.html(htmleditor, {
            callback: function(doc) {
                  // Save the PDF
                  doc.save(name+'.pdf');
              },
              margin: [3, 3, 3, 3],
              autoPaging: 'text',
              x: 0,
              y: 0,
              width: 190, 
              windowWidth: 1200 ,
      });  
   // document.getElementById('main-iframe')?.setAttribute('src', doc.output('datauristring'));
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

