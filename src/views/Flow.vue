<template>
    <div className="h-full w-full flex flex-col p-4">
        <div className="flex justify-end mb-3 text-gray-100">   
            <input id="program-name" className="input mr-2" placeholder="Add program name"
                @input="addProgramName($event)" v-model="nodeProgramName"  />
                <button id="new-flow-button" className="btn bg-amber-600 hover:bg-amber-400 mr-3 w-28"
                @click="createNewFlow()">
                New Flow
               </button> 
            <button className="btn bg-green-500 hover:bg-green-400 mr-3 w-28"
                @click="insertJSONFile(nodeProgramName,test); nodeProgramName = ''">
                Save
            </button>        
            <select id="json-select" className="btn bg-blue-400 hover:bg-blue-300 mr-3 w-28">
            <option value="Choose a flow">Choose</option>
            </select>
            <button className="btn bg-red-400 hover:bg-red-300 w-28 "
                @click="delprograme()">Delete</button>
        </div>
        <div class="flex flex-row w-full h-full">
            <div className="flex flex-col gap-2 w-[200px] mx-auto mr-3">
                <h4 className="border-b-4 p-2 text-center font-bold text-slate-500">Node Types</h4>
                <div class="nodes-list" draggable="true" v-for="i in nodesList" :key="i.name" :node-item="i.item"
                    @dragstart="drag($event)">
                    <span class="node"><img className="m-1" src="../assets/add-music-collection-svgrepo-com.svg" style="width: 20px; height: 20px;" alt="" srcset=""> {{ i.name }}</span>
                </div>
            </div>
            <div class="drawflow-container border border-slate-400 rounded w-full h-full relative">
            <div id="drawflow" @drop="drop($event)" @dragover="allowDrop($event)">
                <div class="ml-0 mr-auto mb-4 h-7 flex"> 
                <button id="btnn"  @click="showinput()" class="pl-2 bg-gray-400 "> <img class="transform hover:-rotate-12" style="width: 50px; height: 25px;" src="../assets/editb.png" alt=""> </button>
                <input id="prog-name" class="w-28 inline-block rounded-r-xl bg-gray-400 py-1 text-sm font-semibold text-slate-100 mr-2 text-center" type="text" readonly>
                </div> 
            </div>
            <a className="absolute w-10 m-2 right-0 top-0" @click="cleanEditor()" title="Press to clear">
            <img src="../assets/erase-svgrepo-com.svg" style="width: 30px; height: 30px;">
            </a>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { h, getCurrentInstance, render, onMounted, shallowRef } from 'vue'
import Drawflow from 'drawflow'
import NodeNumber from '../components/Node-number.vue'
import NodeOperation from '../components/Node-operation.vue'
import NodeAssign from '../components/Node-assign.vue'
import NodeIf from '../components/Node-if.vue'
import NodeCondition from '../components/Node-condition.vue'
import NodeFor from '../components/Node-for.vue'
import { validationIf } from '../utils/validationIf'
import { validationFor } from '../utils/validationFor'
import { operationValues } from '../utils/operationValues'
import { nodesList } from '../utils/nodesList'
import { ipcRenderer } from 'electron';

export default {
    name: "DrawflowDashboard",
    inject: ['ipcRenderer'],
    async mounted() {
        await this.loadJsonFiles();
        const inputp = document.querySelector('input#prog-name');
        (inputp as HTMLSelectElement).style.display = 'none';
        const btn = document.querySelector('button#btnn');
        (btn as HTMLSelectElement).style.display = 'none';
    }, methods:{
            showinput(){
                this.test=true;
            const input = document.querySelector('input#program-name');
            const Button = document.querySelector('#btnn');
              Button?.addEventListener('click', () => {
            (input as HTMLSelectElement).style.display = 'block';
            });
        }
    },
    data() {
        return {      
            nodeProgramName: "",
            test:false,
            iconColor:'red',
        };
    },
    setup() {
        const programName = shallowRef("");
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
        // Fonction pour récupérer les fichiers JSON existants dans la base de données et générer des boutons pour chaque fichier
        async function loadJsonFiles() {
        // Récupérer les fichiers JSON existants dans la base de données
        const response = await ipcRenderer.invoke('getJsonFiles');
        const jsonFiles = response.map(file => file);
        // Récupérer le select existant
        const select = document.querySelector('select#json-select');
        const inputp = document.querySelector('input#prog-name');
        const btn = document.querySelector('button#btnn');
        // Ajouter une option pour chaque fichier JSON
        jsonFiles.forEach(file => {
            const option = document.createElement('option');
            option.value = file;
            option.text = file;
            select?.appendChild(option);
        });
        // Ajouter un événement de changement au select
        select?.addEventListener('change', async () => { 
           // (input as HTMLSelectElement).disabled = true;
        const selectedFile = (select as HTMLSelectElement).value;
              // Récupérer l'input pour le nom du programme
         const programNameInput = document.querySelector('input[placeholder="Add program name"]');
           // Mettre à jour la valeur de l'input avec le nom du programme sélectionné
          (programNameInput as HTMLSelectElement).value= selectedFile;
          (programNameInput as HTMLSelectElement).style.display = 'none';
          (inputp as HTMLSelectElement).style.display = 'block';
          (btn as HTMLSelectElement).style.display = 'block';
            (inputp as HTMLSelectElement).value= selectedFile;
            // Récupérer le contenu JSON correspondant dans la base de données
            const response = await ipcRenderer.invoke('getJsonFile', { name: selectedFile });
            const jsonData = JSON.parse(response);
            // Exécuter le code approprié pour le fichier JSON sélectionné
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
                } else {
                console.log('Invalid JSON data format');
                }
        });
   }
    
   async function insertJSONFile(nodeProgramName: string,test:boolean) {
    const inputp = document.querySelector('input#prog-name');
    const editorState = editor.value.export();
    const jsonString = JSON.stringify(editorState);
 if((inputp as HTMLSelectElement).value && test===false){
        const namen=(inputp as HTMLSelectElement).value
        const result = await ipcRenderer.invoke('updateJsonFile', { name: namen, data: jsonString });
    }
    else if((inputp as HTMLSelectElement).value && test===true) {
        const namen=(inputp as HTMLSelectElement).value
        const result = await ipcRenderer.invoke('updateJsonFileName', { oldName:namen , newName: nodeProgramName });
       
    } else {
        if (nodeProgramName.length === 0) {
        return alert('Name your program');
    }
    const result = await ipcRenderer.invoke('insertJsonFile', { name: nodeProgramName, data: jsonString });
   
    }

}
      async function delprograme(){
            const inputp = document.querySelector('input#prog-name');
            const namp=(inputp as HTMLSelectElement).value;
            const result = await ipcRenderer.invoke('deleteJsonFile', { name:namp });
             if (result.error) {
        alert('An error occurred while deleting the program: ' + result.error);
        }
        }
        onMounted(() => {
            var elements = document.getElementsByClassName('nodes-list');
            for (var i = 0; i < elements.length; i++) {
                elements[i].addEventListener('touchend', drop, false);
                elements[i].addEventListener('touchmove', touchScreenPosition, false);
                elements[i].addEventListener('touchstart', drag, false);
            }
            const id: HTMLElement = document.getElementById("drawflow") || document.createElement('div');
            editor.value = new Drawflow(id, Vue, internalInstance.appContext.app._context);
            editor.value.start();

            editor.value.registerNode("number", NodeNumber, {}, {});
            editor.value.registerNode("addition", NodeOperation, { title: "Addition" }, {});
            editor.value.registerNode("subtraction", NodeOperation, { title: "Subtraction" }, {});
            editor.value.registerNode("multiplication", NodeOperation, { title: "Multiplication" }, {});
            editor.value.registerNode("division", NodeOperation, { title: "Division" }, {});
            editor.value.registerNode("assign", NodeAssign, {}, {});
            editor.value.registerNode("if", NodeIf, { title: "If statement" }, {});
            editor.value.registerNode("for", NodeFor, { title: "For statement" }, {});
            editor.value.registerNode("nodeCondition", NodeCondition, {}, {});

            let num1 = 0;
            let num2 = 0;
            let result = 0;
            editor.value.on("nodeDataChanged", (data: any) => {
                const nodeData = editor.value.getNodeFromId(data);
                let variableName = "";
                if (nodeData.name === "assign") {
                    variableName = nodeData.data.variable;
                    
                }
                else {
                    const outputNode = nodeData.outputs.output_1.connections;
                    if (outputNode.length > 0) {
                        const outputNumber = parseFloat(nodeData.data.number);
                        const output_class = nodeData.outputs.output_1.connections[0].output;
                        const inputNodeId = nodeData.outputs.output_1.connections[0].node;
                        const inputNodeData = editor.value.getNodeFromId(inputNodeId);
                        const inputNodeName = inputNodeData.name;

                        if (inputNodeName !== "nodeCondition") {
                            updateNodeOperation(output_class, outputNumber, inputNodeName, inputNodeData)

                            if (inputNodeData.outputs.output_1.connections.length > 0) {
                                const nodeAssignId = inputNodeData.outputs.output_1.connections[0].node;
                                updateNodeAssign(nodeAssignId, editor.value.getNodeFromId(nodeAssignId).data, result)
                            }
                        }
                        updateNodeCondition(nodeData, inputNodeData, nodeData.name);

                       
                    }
                }
            });
            editor.value.on("connectionCreated", (data: any) => {
                const outputData = editor.value.getNodeFromId(data.output_id);
                const outputNumber = parseFloat(outputData.data.number);
                const output_class = data.input_class;
                const inputNodeData = editor.value.getNodeFromId(data.input_id);
                const inputNodeName = inputNodeData.name;
                const conditionName = outputData.name;
                let variableName = "";

                if (inputNodeName !== "assign" && inputNodeName !== "nodeCondition") {
                    updateNodeOperation(output_class, outputNumber, inputNodeName, inputNodeData)

                    if (inputNodeData.outputs.output_1.connections.length > 0) {
                        const nodeAssignId = inputNodeData.outputs.output_1.connections[0].node;
                        updateNodeAssign(nodeAssignId, editor.value.getNodeFromId(nodeAssignId).data, result)
                    }
                }
                else {
                    variableName = inputNodeData.data.variable;
                    updateNodeAssign(inputNodeData.id, inputNodeData.data, result)
                }
                updateNodeCondition(outputData, inputNodeData, conditionName);

            });
            editor.value.on("import", () => {
                const editorData = editor.value.export().drawflow.Home.data;
                let variableName = "";
                Object.keys(editorData).forEach(function (i) {
                    if (editorData[i].name === "assign") {
                        variableName = editorData[i].data.variable;
                    }
                    if (editorData[i].name === "number") {
                        if (editorData[i].outputs.output_1.connections[0].output === "input_1") {
                            num1 = parseFloat(editorData[i].data.number);
                        }
                        if (editorData[i].outputs.output_1.connections[0].output === "input_2") {
                            num2 = parseFloat(editorData[i].data.number);
                        }
                    }
                });
              
            });
            editor.value.on("nodeRemoved", () => {
                const editorData = editor.value.export().drawflow.Home.data;
                let variableName = "";
                let result: any = "";
                Object.keys(editorData).forEach(function (i) {
                    if (editorData[i].name === "addition" || editorData[i].name === "subtraction" || editorData[i].name === "division" || editorData[i].name === "multiplication") {
                        result = operationValues(num1, num2, editorData[i].name, editorData[i]);
                        const input_id = editorData[i].id;
                        editor.value.updateNodeDataFromId(input_id, { result });
                    }
                    if (editorData[i].name === "assign") {
                        variableName = editorData[i].data.variable;
                        editor.value.updateNodeDataFromId(editorData[i].id, { ...editorData[i].data, assign: result });
                    }
                   
                });
            });
            const updateNodeOperation = (output_class: any, outputNumber: any, inputNodeName: any, inputNodeData: any) => {
                if (output_class == "input_1") {
                    num1 = outputNumber;
                }
                else if (output_class === "input_2") {
                    num2 = outputNumber;
                }
                result = operationValues(num1, num2, inputNodeName, inputNodeData);
                const input_id = inputNodeData.id;
                editor.value.updateNodeDataFromId(input_id, { result: result });
            }
            const updateNodeAssign = (nodeId: any, nodeData: any, result: any) => {
                editor.value.updateNodeDataFromId(nodeId, { ...nodeData, assign: result });
            }
            const updateNodeCondition = (outputData: any, inputNodeData: any, conditionName: any) => {
                if (conditionName === "if") {
                    const conditionResult = validationIf(parseFloat(outputData.data.num1), parseFloat(outputData.data.num2), outputData.data.option);
                    const input_id = inputNodeData.id;
                    editor.value.updateNodeDataFromId(input_id, { conditionResult });
                }
                else if (conditionName === "for") {
                    const conditionResult = validationFor(parseFloat(outputData.data.num1), parseFloat(outputData.data.num2));
                    const input_id = inputNodeData.id;
                    editor.value.updateNodeDataFromId(input_id, { conditionResult });
                }
            }
        });
        function cleanEditor() {
            editor.value.clear();
        }
        function createNewFlow () {
            const newFlowButton = document.querySelector('#new-flow-button');
            const programNameInput = document.querySelector('input#program-name');
            const inputp = document.querySelector('input#prog-name');
            const btn = document.querySelector('button#btnn');
            newFlowButton?.addEventListener('click', () => {
                (inputp as HTMLSelectElement).style.display = 'none';
                (btn as HTMLSelectElement).style.display = 'none';
                (programNameInput as HTMLSelectElement).style.display = 'block';
                (programNameInput as HTMLSelectElement).disabled = false;
                (programNameInput as HTMLSelectElement).value="";
                cleanEditor();
            });
        }
        return {
            delprograme,
            createNewFlow,
            loadJsonFiles,
            nodesList,
            drag,
            drop,
            allowDrop,
            cleanEditor,
            addProgramName,
            insertJSONFile
        };
    }
}
</script>

<style scoped>
.node {
    @apply bg-sky-600 border border-collapse hover:bg-sky-400 text-white p-3 rounded w-full cursor-pointer sm:text-sm flex; 
    background-image: linear-gradient(to bottom, #2f6690, #3a7ca5);
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