<template>
    <div className="h-full w-full flex flex-col p-4">
        <div class="flex justify-between">
            <v-select v-model="selectedOption"  label="name" class="h-9 text-primary-dark rounded w-60 mr-3" 
                @click="() => loadJsonFiles()" :options="programs" @option:selected="onChangeFile()"></v-select>
            <div className="flex justify-end mb-3 text-gray-100">
                <input v-if="action == 'add' || isEditName" id="program-name" className="input mr-2"
                    placeholder="Add program name" @input="addProgramName($event)" v-model="nodeProgramName" />
                <button className="btn mr-2 flex items-center" @click="createNewFlow()">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                        class="mr-2 bi bi-plus-lg" viewBox="0 0 16 16">
                        <path fill-rule="evenodd"
                            d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2Z" />
                    </svg>
                    New Flow
                </button>
                <button className="btn mr-2 flex items-center"
                    @click="insertJSONFile(nodeProgramName); nodeProgramName = ''">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                        class="mr-2 bi bi-file-earmark-arrow-up-fill" viewBox="0 0 16 16">
                        <path
                            d="M9.293 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.707A1 1 0 0 0 13.707 4L10 .293A1 1 0 0 0 9.293 0zM9.5 3.5v-2l3 3h-2a1 1 0 0 1-1-1zM6.354 9.854a.5.5 0 0 1-.708-.708l2-2a.5.5 0 0 1 .708 0l2 2a.5.5 0 0 1-.708.708L8.5 8.707V12.5a.5.5 0 0 1-1 0V8.707L6.354 9.854z" />
                    </svg>
                    Save Flow
                </button>
                <button className="btn flex items-center" @click=" delprograme(); ">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                        class="mr-2 bi bi-trash-fill" viewBox="0 0 16 16">
                        <path
                            d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5zm3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0z" />
                    </svg>
                    Delete
                </button>
            </div>
        </div>
        <div class="flex flex-row w-full h-full">
            <div className="flex flex-col gap-2 w-[200px] mx-auto mr-3">
                <h4 className="border-b-4 p-2 text-center font-bold text-slate-500">Node Types</h4>
                <div class="nodes-list" draggable="true" v-for="          i           in           nodesList          "
                    :key=" i.name " :node-item=" i.item " @dragstart=" drag($event) ">
                    <span class="node"><img className="m-1" src="../assets/product-request-line-item-svgrepo-com.svg"
                            style="width: 20px; height: 20px;" alt="" srcset=""> {{ i.name }}</span>
                </div>
            </div>
            <div class="drawflow-container border border-slate-400 rounded w-full h-full relative">
                <div id="drawflow" @drop=" drop($event) " @dragover=" allowDrop($event) ">
                    <div id="ring">
                        <div v-if=" action != 'add' " class="flex bg-primary-light w-fit text-white p-2 justify-center"
                            style="border-bottom-right-radius: 7px;">
                            <button id="btnn" @click=" showinput() " class="mx-2">
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
                    @click=" cleanEditor() " title="Press to clear">
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
import { h, getCurrentInstance, render } from 'vue'
import Drawflow from 'drawflow'
import ImportCsv from '../components/ImportCsv.vue'
import NodeFileInput from '../components/Node-file-input.vue'
import NodeStart from '../components/Node-start.vue'
import NodeEnd from '../components/Node-end.vue'
import NodeGeneratePdf from '../components/Node-GeneratePdf.vue'
import Swal from 'sweetalert2'
import { nodesList } from '../utils/nodesList'
import { ipcRenderer } from 'electron';
import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';

export default {
    name: "DrawflowDashboard",
    inject: ['ipcRenderer'],
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
            nodesList: nodesList
        };
    },
    mounted() {
        const internalInstance: any = getCurrentInstance();
        internalInstance.appContext.app._context.config.globalProperties.$df = this.editor;

        var elements = document.getElementsByClassName('nodes-list');
        for (var i = 0; i < elements.length; i++) {
            elements[i].addEventListener('touchend', this.drop, false);
            elements[i].addEventListener('touchmove', this.touchScreenPosition, false);
            elements[i].addEventListener('touchstart', this.drag, false);
        }
        const id: HTMLElement = document.getElementById("drawflow") || document.createElement('div');
        this.editor.value = new Drawflow(id, { version: 3, h, render }, internalInstance.appContext.app._context);
        this.editor.value.start();


        this.editor.value.registerNode("ImportCsv", ImportCsv, {}, {});
        this.editor.value.registerNode("file-input", NodeFileInput, {}, {});
        this.editor.value.registerNode("start", NodeStart, {}, {});
        this.editor.value.registerNode("end", NodeEnd, {}, {});
        this.editor.value.registerNode("generatepdf", NodeGeneratePdf, {}, {});
    },
    methods: {
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
            this.editor.value.addNode(name, nodeSelected.input, nodeSelected.output, pos_x, pos_y, name, { number: 0, num1: 0, num2: 0 }, name, "vue");
        },
        addProgramName(event: any) {
            this.programName = event.target.value;
        },
        async loadJsonFiles() {
            const response = await ipcRenderer.invoke('getJsonFiles');
            this.programs = response;
        },
        async insertJSONFile(nodeProgramName: string) {
            var exist = await ipcRenderer.invoke('checkFileNameExists', { name: nodeProgramName })
            const editorState = this.editor.value.export();
            const jsonString = JSON.stringify(editorState);
            if (this.isEditName) {
                if (nodeProgramName.length === 0) {
                    Swal.fire('Empty Name', 'The field cannot be left empty, please input a name.', 'error')
                }
                else if (exist) {
                    Swal.fire('Duplicate Name', 'The name already exists in the database, please choose a different name.', 'error');
                } else {
                    await ipcRenderer.invoke('updateJsonFileName', { oldName: this.flowName, newName: nodeProgramName })
                        .then((result) => {
                            this.isEditName = false;
                            this.flowName = nodeProgramName;
                            this.selectedOption = nodeProgramName;
                            this.notify("The modification has been completed")
                        })
                        .catch(() => {
                            Swal.fire(
                                'Error!',
                                'Something wrong.',
                                'error'
                            );
                        });

                }
            }
            else {
                if (this.action == 'add') {
                    if (nodeProgramName.length === 0) {
                        Swal.fire('Empty Name', 'The field cannot be left empty, please input a name.', 'error')
                    } else {
                        await ipcRenderer.invoke('insertJsonFile', { name: nodeProgramName, data: jsonString })
                            .then((result) => {
                                this.notify("The insertion has been completed")
                                this.selectedOption = nodeProgramName;
                                this.action = 'edit';
                                this.flowName = nodeProgramName;
                            })
                            .catch(() => {
                                Swal.fire(
                                    'Error!',
                                    'Something wrong.',
                                    'error'
                                );
                            });
                    }
                }
                else {
                    await ipcRenderer.invoke('updateJsonFile', { name: this.flowName, data: jsonString })
                        .then((result) => {
                            this.notify("The modification has been completed")
                        })
                        .catch(() => {
                            Swal.fire(
                                'Error!',
                                'Something wrong.',
                                'error'
                            );
                        });
                }
            }

        },
        async delprograme() {
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
                    ipcRenderer.invoke('deleteJsonFile', { name: this.flowName })
                        .then((result) => {
                            Swal.fire(
                                'Deleted!',
                                'Your file has been deleted.',
                                'success'
                            )
                            this.createNewFlow();
                        })
                        .catch(() => {
                            Swal.fire(
                                'Error!',
                                'Something wrong.',
                                'error'
                            );
                        });

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
                this.editor.value.export();
                this.editor.value.import(ob);
            }
        },
        searchStart() {
            const editorData = this.editor.value.export().drawflow.Home.data;
            let variableName = "";
            Object.keys(editorData).forEach(function (i) {
                if (editorData[i].name === "Start") {
                    variableName = editorData[i].data.variable;
                }
            });
            return variableName
        },
        cleanEditor() {
            this.editor.value.clear();
        },
        async createNewFlow() {
            this.action = 'add';
            this.selectedOption = null;
            this.flowName = null;
            this.isEditName = false;
            this.nodeProgramName = "";
            this.cleanEditor();
        },
        showinput() {
            this.isEditName = true;
        }
    }
}
</script>

<style scoped>
.node {
    @apply bg-primary-light border border-collapse text-white p-3 rounded w-full cursor-pointer sm:text-sm flex hover:bg-primary-dark hover:border hover:border-gray-800;
}

#drawflow {
    text-align: initial;
    width: 100%;
    height: 100%;
    background: #f1eeee;
    background-size: 20px 20px;
    background-image: radial-gradient(#c5c3c3 1px, transparent 1px);
}
</style>