<template>
  <div className="h-full w-full flex flex-col p-4">

    <div className="flex justify-between mb-3 text-gray-100">

      <v-select v-model="selectedOption" :options="files" label="name" class="h-9 text-primary-dark rounded w-60 mr-3"
        @click="() => loadNameFiles()" @option:selected="onchangeSelect()">
      </v-select>
      <div class="flex justify-end text-gray-100">
        <input id="file_n"
          className="input focus:ring-2 focus:outline-none focus:ring-cyan-300  font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2 heught"
          placeholder="Add File Name" v-model="fileName" />
        <!-- <button id="filebtn" class=" mr-2 mb-3"> <img class="rounded-md " style="width: 60px; height: 38px;"
            title="Press to edit a file name" @click="EditName" src="../assets/editfile.png" alt=""> </button> -->
        <button class="btn w-36 rounded-lg 
                px-5 py-2.5 text-center mr-2 mb-3" @click="saveToDatabase">Save File</button>
        <button class="btn w-28" @click="newFile">New file</button>
      </div>
      <button id="deletebtn" class="ml-2 mb-4" @click="deleteFile"> <img class="rounded-md "
          style="width: 50px; height: 38px;" title="Delete" @click="EditName" src="../assets/delete.png" alt=""> </button>
    </div>
    <div class="flex flex-row w-full h-full">
      <div className="flex flex-col gap-2 w-[200px] mx-auto mr-3 h-full">
        <label>
          <input id="input-file" class="text-sm cursor-pointer w-36 hidden" type="file" @input="ImportDoc"
            accept=".doc, .docx">
          <div class="btn w-full rounded-lg px-5 py-2.5 text-center mr-2 mb-2 cursor-pointer">
            Open docx file</div>
        </label>
        <button class="btn mr-3 w-full " @click="downloadPdf">Generate pdf</button>
        <h2 className="border-b-4 p-2 border-primary-dark text-center font-bold text-black-700  ">Node Excel</h2>

        <div class="file_upload p-1 relative border-4 border-dotted border-primary-dark rounded-lg"
          style="width: 190px; height: 130px;">
          <svg class="text-primary-dark w-24 mx-auto mb-2" style="width: 100px; height: 70px;"
            xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <div class="input_field flex flex-col w-max mx-auto text-center">
            <label>
              <input class="text-sm cursor-pointer w-36 hidden" type="file" @change="loadExcelFile" />
              <div class="btn text-sm rounded-lg text-center m-auto" style="height: unset;">
                Select Excel file</div>
            </label>
          </div>
        </div>
        <div class="mt-2 flex flex-col h-full" v-if="columns.length > 0">
          <h3 class="text-center ml-1 text-black-500 font-bold mb-3">Headers :</h3>
          <div id="sidebar" class="flex flex-col overflow-auto h-[300px]">
            <div class="" v-for="column in columns">
              <div class="customEmbed" dragabble="true" @drop="onDrop">{{ column }}</div>
            </div>
          </div>
        </div>
      </div> 
      <div class="flex flex-col w-full h-full">
        <div id="editor" ref="editor">
        </div>
      </div>
    </div>


  </div>
</template>

<script lang="ts">
import * as XLSX from 'xlsx'
import Quill from 'quill'
import 'quill/dist/quill.snow.css'
import quillCss from 'quill/dist/quill.snow.css'
import ResizeModule from "@ssumo/quill-resize-module"
import beautify from 'js-beautify'
import mammoth from 'mammoth-style/mammoth.browser.js'
import Swal from 'sweetalert2'
import { Fragment } from 'vue';

import { ipcRenderer } from 'electron';
const Embed = Quill.import('blots/embed')
Quill.register(class extends Embed {
  static create(key) {
    let node = super.create()
    node.setAttribute('data-key', key)
    node.innerHTML = `${key}`
    return node
  }

  static value(node) {
    return node.dataset.key
  }

  static blotName = 'customEmbed'
  static className = 'customEmbed'
  static tagName = 'span'

})
Quill.register("modules/resize", ResizeModule);

export default {
  inject: ['ipcRenderer'],
  name: 'Editor',
  data() {
    return {
      editor: null as Quill,
      selectedOption: "",
      files: [],
      fileName: "",
      columns: [] as string[],
      selectedColumn: '',
      selectedColumnValues: [] as any[],
      dataRows: [] as any[],
      workbook: null,
      worksheet: null,
      test: false
    }
  },
  mounted() {

    const dbtn = document.querySelector('button#deletebtn');
    (dbtn as HTMLSelectElement).style.display = 'none';
    const btn = document.querySelector('button#filebtn');
    //(btn as HTMLSelectElement).style.display = 'none';
    const input = document.querySelector('input#file_n');
    (input as HTMLSelectElement).style.display = 'block';

    var toolbarOptions = [
      ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
      ['image', 'blockquote', 'code-block'],

      [{ 'header': 1 }, { 'header': 2 }],               // custom button values
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'script': 'sub' }, { 'script': 'super' }],      // superscript/subscript
      [{ 'indent': '-1' }, { 'indent': '+1' }],          // outdent/indent
      [{ 'direction': 'rtl' }],
      [{ 'size': ['small', false, 'large', 'huge'] }],                        // text direction
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],

      [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
      [{ 'font': [] }],
      [{ 'align': [] }],
      ['clean'],  // remove formatting button
    ];
    this.editor = new Quill(this.$refs.editor, {
      theme: 'snow',
      modules: {
        toolbar: toolbarOptions,
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
    this.editor.root.innerHTML = ""
    document.getElementById('sidebar')?.querySelectorAll('.customEmbed')
      .forEach((e: any) => {
        e.setAttribute('draggable', 'true')
        e.ondragstart = (ev: any) => {
          ev.dropEffect = 'copy'
          ev.effectAllowed = 'copy'
          ev.dataTransfer.setData('text/html', `${ev.target.innerHTML.slice(1)}`)
        }
        e.ondragend = ev => {
          var data = ev.dataTransfer.getData("text/html");
          var index = this.editor.getSelection(true).index;
          this.editor.insertEmbed(index, 'customEmbed', data)

        }
      })
  },
  methods: {
    deleteFile() {

      Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'No, cancel!',
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        reverseButtons: true
      }).then((result) => {
        if (result.isConfirmed) {
          Swal.fire(
            'Deleted!',
            'Your file has been deleted.',
            'success'
          )
          this.fileName = ""
          ipcRenderer.invoke('deleteQuillFile', { name: this.selectedOption });
          this.newFile();
        } else if (
          result.dismiss === Swal.DismissReason.cancel
        ) {
          Swal.fire(
            'Cancelled',
            'Your imaginary file is safe :)',
            'error'
          )
        }
      })

    },
    newFile() {
      this.editor.root.innerHTML = ""
      this.selectedOption = ""
      const dbtn = document.querySelector('button#deletebtn');
      (dbtn as HTMLSelectElement).style.display = 'none';
      const btn = document.querySelector('button#filebtn');
      (btn as HTMLSelectElement).style.display = 'none';
      const input = document.querySelector('input#file_n');
      (input as HTMLSelectElement).value = "";
      (input as HTMLSelectElement).style.display = 'block';
    },
    EditName() {
      const input = document.querySelector('input#file_n');
      (input as HTMLSelectElement).style.display = 'block';
      this.test = true;
    },
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
    async ImportDoc(event: Event) {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) {
        return;
      }
      const arrayBuffer = await file.arrayBuffer()
      const rawHtml = await mammoth.convertToHtml({ arrayBuffer })
      const httml = rawHtml.value
      const updatedHtml = httml.replace(/<font color="([^"]+)">/g, '<span style="color: $1;">');
      const htmlResult = updatedHtml.replace(/<\/font>/g, '</span>');
      const html = beautify.html(
        htmlResult.replace(/\u00A0/g, ' '));
      this.editor.root.innerHTML = this.editor.root.innerHTML + html;
    },
    async downloadPdf() {
      var longueurMax = 5400;
      var contenu = this.editor.root.innerHTML;
      var parties: string[] = [];
      while (contenu.length > 0) {
        var partie = contenu.substring(0, longueurMax);
        if (!partie.includes('<img')) {
          longueurMax = 6300
          partie = contenu.substring(0, longueurMax);
        }
        contenu = contenu.substring(longueurMax);
        if (partie.endsWith('>') && contenu.length > 5299) {
          partie = '<div>' + partie + '</div>';
        } else {
          var indexBaliseFermante = partie.lastIndexOf('>');
          console.log("indexBaliseFermante " + indexBaliseFermante)
          if (indexBaliseFermante !== -1) {
            if (!partie.includes('<img')) {
              if (partie.includes('<')) {
                var contenuAvant = partie.substring(0, indexBaliseFermante + 1);
                var contenuApres = partie.substring(indexBaliseFermante + 1);
                if ((contenuApres.substring(partie.lastIndexOf('<') + 1) + contenuAvant) > 5399)
                  contenuApres = contenuApres.substring(0, partie.lastIndexOf('<') + 1) + '<div>' + contenuApres.substring(partie.lastIndexOf('<') + 1)
                partie = contenuAvant + '</div>' + contenuApres;
              }
            }
          }
        }

        parties.push(partie);
      }
      var htmleditor = parties.join('');
      console.log(htmleditor)
      var name = this.selectedOption
      var html = '<html><head><style> div { page-break-before: auto; max-height:3000px;}' + quillCss + '</style></head><body><div class="ql-editor">' + htmleditor + '</div></body></html>'
      var pdf = require('hm-html-pdf');
      var options = { format: 'A4' };
      pdf.create(html, options).toFile('src/assets/pdfs/' + name + '.pdf', function (err, res) {
        if (err) return console.log(err);
        console.log(res);
      });
    }
    ,
    async saveToDatabase() {
      const btn = document.querySelector('button#filebtn');
      const input = document.querySelector('input#file_n');
      const dbtn = document.querySelector
        ('button#deletebtn');
      if ((input as HTMLSelectElement).value && this.test === false) {
        if (this.fileName.length === 0) {
          Swal.fire('Empty Name', 'The field cannot be left empty, please input a name.', 'error')
        }
        else {
          var exist = await ipcRenderer.invoke('checkFileNameExists', { name: this.fileName })
          if (exist) {
            Swal.fire('Duplicate Name', 'The name already exists in the database, please choose a different name.', 'error');
          }
          else {

            ipcRenderer.invoke('insertQuillcontent', { name: this.fileName, data: this.editor.root.innerHTML })
              .catch((error) => {
                console.error(`Error insert: ${error}`);
              });
            this.toastmessage()
            this.selectedOption = this.fileName;
            (dbtn as HTMLSelectElement).style.display = 'block';
            (btn as HTMLSelectElement).style.display = 'block';
            (input as HTMLSelectElement).style.display = 'none';
          }
        }
      }
      else if ((input as HTMLSelectElement).value && this.test === true) {
        if (this.fileName.length === 0) {
          Swal.fire('Empty Name', 'The field cannot be left empty, please input a name.', 'error')
        }
        else {
          var exist = await ipcRenderer.invoke('checkFileNameExists', { name: this.fileName })
          if (exist) {
            Swal.fire('Duplicate Name', 'The name already exists in the database, please choose a different name.', 'error');
          }
          else {

            (input as HTMLSelectElement).value = ""
            ipcRenderer.invoke('updateQuillFileName', { oldName: this.selectedOption, newName: this.fileName });
            this.selectedOption = this.fileName;
            this.test = false;
            (input as HTMLSelectElement).style.display = 'none';
            this.toastmessage()
          }
        }
      }
      else {
        if (this.fileName.length === 0 || this.selectedOption.length === 0) {
          Swal.fire('Empty Name', 'The field cannot be left empty, please input a name.', 'error')
        }
        else {

          ipcRenderer.invoke('updateContentFile', { name: this.selectedOption, data: this.editor.root.innerHTML });
          this.toastmessage()
        }
      }

    },
    toastmessage() {
      Swal.fire({
        toast: true,
        icon: 'success',
        title: 'The operation has been completed!',
        position: 'bottom-left',
        timer: 2000,
        showConfirmButton: false,
        timerProgressBar: true,
      })
    },
    onDrop(event) {
      this.editor.setSelection(0);

    }
    ,
    async loadNameFiles() {
      const response = await ipcRenderer.invoke('getQuillContentName');
      this.files = response;

    },
    async onchangeSelect() {
      const input = document.querySelector('input#file_n');
      (input as HTMLSelectElement).style.display = 'none';
      const btn = document.querySelector('button#filebtn');
      (btn as HTMLSelectElement).style.display = 'block';
      const dbtn = document.querySelector('button#deletebtn');
      (dbtn as HTMLSelectElement).style.display = 'block';
      const selectedFile = this.selectedOption;
      const response = await ipcRenderer.invoke('getQuillContentData', { name: selectedFile });
      this.fileName = "";
      this.editor.root.innerHTML = response;
    }

  },
}
</script>
<style scoped>
.node {
  @apply text-white bg-primary-light hover:bg-primary-dark font-bold rounded-lg text-sm px-1 py-3 text-center mr-4 ml-4 mb-2;
}

.customEmbed {
  @apply p-2 mb-2 block text-white bg-primary-light hover:bg-primary-dark rounded-lg w-full text-center;
}
</style>


