<template>
  <div className="h-full w-full flex flex-col p-4">
    <div className="flex justify-between mb-3 text-gray-100">
      <v-select v-model="selectedOption" :options="files" label="name" class="h-9 text-primary-dark rounded w-60 mr-3"
        @click="() => loadNameFiles()" @option:selected="onChangeFile()">
      </v-select>
      <div class="flex justify-end text-gray-100">
        <input className="input mr-2"
          v-bind:placeholder="(action == 'edit' || isEditName) ? 'Edit filename' : 'Add filename'" v-model="fileName"
          v-if="action == 'add' || isEditName" />
        <button v-if="action == 'edit'" class="btn flex items-center mr-2 mb-3" @click="editName">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="mr-2 bi bi-pen-fill"
            viewBox="0 0 16 16">
            <path
              d="m13.498.795.149-.149a1.207 1.207 0 1 1 1.707 1.708l-.149.148a1.5 1.5 0 0 1-.059 2.059L4.854 14.854a.5.5 0 0 1-.233.131l-4 1a.5.5 0 0 1-.606-.606l1-4a.5.5 0 0 1 .131-.232l9.642-9.642a.5.5 0 0 0-.642.056L6.854 4.854a.5.5 0 1 1-.708-.708L9.44.854A1.5 1.5 0 0 1 11.5.796a1.5 1.5 0 0 1 1.998-.001z" />
          </svg>
          Edit name
        </button>
        <button class="btn rounded-lg px-5 py-2.5 text-center mr-2 mb-3 flex items-center" @click="saveToDatabase">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
            class="mr-2 bi bi-file-earmark-arrow-up-fill" viewBox="0 0 16 16">
            <path
              d="M9.293 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.707A1 1 0 0 0 13.707 4L10 .293A1 1 0 0 0 9.293 0zM9.5 3.5v-2l3 3h-2a1 1 0 0 1-1-1zM6.354 9.854a.5.5 0 0 1-.708-.708l2-2a.5.5 0 0 1 .708 0l2 2a.5.5 0 0 1-.708.708L8.5 8.707V12.5a.5.5 0 0 1-1 0V8.707L6.354 9.854z" />
          </svg>
          Save File
        </button>
        <button class="btn flex items-center" @click="newFile">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="mr-2 bi bi-plus-lg"
            viewBox="0 0 16 16">
            <path fill-rule="evenodd"
              d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2Z" />
          </svg>
          New file
        </button>
        <button v-if="action == 'edit'" class="btn ml-2 flex items-center" @click="deleteFile">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="mr-2 bi bi-trash-fill"
            viewBox="0 0 16 16">
            <path
              d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5zm3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0z" />
          </svg>
          delete
        </button>
      </div>
    </div>
    <div class="flex flex-row w-full h-full">
      <div className="flex flex-col gap-2 w-[200px] mx-auto mr-3 h-full">
        <label>
          <input class="text-sm cursor-pointer w-36 hidden" type="file" @input="importDocument" accept=".doc, .docx">
          <div class="btn w-full mr-2 mb-2 cursor-pointer flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
              class="mr-2 bi bi-cloud-arrow-up-fill" viewBox="0 0 16 16">
              <path
                d="M8 2a5.53 5.53 0 0 0-3.594 1.342c-.766.66-1.321 1.52-1.464 2.383C1.266 6.095 0 7.555 0 9.318 0 11.366 1.708 13 3.781 13h8.906C14.502 13 16 11.57 16 9.773c0-1.636-1.242-2.969-2.834-3.194C12.923 3.999 10.69 2 8 2zm2.354 5.146a.5.5 0 0 1-.708.708L8.5 6.707V10.5a.5.5 0 0 1-1 0V6.707L6.354 7.854a.5.5 0 1 1-.708-.708l2-2a.5.5 0 0 1 .708 0l2 2z" />
            </svg>
            Open docx file
          </div>
        </label>
        <button class="btn mr-3 w-full flex items-center justify-center" @click="downloadPdf">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
            class="mr-2 bi bi-cloud-arrow-down-fill" viewBox="0 0 16 16">
            <path
              d="M8 2a5.53 5.53 0 0 0-3.594 1.342c-.766.66-1.321 1.52-1.464 2.383C1.266 6.095 0 7.555 0 9.318 0 11.366 1.708 13 3.781 13h8.906C14.502 13 16 11.57 16 9.773c0-1.636-1.242-2.969-2.834-3.194C12.923 3.999 10.69 2 8 2zm2.354 6.854-2 2a.5.5 0 0 1-.708 0l-2-2a.5.5 0 1 1 .708-.708L7.5 9.293V5.5a.5.5 0 0 1 1 0v3.793l1.146-1.147a.5.5 0 0 1 .708.708z" />
          </svg>
          Generate pdf
        </button>
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
            <div class="relative header cursor-pointer pointer-events-none text-center font-semibold mb-1"
              dragabble="true" @drop="onDrop" v-for="column in columns">
              {{ '{' + column + '}' }}
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
import quillCSS from 'quill/dist/quill.snow.css'
import ResizeModule from "@ssumo/quill-resize-module"
import beautify from 'js-beautify'
import mammoth from 'mammoth-style/mammoth.browser.js'
import Swal from 'sweetalert2'
import { ipcRenderer } from 'electron';


// Quil configuration
const Embed = Quill.import('blots/embed');
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

});
Quill.register("modules/resize", ResizeModule);

export default {
  inject: ['ipcRenderer'],
  name: 'Editor',
  data() {
    return {
      editor: null as Quill,
      selectedOption: '',
      files: [],
      fileName: '',
      columns: [] as string[],
      selectedColumn: '',
      selectedColumnValues: [] as any[],
      dataRows: [] as any[],
      workbook: null,
      worksheet: null,
      isEditName: false,
      action: 'add'
    }
  },
  mounted() {
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
    this.editor.root.innerHTML = ''
    document.getElementById('sidebar')?.querySelectorAll('.header')
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
          this.editor.insertEmbed(index, 'customEmbed', data);
        }
      });
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
          this.fileName = ''
          ipcRenderer.invoke('deleteQuillFile', { name: this.selectedOption })
            .then(() => {
              Swal.fire(
                'Deleted!',
                'Your file has been deleted.',
                'success'
              );
              this.newFile();
            })
            .catch(() => {
              Swal.fire(
                'Error!',
                'Something wrong.',
                'error'
              );
              this.newFile();
            });
        } 
        else if (result.dismiss === Swal.DismissReason.cancel) {
          Swal.fire(
            'Cancelled',
            'Your imaginary file is safe :)',
            'error'
          );
        }
      })

    },
    newFile() {
      this.action = 'add';
      this.editor.root.innerHTML = '';
      this.selectedOption = '';
      this.fileName = '';
      this.isEditName = false;
    },
    editName() {
      this.isEditName = true;
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
    async importDocument(event: Event) {
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
      var html = '<html><head><style> div { page-break-before: auto; max-height:3000px;}' + quillCSS + '</style></head><body><div class="ql-editor">' + htmleditor + '</div></body></html>'
      var pdf = require('hm-html-pdf');
      var options = { format: 'A4' };
      pdf.create(html, options).toFile('src/assets/pdfs/' + name + '.pdf', function (err, res) {
        if (err) return console.log(err);
        console.log(res);
      });
    },
    async saveToDatabase() {
      if (this.fileName) {
        if (this.isEditName) {
          if (this.fileName.length === 0) {
            Swal.fire('Empty Name', 'The field cannot be left empty, please input a name.', 'error')
          }
          else {
            var exist = await ipcRenderer.invoke('checkFileNameExists', { name: this.fileName })
            if (exist) {
              Swal.fire('Duplicate Name', 'The name already exists in the database, please choose a different name.', 'error');
            }
            else {
              ipcRenderer.invoke('updateQuillFileName', { oldName: this.selectedOption, newName: this.fileName });
              this.selectedOption = this.fileName;
              this.isEditName = false;
              this.showSucess();
            }
          }
        }
        else {
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
              this.showSucess();
              this.selectedOption = this.fileName;
              this.action = 'edit';
            }
          }
        }
      }
      else {
        if (this.fileName.length === 0 || this.selectedOption.length === 0) {
          Swal.fire('Empty Name', 'The field cannot be left empty, please input a name.', 'error')
        }
        else {
          ipcRenderer.invoke('updateContentFile', { name: this.selectedOption, data: this.editor.root.innerHTML });
          this.showSucess();
        }
      }
    },
    showSucess() {
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

    },
    async loadNameFiles() {
      const response = await ipcRenderer.invoke('getQuillContentName');
      this.files = response;

    },
    async onChangeFile() {
      const selectedFile = this.selectedOption;
      const response = await ipcRenderer.invoke('getQuillContentData', { name: selectedFile });
      this.fileName = '';
      this.editor.root.innerHTML = response;
      this.action = 'edit';
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


