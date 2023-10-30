<template>
    <div className="h-full w-full flex flex-col p-4">
        <div class="flex justify-between">
            <v-select v-model="selectedOption" label="name" class="h-9 text-primary-dark rounded w-60 mr-3"
                @click="() => loadJsonFiles()" :options="programs" @option:selected="onChangeFile()">
            </v-select>
            <div className="flex justify-end mb-3 text-gray-100">
                <input v-if="action == 'add' || isEditName" className="input mr-2" v-bind:placeholder="getPlaceholderText()"
                    @input="addProgramName($event)" v-model="nodeProgramName" />
                <button className="btn mr-2 flex items-center" @click="createNewFlow()">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                        class="mr-2 bi bi-plus-lg" viewBox="0 0 16 16">
                        <path fill-rule="evenodd"
                            d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2Z" />
                    </svg>
                    {{ t("flow.new") }}
                </button>
                <button className="btn mr-2 flex items-center" @click="addEditFlow(nodeProgramName); nodeProgramName = ''">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                        class="mr-2 bi bi-file-earmark-arrow-up-fill" viewBox="0 0 16 16">
                        <path
                            d="M9.293 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.707A1 1 0 0 0 13.707 4L10 .293A1 1 0 0 0 9.293 0zM9.5 3.5v-2l3 3h-2a1 1 0 0 1-1-1zM6.354 9.854a.5.5 0 0 1-.708-.708l2-2a.5.5 0 0 1 .708 0l2 2a.5.5 0 0 1-.708.708L8.5 8.707V12.5a.5.5 0 0 1-1 0V8.707L6.354 9.854z" />
                    </svg>
                    {{ t("flow.save") }}
                </button>
                <button className="btn mr-2  flex items-center" @click="duplicateFlow();">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                        class="mr-2 bi bi-file-earmark-plus-fill" viewBox="0 0 16 16">
                        <path
                            d="M9.293 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.707A1 1 0 0 0 13.707 4L10 .293A1 1 0 0 0 9.293 0zM9.5 3.5v-2l3 3h-2a1 1 0 0 1-1-1zM8.5 7v1.5H10a.5.5 0 0 1 0 1H8.5V11a.5.5 0 0 1-1 0V9.5H6a.5.5 0 0 1 0-1h1.5V7a.5.5 0 0 1 1 0z" />
                    </svg>
                    {{ t("flow.duplicate") }}
                </button>
                <button className="btn flex items-center" @click=" delprograme();">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                        class="mr-2 bi bi-trash-fill" viewBox="0 0 16 16">
                        <path
                            d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5zm3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0z" />
                    </svg>
                    {{ t("flow.delete") }}
                </button>
            </div>
        </div>
        <div class="sidebar-wrapper">
            <aside :class="`${showSidebar ? 'is-expanded' : showSidebar}`">
                <link href="https://fonts.googleapis.com/css2?family=Material+Icons" rel="stylesheet">
                <button class=" menu-toggle-wrap menu-toggle" @click="showSidebar = !showSidebar">
                    <span class="material-icons">keyboard_double_arrow_left</span>
                </button>
                <h4 className="border-b-4 p-2 border-white text-center font-bold text-black-700 -mt-10 ">{{ t("messages.TranslateTitleFlowHistory") }}</h4>
               <br>
                <div class="scroll-container">
                    <div>
                        <div style="display: flex">
                            <vue3-tree-vue :items="items"
                                :hideGuideLines="false"
                                v-model:selectedItem="selectedItem"
                                @onSelect="handleFlowClick(selectedItem)"
                                :expandAll="true"
                                style="width: 500px; display: block; border-right: 1px solid gray"
                            >
                                        <template v-slot:item-expander="item">
                                            <div class="d-flex" style="display: flex; justify-content: center; vertical-align: center; justify-items: center; align-items: center; margin-right: 10px;" :style="{background: item.type == 'folder' ? 'blue' : 'white', height: '14px', width: '14px', 'margin-right': '0.2em', 'border-radius': '4px'}">
                                            <span style="color: black;">-</span>
                                            </div>
                                        </template>
                            </vue3-tree-vue>
                        </div>
                    </div>
                </div>
            </aside>
            <div v-if="showSidebar" class="sidebar-overlay" @click="closeSidebar"></div>
            <div className="flex flex-col gap-2 w-[170px] mx-auto mr-20">
                <div className="relative w-[239px] mx-auto mr-40">
                    <button class="menu-toggle absolute left-0 top-0" @click="toggleSidebarAndChangeItems">
                        <span class="material-icons">keyboard_double_arrow_right</span>
                    </button>
                    <h4 className="border-b-4 p-2 border-primary-dark text-center font-bold text-black-700  ">{{ t("flow.types") }}</h4>
                </div>
                <div class="nodes-list" draggable="true" v-for="i in nodesList" :key="i.name" :node-item="i.item"
                    @dragstart="drag($event)">
                    <span class="node"> <span v-html="i.icon" class="m-1 "></span> {{ t("nodes." + i.name) }}</span>
                </div>
            </div>
            <div class="drawflow-container border border-slate-400 rounded w-full h-full relative">
                <div id="drawflow" @drop=" drop($event)" @dragover=" allowDrop($event)">
                    <div>
                        <div v-if="action != 'add'" class="flex bg-primary-light w-fit text-white p-2 justify-center"
                            style="border-bottom-right-radius: 7px;">
                            <button @click=" showinput()" class="mx-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="30" fill="currentColor"
                                    class="bi bi-pencil-square" viewBox="0 0 16 16">
                                    <path
                                        d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                                    <path fill-rule="evenodd"
                                        d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z" />
                                </svg>
                            </button>
                            <pre class="mr-1 my-0 p-0 flex items-center">{{ flowName }}</pre>

                        </div>
                    </div>
                </div>
                <a className="absolute m-2 right-0 top-0 cursor-pointer text-primary-dark hover:text-primary-light"
                    @click=" cleanFlow()">
                    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="currentColor"
                        class="bi bi-arrow-clockwise" viewBox="0 0 16 16">
                        <path fill-rule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z" />
                        <path
                            d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z" />
                    </svg>
                </a>
        </div>

        </div>
    </div>
    
</template>

<script lang="ts">
import { h, getCurrentInstance, render,nextTick } from 'vue'
import Drawflow from 'drawflow'
import ImportExcel from '../components/ImportExcel.vue'
import NodeFileInput from '../components/Node-file-input.vue'
import NodeStart from '../components/Node-start.vue'
import NodeEnd from '../components/Node-end.vue'
import NodeQrCode from '../components/Node-QrCode.vue'
import NodeGeneratePdf from '../components/Node-GeneratePdf.vue'
import NodeZipFolder from '../components/Node-zipFolder.vue'
import Condition from '../components/Node-Condition.vue'
import sendEmail from '../components/Node-sendEmail.vue'
import groupPdfBy from '../components/Node-groupPdfBy.vue'
import alert from '../components/Node-alert.vue'
import Swal from 'sweetalert2'
import { nodesList } from '../utils/nodesList'
import { ipcRenderer } from 'electron';
import { toast } from 'vue3-toastify';
import { useI18n } from 'vue-i18n'
import 'vue3-toastify/dist/index.css';
import Vue3TreeVue from '../components/tree-component.vue';
import { TreeViewItem } from '../Tree/types';
import { useStore } from 'vuex';
import { mapActions } from 'vuex';

export default {
    name: "DrawflowDashboard",
    inject: ['ipcRenderer'],
    components: {
        Vue3TreeVue
    },
    setup() {
        const { t } = useI18n()
        return { t }
    },
    data() {
        return {
            selectedOption: null as any,
            programName: '' as string,
            action: 'add' as string,
            nodeProgramName: '' as string,
            flowName: null as any,
            isEditName: false as boolean,
            programs: [] as any,
            editor: [] as any,
            node_select: '',
            node_last_move: null as any,
            nodesList: nodesList,
            cleanFlowTitle:"",
            items: [] as TreeViewItem[],
            selectedItem: null as any,
            selectedItems: null as any,
            onItemSelected: [] as any,
            isExpanded: localStorage.getItem('is_expanded') === 'true',
            showSidebar: false,
            initialTranslateYears:"years"
        };
    },
    async mounted() {
        this.cleanFlowTitle=this.t("flow.clear")
        const internalInstance: any = getCurrentInstance();
        internalInstance.appContext.app._context.config.globalProperties.$df = this.editor;
        this.setHeaders([]);
        this.setExcelData([]);
        var elements = document.getElementsByClassName('nodes-list');
        for (var i = 0; i < elements.length; i++) {
            elements[i].addEventListener('touchend', this.drop, false);
            elements[i].addEventListener('touchmove', this.touchScreenPosition, false);
            elements[i].addEventListener('touchstart', this.drag, false);
        }
        const id: HTMLElement = document.getElementById("drawflow") || document.createElement('div');
        this.editor.value = new Drawflow(id, { version: 3, h, render }, internalInstance.appContext.app._context);
        this.editor.value.start();

        this.editor.value.registerNode("ImportExcel", ImportExcel, {}, {});
        this.editor.value.registerNode("file-input", NodeFileInput, {}, {});
        this.editor.value.registerNode("start", NodeStart, {}, {});
        this.editor.value.registerNode("end", NodeEnd, {}, {});
        this.editor.value.registerNode("Generatepdf", NodeGeneratePdf, {}, {});
        this.editor.value.registerNode("zip-folder", NodeZipFolder, {}, {});
        this.editor.value.registerNode("condition", Condition, {}, {});
        this.editor.value.registerNode("send-email", sendEmail, {}, {});
        this.editor.value.registerNode("groupPdfBy", groupPdfBy, {}, {});
        this.editor.value.registerNode("alert", alert, {}, {});
        this.editor.value.registerNode("Qr-Code", NodeQrCode, {}, {});
        let mytemplate = ""
        let excelName = ""
        const store = useStore()
        let headers = store.getters.getHeaders // Access headers from Vuex getter
        let excelData = store.getters.getExcelData // Access excelData from Vuex getter
        let symbole = ""
        let pdfpath = ""
        let message = ""
        let variable2 = ""
        let variable1 = ""
        let group = ""
        let myzip = ""
        const updateNodeOperation = (output_class: any, outputTemplate: any, outputExcelName: any, outputHeaders: any, outputExcelData: any, outputSymbole: any, outputpdfpath: any, outputmessage: any, outputVariable2: any, outputVariable1: any, outputMyzip: any, outputGroup: any, inputNodeData: any) => {
            if (output_class == "input_1") {
                mytemplate = outputTemplate;
                excelName = outputExcelName;
                headers = outputHeaders;
                excelData = outputExcelData;
                symbole = outputSymbole;
                pdfpath = outputpdfpath;
                message = outputmessage;
                variable2 = outputVariable2;
                variable1 = outputVariable1;
                myzip = outputMyzip;
                group = outputGroup;
            }
            const input_id = inputNodeData.id;
            this.editor.value.updateNodeDataFromId(input_id, { mytemplate: mytemplate, excelName: excelName, headers: headers, excelData: excelData, symbole: symbole, pdfpath: pdfpath, message: message, variable1: variable1, variable2: variable2, myzip: myzip, group: group });
        }
        this.editor.value.on("import", () => {
            const editorData = this.editor.value.export().drawflow.Home.data;
            Object.keys(editorData).forEach(function (i) {
                mytemplate = editorData[i].data.mytemplate;
                excelName = editorData[i].data.excelName;
                headers = editorData[i].data.headers;
                excelData = editorData[i].data.excelData;
                symbole = editorData[i].data.symbole;
                pdfpath = editorData[i].data.pdfpath;
                message = editorData[i].data.message;
                variable2 = editorData[i].data.variable2;
                variable1 = editorData[i].data.variable1;
                myzip = editorData[i].data.myzip;
                group = editorData[i].data.group;
            });

        });

        this.editor.value.on("nodeSelected", () => {
            const editorContent = this.editor.value.export();
            document.addEventListener('keydown', (event) => {
                if (event.ctrlKey && event.key === 'v') {
                    this.editor.value.import(editorContent);
                }
            });
        });
        
        this.loadItems(store.getters.getTranslateYears);

    },
    methods: {
        ...mapActions(['setHeaders', 'setExcelData']),
        closeSidebar(){
            this.showSidebar=false;
        },
        toggleSidebarAndChangeItems(){
         this.showSidebar = !this.showSidebar
         const store = useStore()
         this.loadItems(store.getters.getTranslateYears);  
        },
        getPlaceholderText() {
            if (this.action === 'edit' || this.isEditName) {
                return this.t('flow.editname');
            } else {
                return this.t('flow.addname');
            }
        },
        notify(message) {
            toast.success(message, {
                autoClose: 3000,
                theme: 'colored',
                position: toast.POSITION.BOTTOM_LEFT,
            });
        },
        touchScreenPosition(ev: any) {
            this.node_last_move = ev;
        },
        drag(ev: any) {
            if (ev.type === "touchstart") {
                this.node_select = ev.target.closest(".nodes-list").getAttribute('node-item');
            }
            else {
                ev.dataTransfer.setData("node", ev.target.getAttribute("node-item"));
            }
        },
        allowDrop(ev: any) {
            ev.preventDefault();
        },
        drop(ev: any) {
            if (ev.type === "touchend") {
                let clientX: number = this.node_last_move.touches[0].clientX;
                let clientY: number = this.node_last_move.touches[0].clientY;
                let parentdrawflow: any = document.elementFromPoint(clientX, clientY)?.closest("#drawflow");
                if (parentdrawflow != null) {
                    this.addNodeToDrawFlow(this.node_select, this.node_last_move.touches[0].clientX, this.node_last_move.touches[0].clientY);
                }
            }
            else {
                ev.preventDefault();
                let data = ev.dataTransfer.getData("node");
                this.addNodeToDrawFlow(data, ev.clientX, ev.clientY);
            }
        },
        addNodeToDrawFlow(name: any, pos_x: any, pos_y: any) {
            pos_x = pos_x * (this.editor.value.precanvas.clientWidth / (this.editor.value.precanvas.clientWidth * this.editor.value.zoom)) - (this.editor.value.precanvas.getBoundingClientRect().x
                * (this.editor.value.precanvas.clientWidth / (this.editor.value.precanvas.clientWidth * this.editor.value.zoom)));
            pos_y = pos_y * (this.editor.value.precanvas.clientHeight / (this.editor.value.precanvas.clientHeight * this.editor.value.zoom)) - (this.editor.value.precanvas.getBoundingClientRect().y
                * (this.editor.value.precanvas.clientHeight / (this.editor.value.precanvas.clientHeight * this.editor.value.zoom)));
            const nodeSelected: any = nodesList.find(object => object.item === name);
            this.editor.value.addNode(name, nodeSelected.input, nodeSelected.output, pos_x, pos_y, name, { mytemplate: "", excelName: "", headers: [], excelData: "", symbole: "", pdfpath: "", message: "", varaible1: "", varaible2: "", myzip: "" }, name, "vue");
        },
        addProgramName(event: any) {
            this.programName = event.target.value;
        },
        async loadJsonFiles() {
            const response = await ipcRenderer.invoke('getJsonFiles');
            this.programs = response;
        },
        async addEditFlow(nodeProgramName: string) {
            var exist = await ipcRenderer.invoke('checkFileNameExists', { name: nodeProgramName })
            const editorState = this.editor.value.export();
            const jsonString = JSON.stringify(editorState);
            if (this.isEditName) {
                if (nodeProgramName.length === 0) {
                    Swal.fire(this.t('messages.empty'), this.t('messages.textempty'), 'error')
                }
                else if (exist) {
                    Swal.fire(this.t('messages.duplicate'), this.t('messages.textduplicate'), 'error');
                } else {
                    await ipcRenderer.invoke('updateJsonFileName', { oldName: this.flowName, newName: nodeProgramName })
                        .then((result) => {
                            this.isEditName = false;
                            this.flowName = nodeProgramName;
                            this.selectedOption = nodeProgramName;
                            this.notify(this.t('messages.update'))
                        })
                        .catch(() => {
                            Swal.fire({
                                title: this.t('messages.error'),
                                text: this.t('messages.wrong'),
                                icon: 'error',
                                showConfirmButton: false,
                            })
                        });

                }
            }
            else {
                if (this.action == 'add') {
                    if (nodeProgramName.length === 0) {
                        Swal.fire(this.t('messages.empty'), this.t('messages.textempty'), 'error')
                    } else {
                        const currentDate = new Date();
                        const currentYear = currentDate.getFullYear();
                        await ipcRenderer.invoke('insertJsonFile', { name: nodeProgramName, data: jsonString, year: currentYear })
                            .then((result) => {
                                this.notify(this.t('messages.insertion'))
                                this.selectedOption = nodeProgramName;
                                this.action = 'edit';
                                this.flowName = nodeProgramName;
                            })
                            .catch(() => {
                                Swal.fire({
                                    title: this.t('messages.error'),
                                    text: this.t('messages.wrong'),
                                    icon: 'error',
                                    showConfirmButton: false,
                                }
                                );
                            });
                    }
                }
                else {
                    await ipcRenderer.invoke('updateJsonFile', { name: this.flowName, data: jsonString })
                        .then((result) => {
                            this.notify(this.t('messages.update'))
                        })
                        .catch(() => {
                            Swal.fire({
                                title: this.t('messages.error'),
                                text: this.t('messages.wrong'),
                                icon: 'error',
                                showConfirmButton: false,
                            }
                            );
                        });
                }
            }

        },
        async delprograme() {
            Swal.fire({
                title: this.t('messages.sure'),
                text: this.t('messages.textsure'),
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: this.t('messages.yes'),
                cancelButtonText: this.t('messages.no'),
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                reverseButtons: true
            }).then((result) => {
                if (result.isConfirmed) {
                    ipcRenderer.invoke('deleteJsonFile', { name: this.flowName })
                        .then((result) => {
                            Swal.fire({
                                title: this.t('messages.delete'),
                                text: this.t('messages.flowdelete'),
                                icon: 'success',
                                showConfirmButton: false,
                                timer: 1500,

                            }
                            )
                            this.createNewFlow();
                        })
                        .catch(() => {
                            Swal.fire({
                                title: this.t('messages.error'),
                                text: this.t('messages.wrong'),
                                icon: 'error',
                                showConfirmButton: false,
                            }
                            );
                        });

                } else if (
                    result.dismiss === Swal.DismissReason.cancel
                ) {
                    Swal.fire(
                        this.t('messages.cancel'),
                        this.t('messages.flowsafe'),
                        'error'
                    )
                }
            })
        },
        searchNodeExcel() {
            const editorData = this.editor.value.export().drawflow.Home.data;
            let data = "";
            Object.keys(editorData).forEach(function (i) {
                if (editorData[i].name === "ImportExcel") {
                    data = editorData[i];
                }
            });
            return data;
        },
        async onChangeFile() {
            const selectedFile = this.selectedOption;
            this.action = "edit"
            this.flowName = selectedFile;
            this.isEditName = false;
            const response = await ipcRenderer.invoke('getJsonFile', { name: selectedFile });
            const jsonData = JSON.parse(response);
            if (jsonData?.drawflow) {
                const dataa = jsonData.drawflow.Home.data;
                const ob = {
                    drawflow: {
                        Home: {
                            data: dataa
                        }
                    }
                };
                this.editor.value.import(ob);
                const nodeExcelData: any = this.searchNodeExcel();
                if (nodeExcelData) {
                    var headNames = [] as string[];
                    var dataRows = [] as string[];
                    headNames = nodeExcelData.data.headers;
                    dataRows = nodeExcelData.data.excelData;
                    this.setHeaders(headNames);
                    this.setExcelData(dataRows);
                }
            }
        },
        cleanFlow() {
            Swal.fire({
                title: this.t('messages.sure'),
                text: this.t('messages.clear'),
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: this.t('flow.clean'),
                cancelButtonText: this.t('messages.no'),
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                reverseButtons: true
            }).then((result) => {
                if (result.isConfirmed) {
                    this.editor.value.clear();
                    Swal.fire({
                        icon: 'success',
                        html: '<h4 style="color:#6785c1;">' + this.t('messages.clearsuccess') + '</h4>',
                        width: 400,
                        showClass: {
                            popup: 'animate__animated animate__fadeInDown'
                        },
                        hideClass: {
                            popup: 'animate__animated animate__fadeOutUp'
                        },
                        showConfirmButton: false,
                        timer: 1500
                    })

                }
            })
        },
        async createNewFlow() {
            this.action = 'add';
            this.selectedOption = null;
            this.flowName = null;
            this.isEditName = false;
            this.nodeProgramName = "";
            this.editor.value.clear();
            this.setHeaders([]);
            this.setExcelData([]);
        },
        showinput() {
            this.isEditName = true;
        },
        duplicateFlow() {
            const nameprograme = this.selectedOption;
            const editorState = this.editor.value.export();
            this.createNewFlow()
            this.nodeProgramName = nameprograme + "-copy";
            this.editor.value.import(editorState);
            const nodeExcelData: any = this.searchNodeExcel();
            if (nodeExcelData) {
                var headNames = [] as string[];
                var dataRows = [] as string[];
                headNames = nodeExcelData.data.headers;
                dataRows = nodeExcelData.data.excelData;
                this.setHeaders(headNames);
                this.setExcelData(dataRows);
            }
        },
        toggleMenu() {
            this.isExpanded = !this.isExpanded;
            localStorage.setItem('is_expanded', this.isExpanded.toString());
        },
        async loadItems(traductionYear:any) {
   
            try {
                const years = await ipcRenderer.invoke('getYearsFlow');
                this.items = [
                    {
                        name: traductionYear,
                        id: 'years',
                        type: 'string',
                        children: await Promise.all(
                            years.map(async (year: number) => {
                                const flows = await ipcRenderer.invoke('getFlowsByYear', { year });
                                return {
                                    name: year.toString(),
                                    id: year,
                                    type: 'number',
                                    children: flows.map((flow: string) => ({
                                        name: flow,
                                        type: 'string',
                                        id: flow,

                                    })),
                                };
                            })
                        ),
                    },
                ];
            } catch (error) {
                console.error(error);
            }
        },
        async handleFlowClick(selectedItem) {
            const selectedFlow = selectedItem?.name;
            this.flowName = selectedFlow;
            this.isEditName = false;
            const response = await ipcRenderer.invoke('getJsonFile', { name: selectedFlow });
            const jsonData = JSON.parse(response);
            if (jsonData?.drawflow) {
                const dataa = jsonData.drawflow.Home.data;
                const ob = {
                    drawflow: {
                        Home: {
                            data: dataa
                        }
                    }
                };
                this.editor.value.import(ob);
                const nodeExcelData: any = this.searchNodeExcel();
                if (nodeExcelData) {
                    var headNames = [] as string[];
                    var dataRows = [] as string[];
                    headNames = nodeExcelData.data.headers;
                    dataRows = nodeExcelData.data.excelData;
                    this.setHeaders(headNames);
                    this.setExcelData(dataRows);
                }
        }
        },
    }
}
</script>

<style lang="scss" scoped>
.node {
    @apply bg-primary-light border border-collapse text-white p-3 rounded w-60  cursor-pointer sm:text-sm flex hover:bg-primary-dark hover:border hover:border-gray-800;
}


#drawflow {
    text-align: initial;
    width: 100%;
    height: 100%;
    background: #f1eeee;
    background-size: 20px 20px;
    background-image: radial-gradient(#c5c3c3 1px, transparent 1px);
}

.scroll-container {
        max-height: 599px;
        margin-right: -6.5%;
        flex: 1;
        overflow-y: auto;
    }

    /* Width */
    .scroll-container::-webkit-scrollbar {
        width: 10px;
    }
    
    /* Track */
    .scroll-container::-webkit-scrollbar-track {
        background:#f1eeee;
    }
    
    /* Handle */
    .scroll-container::-webkit-scrollbar-thumb {
        @apply bg-primary-light;        
        border-radius: 5px;
    }
    
    /* Handle on hover */
    .scroll-container::-webkit-scrollbar-thumb:hover {
        @apply bg-primary-light        
    }

.sidebar-wrapper {
    position: relative;
    display: flex;
    overflow: hidden;

}

aside {

    display: none;


    .flex {
        flex: 1 1 0%;
    }


    .menu-toggle-wrap {
        display: flex;
        justify-content: flex-end;
        margin-bottom: 1rem;
        position: relative;
        top: 0;
        transition: 0.2s ease-in-out;

        .menu-toggle {
            transition: 0.2s ease-in-out;

            .material-icons {
                font-size: 2rem;
                color: white;
                transition: 0.2s ease-out;


            }

            &:hover {
                .material-icons {
                    color: white;
                    transform: translateX(1rem);
                }
            }
        }
    }

    &.is-expanded {
        display: flex;
        flex-direction: column;
        @apply bg-primary-dark text-white font-bold;
        overflow: hidden;
        padding: 1rem;
        transition: width 0.2s ease-in-out;
        width: 239px;
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        z-index: 99;

        .menu-toggle-wrap {
            top: -1rem;

            .menu-toggle {
                transform: rotate(-180deg);
            }
        }
    }

    @media (max-width: 1024px) {
        position: absolute;
        z-index: 99;
    }
}


* {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    font-size: 14px;
}
.sidebar-wrapper {
  position: relative;
}

.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 999; /* Make sure the overlay is above other elements */
}

</style>

