<template>
    <div className="h-full w-full flex flex-col p-4">
        <div className="flex justify-end mb-3 text-gray-100">
            <input id="program-name" className="input mr-2" placeholder="Add program name" @input="addProgramName($event)"
                v-model="nodeProgramName" />
            <button id="new-flow-button" className="btn bg-amber-600 hover:bg-amber-400 mr-3 w-28" @click="createNewFlow()">
                New Flow
            </button>
            <button className="btn bg-green-500 hover:bg-green-400 mr-3 w-28"
                @click="insertJSONFile(nodeProgramName); nodeProgramName = ''">
                Save
            </button>
            <v-select v-model="selectedOption" :options="programs" label="name"
                class="h-9 hover:bg-blue-200 rounded w-60 mr-3 text-blue-600 hover:text-blue-400"
                style="border: 2px solid blue; border-radius: 5px;" @click="() => loadJsonFiles()"
                @option:selected="onchangeSelect()"></v-select>
            <button className="btn bg-red-400 hover:bg-red-300 w-28 " @click="delprograme();">Delete</button>
        </div>
        <div class="flex flex-row w-full h-full">
            <div className="flex flex-col gap-2 w-[200px] mx-auto mr-3">
                <h4 className="border-b-4 p-2 text-center font-bold text-slate-500">Node Types</h4>
                <div class="nodes-list" draggable="true" v-for="i in nodesList" :key="i.name" :node-item="i.item"
                    @dragstart="drag($event)">
                    <span class="node"><img className="m-1" src="../assets/product-request-line-item-svgrepo-com.svg"
                            style="width: 20px; height: 20px;" alt="" srcset=""> {{ i.name }}</span>
                </div>
            </div>
            <div class="drawflow-container border border-slate-400 rounded w-full h-full relative">
                <div id="drawflow" @drop="drop($event)" @dragover="allowDrop($event)">
                    <div id="ring">
                        <div class="bg-stone-300  ring-offset-2 ring-2 ring-blue-500 rounded-br-lg ml-0 mr-auto h-8 flex">
                            <button id="btnn" @click="showinput()" class="pl-2 "> <img class="transform hover:-rotate-12"
                                    style="width: 70px; height: 30px;" src="../assets/editb.png" alt=""> </button>
                            <input id="prog-name"
                                class=" w-28 inline-block bg-stone-300 py-1 tracking-widest text-sm italic font-bold font-sans text-gray-800 mr-2 text-center"
                                type="text" readonly>
                        </div>
                    </div>
                </div>
                <a className="absolute w-10 m-2 right-0 top-0" @click="cleanEditor()" title="Press to clear">
                    <img src="../assets/reload.png" style="width: 40px; height: 40px;">
                </a>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { h, getCurrentInstance, render, onMounted, shallowRef } from 'vue'
import Drawflow from 'drawflow'
import GeneratePdf from '../components/Node-GeneratePdf.vue'
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
            nodeProgramName: "",



        };
    },
    setup() {
        const notify = (message) => {
            toast.success(message, {
                autoClose: 3000,
                theme: 'colored',
                position: toast.POSITION.BOTTOM_LEFT,
            });
        }

        var selectedOption: any = shallowRef(null);
        const programName = shallowRef("");
        const test = shallowRef(false);
        var programs = shallowRef([]);
        const editor: any = shallowRef({});
        const Vue = { version: 3, h, render };
        const internalInstance: any = getCurrentInstance();
        internalInstance.appContext.app._context.config.globalProperties.$df = editor;
        
        let node_select = "", node_last_move: any = null;
        function touchScreenPosition(ev: any) {
            node_last_move = ev;
        }

        const drag = (ev: any) => {          
            
            if (ev.type === "touchstart") {
                node_select = ev.target.closest(".nodes-list").getAttribute('node-item');
            }
            else {
                ev.dataTransfer.setData("node", ev.target.getAttribute("node-item"));
            }
        };

        const allowDrop = (ev: any) => {
            ev.preventDefault();
        };

        const drop = (ev: any) => {
          
            if (ev.type === "touchend") {
                let clientX: number = node_last_move.touches[0].clientX;
                let clientY: number = node_last_move.touches[0].clientY;
                let parentdrawflow: any = document.elementFromPoint(clientX, clientY)?.closest("#drawflow");
                if (parentdrawflow != null) {
                    addNodeToDrawFlow(node_select, node_last_move.touches[0].clientX, node_last_move.touches[0].clientY);
                }
            }
            else {
                ev.preventDefault();
                let data = ev.dataTransfer.getData("node");
                addNodeToDrawFlow(data, ev.clientX, ev.clientY);
            }
        };

        const addNodeToDrawFlow = (name: any, pos_x: any, pos_y: any) => {
            pos_x = pos_x * (editor.value.precanvas.clientWidth / (editor.value.precanvas.clientWidth * editor.value.zoom)) - (editor.value.precanvas.getBoundingClientRect().x
                * (editor.value.precanvas.clientWidth / (editor.value.precanvas.clientWidth * editor.value.zoom)));
            pos_y = pos_y * (editor.value.precanvas.clientHeight / (editor.value.precanvas.clientHeight * editor.value.zoom)) - (editor.value.precanvas.getBoundingClientRect().y
                * (editor.value.precanvas.clientHeight / (editor.value.precanvas.clientHeight * editor.value.zoom)));
            const nodeSelected: any = nodesList.find(object => object.item === name);
            editor.value.addNode(name, nodeSelected.input, nodeSelected.output, pos_x, pos_y, name, { number: 0, num1: 0, num2: 0 }, name, "vue");
        };
        const addProgramName = (event: any) => {
            programName.value = event.target.value;
        };
        async function loadJsonFiles() {
            const response = await ipcRenderer.invoke('getJsonFiles');
            programs.value = response;
        }

        async function insertJSONFile(nodeProgramName: string) {
            const inputp = document.querySelector('input#prog-name');
            const input = document.querySelector('input#program-name');
            const editorState = editor.value.export();
            const jsonString = JSON.stringify(editorState);
            const btn = document.querySelector('button#btnn');
            const divv = document.querySelector('div#ring'); 
                if (!(input as HTMLSelectElement).value && test.value === false) {
                    if (nodeProgramName.length === 0 && selectedOption.value===null) {
                Swal.fire('Empty Name', 'The field cannot be left empty, please input a name.', 'error')
            }    else {
                   
                    const namen = (inputp as HTMLSelectElement).value
                    try {
                        await ipcRenderer.invoke('updateJsonFile', { name: namen, data: jsonString });
                        notify("The modification has been completed")
                    } catch (e) {
                        console.error('La méthode a échoué avec l\'erreur suivante :', e);
                    } }
                }
                else if ((inputp as HTMLSelectElement).value && test.value === true) {
                    if ( nodeProgramName.length === 0) {
                Swal.fire('Empty Name', 'The field cannot be left empty, please input a name.', 'error')
            }    else {
                   
                    const namen = (inputp as HTMLSelectElement).value
                    selectedOption.value = nodeProgramName;
                    (inputp as HTMLSelectElement).value = nodeProgramName;
                    (input as HTMLSelectElement).style.display = 'none';
                    test.value = false;
                    try {
                        await ipcRenderer.invoke('updateJsonFileName', { oldName: namen, newName: nodeProgramName });
                        notify("The modification has been completed")
                    } catch (e) {
                        console.error('La méthode a échoué avec l\'erreur suivante :', e);
                    }}

                } else {
                    if ( nodeProgramName.length === 0) {
                Swal.fire('Empty Name', 'The field cannot be left empty, please input a name.', 'error')
                 } else {
                    
                    (input as HTMLSelectElement).style.display = 'none';
                    (inputp as HTMLSelectElement).style.display = 'block';
                    (btn as HTMLSelectElement).style.display = 'block';
                    (divv as HTMLSelectElement).style.display = 'block';
                    (inputp as HTMLSelectElement).value = nodeProgramName;
                    selectedOption.value = nodeProgramName
                    try {
                        await ipcRenderer.invoke('insertJsonFile', { name: nodeProgramName, data: jsonString });
                        notify("The insertion has been completed")
                    } catch (e) {
                        console.error('La méthode a échoué avec l\'erreur suivante :', e);
                    }
            }}
        }
        async function delprograme() {
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
                    const inputp = document.querySelector('input#prog-name');
                    const namp = (inputp as HTMLSelectElement).value;
                    const programNameInput = document.querySelector('input#program-name');
                    const btn = document.querySelector('button#btnn');
                    selectedOption.value = null;
                    (inputp as HTMLSelectElement).style.display = 'none';
                    (btn as HTMLSelectElement).style.display = 'none';
                    const divv = document.querySelector('div#ring');
                    (divv as HTMLSelectElement).style.display = 'none';
                    (programNameInput as HTMLSelectElement).style.display = 'block';
                    (programNameInput as HTMLSelectElement).value = "";
                    cleanEditor();
                    ipcRenderer.invoke('deleteJsonFile', { name: namp });
                    Swal.fire(
                        'Deleted!',
                        'Your file has been deleted.',
                        'success'
                    )
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
        }
        async function onchangeSelect() {
            const inputp = document.querySelector('input#prog-name');
            const btn = document.querySelector('button#btnn');
            const selectedFile = selectedOption.value;
            const programNameInput = document.querySelector('input[placeholder="Add program name"]');
            (programNameInput as HTMLSelectElement).style.display = 'none';
            (inputp as HTMLSelectElement).style.display = 'block';
            (btn as HTMLSelectElement).style.display = 'block';
            (programNameInput as HTMLSelectElement).value = selectedFile;
            (inputp as HTMLSelectElement).value = selectedFile;
            const divv = document.querySelector('div#ring');
            (divv as HTMLSelectElement).style.display = 'block';
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
                editor.value.export();
                editor.value.import(ob);
            }
        }
        function searchStart(){        
            const editorData = editor.value.export().drawflow.Home.data;
                let variableName = "";
                Object.keys(editorData).forEach(function (i) {
                    if (editorData[i].name === "Start") {
                        variableName = editorData[i].data.variable;
                    }
                   
                });
            return variableName
        }
        onMounted(() => {
            const inputp = document.querySelector('input#prog-name');
            (inputp as HTMLSelectElement).style.display = 'none';
            const divv = document.querySelector('div#ring');
            (divv as HTMLSelectElement).style.display = 'none';
            const btn = document.querySelector('button#btnn');
            (btn as HTMLSelectElement).style.display = 'none';
            var elements = document.getElementsByClassName('nodes-list');
            for (var i = 0; i < elements.length; i++) {
                elements[i].addEventListener('touchend', drop, false);
                elements[i].addEventListener('touchmove', touchScreenPosition, false);
                elements[i].addEventListener('touchstart', drag, false);
            }
            const id: HTMLElement = document.getElementById("drawflow") || document.createElement('div');
            editor.value = new Drawflow(id, Vue, internalInstance.appContext.app._context);
            editor.value.start();

            editor.value.registerNode("GeneratePdf", GeneratePdf, {}, {});
            editor.value.registerNode("ImportCsv", ImportCsv, {}, {});
            editor.value.registerNode("file-input", NodeFileInput, {}, {});
            editor.value.registerNode("start", NodeStart, {}, {});
            editor.value.registerNode("end", NodeEnd, {}, {});
            editor.value.registerNode("generatepdf", NodeGeneratePdf, {}, {});  
         });
        function cleanEditor() {
            editor.value.clear();
        }
        async function createNewFlow() {
            const newFlowButton = document.querySelector('#new-flow-button');
            const programNameInput = document.querySelector('input#program-name');
            const inputp = document.querySelector('input#prog-name');
            const btn = document.querySelector('button#btnn');
            const divv = document.querySelector('div#ring');

            newFlowButton?.addEventListener('click', () => {
                selectedOption.value = null;
                (inputp as HTMLSelectElement).style.display = 'none';
                (divv as HTMLSelectElement).style.display = 'none';
                (btn as HTMLSelectElement).style.display = 'none';
                (programNameInput as HTMLSelectElement).style.display = 'block';
                (programNameInput as HTMLSelectElement).value = "";
                cleanEditor();
            });
        }
        function showinput() {
            test.value = true;
            const input = document.querySelector('input#program-name');
            const Button = document.querySelector('#btnn');
            Button?.addEventListener('click', () => {
                (input as HTMLSelectElement).style.display = 'block';
            });
        }
        return {
            showinput,
            onchangeSelect,
            selectedOption,
            programs,
            delprograme,
            createNewFlow,
            loadJsonFiles,
            nodesList,
            drag,
            drop,
            searchStart,
            allowDrop,
            cleanEditor,
            addProgramName,
            insertJSONFile,
            notify,

        };
    }
}
</script>

<style scoped>
.node {
    @apply bg-sky-700 border border-collapse text-white p-3 rounded w-full cursor-pointer sm:text-sm flex hover:bg-sky-400 hover:border hover:border-gray-800;
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