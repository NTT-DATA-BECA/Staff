<template>
  <div class="h-full w-full flex flex-col p-4">
    <div class="flex items-center justify-between mb-5">
      <div class="flex items-center">
        <input class=" h-9 p-2 text-slate-700 border border-slate-400 hover:bg-gray-100 rounded"
          placeholder="search value" v-model="searchValue" />
      </div>
      <div class="flex items-center">
        <v-row justify="center mr-2">
          <v-dialog v-model="dialog" scrollable width="auto">
            <template v-slot:activator="{ props }">
              <button class="w-36 text-sm btn" v-bind="props">
                Import Data
              </button>
            </template>
            <v-card>
              <v-card-title>Data</v-card-title>
              <v-divider></v-divider>
              <v-card-text style="min-height: 100px; " class=" min-w-full">
                <label for="file-upload" class="input w-full">
                  {{ selectedFileName || 'Choose File' }}
                </label>
                <input id="file-upload" type="file"
                  accept=".xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  class="hidden" @change="loadExcelFile" />
                <EasyDataTable body-text-direction="center" header-text-direction="center" class="mt-4"
                  :headers="headersExcel" :items="itemsExcel" :search-value="searchValue" :rowsPerPageMessage="message"
                  buttons-pagination :rowsPerPage="5" :loading="loading">
                </EasyDataTable>
              </v-card-text>
              <v-divider></v-divider>
              <v-card-actions class="flex justify-center">
                <v-btn class="bg-primary-dark" variant="text" @click="dialog = false">
                  Close
                </v-btn>
                <v-btn class="bg-primary-dark" variant="text" @click="dialog = false; pushNewData();">
                  Next
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-row>
        <button class="w-36 text-sm btn mr-2" @click="() => downloadExcel()">Download Data</button>
        <button class="w-36 text-sm btn mr-2" @click="() => addManager()">Add Manager</button>
        <button class="w-36 text-sm btn" @click="() => deleteManagers()">Delete Manager</button>
      </div>
    </div>
    <div class="w-full h-full">
      <EasyDataTable table-class-name="customize-table" body-text-direction="center" header-text-direction="center"
        v-model:items-selected="itemsSelected" :headers="headers" :items="items" :rowsPerPage="17"
        :search-field="['first_name', 'last_name', 'email', 'category']" :search-value="searchValue"
        :rowsPerPageMessage="message" :loading="loading" border-cell buttons-pagination alternating>
        <template #header-category="header">
          <div class="flex flex-row customize-header">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="mr-2 bi bi-person"
              viewBox="0 0 16 16">
              <path
                d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4Zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10Z" />
            </svg>
            {{ header.text }}
          </div>
        </template>
        <template #header-first_name="header">
          <div class="flex flex-row customize-header">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
              class="mr-2 bi bi-person-lines-fill" viewBox="0 0 16 16">
              <path
                d="M6 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-5 6s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H1zM11 3.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 1-.5-.5zm.5 2.5a.5.5 0 0 0 0 1h4a.5.5 0 0 0 0-1h-4zm2 3a.5.5 0 0 0 0 1h2a.5.5 0 0 0 0-1h-2zm0 3a.5.5 0 0 0 0 1h2a.5.5 0 0 0 0-1h-2z" />
            </svg>

            {{ header.text }}
          </div>
        </template>
        <template #header-last_name="header">
          <div class="flex flex-row customize-header">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
              class="mr-2 bi bi-person-lines-fill" viewBox="0 0 16 16">
              <path
                d="M6 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-5 6s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H1zM11 3.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 1-.5-.5zm.5 2.5a.5.5 0 0 0 0 1h4a.5.5 0 0 0 0-1h-4zm2 3a.5.5 0 0 0 0 1h2a.5.5 0 0 0 0-1h-2zm0 3a.5.5 0 0 0 0 1h2a.5.5 0 0 0 0-1h-2z" />
            </svg>
            {{ header.text }}
          </div>
        </template>
        <template #header-email="header">
          <div class="flex flex-row customize-header">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
              class="mr-2 bi bi-envelope-at-fill" viewBox="0 0 16 16">
              <path
                d="M2 2A2 2 0 0 0 .05 3.555L8 8.414l7.95-4.859A2 2 0 0 0 14 2H2Zm-2 9.8V4.698l5.803 3.546L0 11.801Zm6.761-2.97-6.57 4.026A2 2 0 0 0 2 14h6.256A4.493 4.493 0 0 1 8 12.5a4.49 4.49 0 0 1 1.606-3.446l-.367-.225L8 9.586l-1.239-.757ZM16 9.671V4.697l-5.803 3.546.338.208A4.482 4.482 0 0 1 12.5 8c1.414 0 2.675.652 3.5 1.671Z" />
              <path
                d="M15.834 12.244c0 1.168-.577 2.025-1.587 2.025-.503 0-1.002-.228-1.12-.648h-.043c-.118.416-.543.643-1.015.643-.77 0-1.259-.542-1.259-1.434v-.529c0-.844.481-1.4 1.26-1.4.585 0 .87.333.953.63h.03v-.568h.905v2.19c0 .272.18.42.411.42.315 0 .639-.415.639-1.39v-.118c0-1.277-.95-2.326-2.484-2.326h-.04c-1.582 0-2.64 1.067-2.64 2.724v.157c0 1.867 1.237 2.654 2.57 2.654h.045c.507 0 .935-.07 1.18-.18v.731c-.219.1-.643.175-1.237.175h-.044C10.438 16 9 14.82 9 12.646v-.214C9 10.36 10.421 9 12.485 9h.035c2.12 0 3.314 1.43 3.314 3.034v.21Zm-4.04.21v.227c0 .586.227.8.581.8.31 0 .564-.17.564-.743v-.367c0-.516-.275-.708-.572-.708-.346 0-.573.245-.573.791Z" />
            </svg>
            {{ header.text }}
          </div>
        </template>
        <template #loading>
          <img src="../assets/ezgif.com-gif-maker.gif" style="width: 500px; height: 350px" />
        </template>
        <template #item-edit="item">
          <div class="cursor-pointer">
            <button @click="editManager(item)">
              <svg xmlns="http://www.w3.org/2000/svg" style="fill: #6785c1;" width="16" height="16" fill="currentColor"
                class="bi bi-pencil-square" viewBox="0 0 16 16">
                <path
                  d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                <path fill-rule="evenodd"
                  d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z" />
              </svg>
            </button>
          </div>
        </template>
      </EasyDataTable>
    </div>
  </div>
</template>

<script lang="ts">
import { ipcRenderer } from 'electron';
import type { Header, Item } from "vue3-easy-data-table";
import Swal from 'sweetalert2'
import * as XLSX from 'xlsx';


export default {
  name: "Managers",
  inject: ['ipcRenderer'],
  data() {
    return {
      managers: [] as any,
      headers: [] as Header[],
      items: [] as Item[],
      headersExcel: [] as Header[],
      itemsExcel: [] as Item[],
      searchField: "first_name",
      searchValue: "",
      itemsSelected: [] as Item[],
      message: "managers per page",
      loading: true,
      dialog: false,
      selectedFileName: "",
      dataRows: []
    };
  },
  async mounted() {
    this.headers = [
      { text: "First Name", value: "first_name" },
      { text: "Last Name ", value: "last_name" },
      { text: "Email", value: "email", width: 200 },
      { text: "Category", value: "category" },
      { text: "Edit", value: "edit", width: 50 },
    ];
    this.headersExcel = [
      { text: "First Name", value: "first_name" },
      { text: "Last Name ", value: "last_name" },
      { text: "Email", value: "email", width: 200 },
      { text: "Category", value: "category" },
    ];
    setTimeout(async () => {
      this.loading = false;
      this.items = await this.getManagersFromDb();
    }, 1500);

  },
  methods: {
    downloadExcel() {
      const headers = ['first_name', 'last_name', 'email', 'category'];

      const data = this.items.map(item => {
        return headers.map(header => item[header]);
      });

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
      XLSX.writeFile(wb, 'data.xlsx');
    },
    async pushNewData() {
      await Swal.fire({
        html: '<h4>Would you like to append data to the existing data or reset the array and add the new data?</h4>',
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: 'Merge',
        denyButtonText: `Replace`,
      }).then((result) => {
        if (result.isConfirmed) {
          ipcRenderer.invoke('insertMultiManagers', JSON.parse(JSON.stringify(this.dataRows)));
          Swal.fire('Saved!', '', 'success')
        } else if (result.isDenied) {
          ipcRenderer.invoke('EmptyManagers');
          ipcRenderer.invoke('insertMultiManagers', JSON.parse(JSON.stringify(this.dataRows)));
          Swal.fire('Saved!', '', 'success')
        }
      })
      this.items = await this.getManagersFromDb();
    },
    loadExcelFile(event) {
      const fileInput = event.target;
      const file = fileInput.files[0];
      this.selectedFileName = file.name;
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target!.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData: any = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        this.dataRows = jsonData.slice(1);
        this.itemsExcel = this.dataRows.map((row: any[]) => {
          return {
            "first_name": row[0],
            "last_name": row[1],
            "email": row[2],
            "category": row[3]
          };
        });


      };
      reader.readAsArrayBuffer(file);
    }
    ,
    async getManagersFromDb() {
      const response = await ipcRenderer.invoke('getManagers');
      this.managers = response;
      return this.managers;
    },
    async addManager() {
      const { value: formValues } = await Swal.fire({
        title: 'Add New Manager',
        html:
          '<input id="swal-input1" placeholder="FirstName" type="text" class="swal2-input">' +
          '<input id="swal-input2" placeholder="LastName" type="text" class="swal2-input">' +
          '<input id="swal-input3" placeholder="Email" type="text" class="swal2-input">' +
          '<input id="swal-input4" placeholder="Category" type="text" class="swal2-input">',
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Save',
        preConfirm: () => {
          const inputElement1 = document.getElementById('swal-input1') as HTMLInputElement;
          const inputElement2 = document.getElementById('swal-input2') as HTMLInputElement;
          const inputElement3 = document.getElementById('swal-input3') as HTMLInputElement;
          const inputElement4 = document.getElementById('swal-input4') as HTMLInputElement;
          return [
            inputElement1.value,
            inputElement2.value,
            inputElement3.value,
            inputElement4.value
          ];
        }
      });

      if (formValues) {
        const [first_name, last_name, email, category] = formValues;

        if (this.isEmptyValue(first_name) || this.isEmptyValue(last_name) || this.isEmptyValue(email) || this.isEmptyValue(category)) {
          Swal.fire('Missing Fields', 'Please fill in all the required fields.', 'error');
          return;
        }

        if (!this.isValidEmail(email)) {
          Swal.fire('Invalid Email', 'Please enter a valid email address.', 'error');
          return;
        }

        ipcRenderer.invoke('insertManager', formValues)
          .then(
            this.items = await this.getManagersFromDb()
          )
          .catch((err) => {
            Swal.fire('Something Error', err.message, 'error');
          });
      }
    },
    async deleteManagers() {
      if (this.itemsSelected.length === 0) {
        Swal.fire('Error', 'Please select a row to delete.', 'error');
      } else {
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
      }).then(async (result) => {
        if (result.isConfirmed) {
                 var emails = [] as any;
        var success = false;
        for (var i = 0; i < this.itemsSelected.length; i++) {
          emails.push(this.itemsSelected[i].email)
        }
        await ipcRenderer.invoke('deleteManagersbyemail', emails)
          .then(changes => {
            Swal.fire({title:'Success', text:"Successful deletion. " + changes + " lines removed.", icon:'success', showConfirmButton: false,
                               timer:1500});
            success = true;
          })
          .catch(error => {
            Swal.fire('Error', error.message, 'error');
          });
        if (success) {
          this.items = await this.getManagersFromDb();
        }
        }
        else if (result.dismiss === Swal.DismissReason.cancel) {
          Swal.fire(
            'Cancelled',
            'You have cancelled the deletion :)',
            'error'
          );
        }
      })
      }
    },
    async editManager(manager: any) {
      var oldemail = manager.email;
      const { value: formValues } = await Swal.fire({
        title: 'Update Manager',
        html:
          '<input id="swal-input1" placeholder="FirstName" type="text" class="swal2-input" value="' + manager.first_name + '">' +
          '<input id="swal-input2" placeholder="LastName" type="text" class="swal2-input" value="' + manager.last_name + '">' +
          '<input id="swal-input3" placeholder="Email" type="text" class="swal2-input" value="' + manager.email + '">' +
          '<input id="swal-input4" placeholder="Category" type="text" class="swal2-input" value="' + manager.category + '">',
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Save',
        preConfirm: () => {
          const inputElement1 = document.getElementById('swal-input1') as HTMLInputElement;
          const inputElement2 = document.getElementById('swal-input2') as HTMLInputElement;
          const inputElement3 = document.getElementById('swal-input3') as HTMLInputElement;
          const inputElement4 = document.getElementById('swal-input4') as HTMLInputElement;
          return [
            inputElement1.value,
            inputElement2.value,
            inputElement3.value,
            inputElement4.value
          ];
        }
      });
      if (formValues) {
        const [first_name, last_name, email, category] = formValues;

        if (this.isEmptyValue(first_name) || this.isEmptyValue(last_name) || this.isEmptyValue(email) || this.isEmptyValue(category)) {
          Swal.fire('Missing Fields', 'Please fill in all the required fields.', 'error');
          return;
        }

        if (!this.isValidEmail(email)) {
          Swal.fire('Invalid Email', 'Please enter a valid email address.', 'error');
          return;
        }
        await ipcRenderer.invoke('editManagerByEmail', [first_name, last_name, email, category, oldemail])
          .then(
            this.items = await this.getManagersFromDb()
            
          )
          .catch((err) => {
            Swal.fire('Something Error', err.message, 'error');
          });
      }
    },
    isValidEmail(email) {
      return /\S+@\S+\.\S+/.test(email);
    },
    isEmptyValue(value) {
      return value === '' || value === null;
    }
  },

}
</script>
<style>
.customize-table {
  --easy-table-header-font-color: #6785c1;
  --easy-table-body-even-row-font-color: #000000;
  --easy-table-body-even-row-background-color: rgb(248 250 252 / 1);
  --easy-checkbox-background-color: #6785c1;

}
</style>