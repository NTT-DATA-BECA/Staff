<template>
    <div className="h-full w-full flex flex-col p-4">
        <div className="flex justify-end mb-3 text-gray-100">
            <input className="input mr-2" placeholder="Add program name"
                @input="addProgramName($event)" v-model="nodeProgramName" />
            <button className="btn bg-green-500 hover:bg-green-400 mr-3 w-28"
                @click="insertJSONFile(nodeProgramName); nodeProgramName = ''">
                Save
            </button>
            <select className="btn bg-blue-400 hover:bg-blue-300 mr-3 w-28" @click="getData()"
                @change="valueSelected($event)">
                <option value="Select" className="text-center">Choose</option>
                <option v-for="j in store.getters.programOptions" :key="j.id" :value="j.id">{{ `${j.programName}#${j.uid}`
                }}
                </option>
            </select>
            <button className="btn bg-red-400 hover:bg-red-300 w-28 "
                @click="cleanEditor(); getData()">Delete</button>
        </div>

        <div class="flex flex-row w-full h-full">
            <div className="flex flex-col gap-2 w-[200px] mx-auto mr-3">
                <div class="nodes-list" draggable="true" v-for="i in nodesList" :key="i.name" :node-item="i.item"
                    @dragstart="drag($event)">
                    <span class="node">{{ i.name }}</span>
                </div>

            </div>
            <!-- <div>
                <div id="json-files">

                </div>
            </div> -->
            <div className="drawflow-container border border-slate-400 rounded w-full h-full relative">
                <div id="drawflow" @drop="drop($event)" @dragover="allowDrop($event)"></div>
                <button
                    className="btn absolute w-20 text-white bg-blue-400 m-2 right-0 top-0 hover:bg-blue-300"
                    @click="cleanEditor()">Clear</button>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { useStore } from 'vuex'
import { h, getCurrentInstance, render, onMounted, shallowRef } from 'vue'
import Drawflow from 'drawflow'
import NodeNumber from '../components/Node-number.vue'
import NodeOperation from '../components/Node-operation.vue'
import NodeAssign from '../components/Node-assign.vue'
import NodeIf from '../components/Node-if.vue'
import NodeCondition from '../components/Node-condition.vue'
import NodeFor from '../components/Node-for.vue'
import { javascriptToPython } from '../utils/javascriptToPython'
import { javascriptToJava } from '../utils/javascriptToJava'
import { javascriptToCplus } from '../utils/javascriptToCplus'
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
    },
    data() {
        return {
            nodeProgramName: "",
        };
    },

    setup() {
        const store = useStore();
        const optionSelected = shallowRef(0);
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

        const valueSelected = (event: any) => {
            optionSelected.value = event.target.value;
            store.commit("setProgramUid", store.getters.programOptions[optionSelected.value].uid);
            showSelected();
        };

        const addProgramName = (event: any) => {
            programName.value = event.target.value;
        };

        // Fonction pour ajouter un nouvel éditeur JSON
        async function createNewEditor(): Promise<void> {
            const name = prompt('Enter a name for the new editor:');
            if (!name) {
                return;
            }

            // Créer un nouvel éditeur JSON vide avec le nom spécifié
            const drawflowContainer = document.getElementById('drawflow');
            const nodeList = document.getElementById('node-list');
            const edgeList = document.getElementById('edge-list');

            if (!drawflowContainer || !nodeList || !edgeList) {
                console.error('Could not create new editor - missing HTML element(s)');
                return;
            }

            const editor = new Drawflow(drawflowContainer, nodeList, edgeList);

            // Enregistrer le nouveau fichier JSON vide dans la base de données
            //const jsonString = JSON.stringify(editor.export());
            //const result = await ipcRenderer.invoke('insertJsonFile', { name: name, data: jsonString });

            // Mettre à jour la liste des fichiers JSON
            //await updateJsonFiles();
        }


        // Fonction pour récupérer les fichiers JSON existants dans la base de données et générer des boutons pour chaque fichier
        async function loadJsonFiles() {
            // Récupérer les fichiers JSON existants dans la base de données
            const response = await ipcRenderer.invoke('getJsonFiles');
            const jsonFiles = response.map(file => file);

            // Générer des boutons pour chaque fichier JSON avec le nom correspondant
            const jsonFilesContainer = document.getElementById('json-files');
            jsonFiles.forEach(file => {
                const button = document.createElement('button');
                button.innerHTML = file;
                button.style.color = 'black';
                button.style.margin = '5px';

                button.addEventListener('click', async () => {
                    // Récupérer le contenu JSON correspondant dans la base de données
                    const response = await ipcRenderer.invoke('getJsonFile', { name: file });
                    const jsonData = JSON.parse(response);
                    console.log("filename:" + file);
                    console.log("jsonData Home:", JSON.parse(response).drawflow.Home.data);
                    const dataa = JSON.parse(response).drawflow.Home.data;
                    const ob = {
                        drawflow: {
                            Home: {
                                data: dataa
                            }
                        }
                    };
                    // Afficher le contenu JSON dans l'éditeur
                    const exportdata = editor.value.export();
                    editor.value.import(ob);

                });
                jsonFilesContainer?.appendChild(button);
                jsonFilesContainer?.insertAdjacentHTML('beforeend', '<br>');
            });
        }



        async function insertJSONFile(nodeProgramName: string) {
            if (nodeProgramName.length === 0) {
                return alert('Name your program');
            }

            const editorState = editor.value.export();
            const jsonString = JSON.stringify(editorState);

            // Call insertJSONFile() to save the JSON file to the database
            const result = await ipcRenderer.invoke('insertJsonFile', { name: nodeProgramName, data: jsonString });

            if (result.error) {
                alert('An error occurred while saving the program: ' + result.error);
            } else {
                // Download the JSON data as a file
                const blob = new Blob([jsonString], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = nodeProgramName + '.json';
                link.click();
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
                    if (nodeData.inputs.input_1.connections.length > 0) {
                        javascriptToPython(variableName, editor.value.export(), num1, num2);
                        javascriptToJava(variableName, editor.value.export(), num1, num2);
                        javascriptToCplus(variableName, editor.value.export(), num1, num2);
                    }
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

                        javascriptToPython(variableName, editor.value.export(), num1, num2);
                        javascriptToJava(variableName, editor.value.export(), num1, num2);
                        javascriptToCplus(variableName, editor.value.export(), num1, num2);
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

                javascriptToPython(variableName, editor.value.export(), num1, num2);
                javascriptToJava(variableName, editor.value.export(), num1, num2);
                javascriptToCplus(variableName, editor.value.export(), num1, num2);
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
                javascriptToPython(variableName, editor.value.export(), num1, num2);
                javascriptToJava(variableName, editor.value.export(), num1, num2);
                javascriptToCplus(variableName, editor.value.export(), num1, num2);
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
                    javascriptToPython(variableName, editor.value.export(), num1, num2);
                    javascriptToJava(variableName, editor.value.export(), num1, num2);
                    javascriptToCplus(variableName, editor.value.export(), num1, num2);
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

        function editorData() {
            const exportdata = editor.value.export();
            const nodes = exportdata.drawflow.Home.data;
            let nodesData: any = [];
            Object.keys(nodes).forEach(function (i) {
                nodesData.push(nodes[i]);
            });
            return { programName: programName.value, nodesData };
        }

        const setData = async () => {

        }
        const getData = async () => {

        }

        function showSelected() {
            const validate = store.getters.jsImport;
            if (!!validate === true) {
                const jsonOption = validate.get[optionSelected.value].nodesData;
                const arrayOfNodesNew: any = [];
                jsonOption.forEach((value: any) => {
                    let newData;
                    if (!value.inputs) {
                        newData = {
                            ...value,
                            inputs: {}
                        };
                    }
                    else if (!value.outputs) {
                        newData = {
                            ...value,
                            outputs: {}
                        };
                    }
                    else if (!value.data) {
                        newData = {
                            ...value,
                            data: {}
                        };
                    }
                    else {
                        newData = {
                            ...value
                        };
                    }
                    arrayOfNodesNew.push(newData);
                });
                let newObject: any = {};
                arrayOfNodesNew.forEach((element: any, index: any) => {
                    let id = arrayOfNodesNew[index].id;
                    newObject[id] = arrayOfNodesNew[index];
                });

                const ob = {
                    drawflow: {
                        Home: {
                            data: newObject
                        }
                    }
                };
                editor.value.import(ob);
            }
        }

        function cleanEditor() {
            editor.value.clear();
            store.commit("setJsToPython", "");
            store.commit("setJsToPythonPrint", "");
            store.commit("setJsToPythonBucle", []);
            store.commit("setJsToJava", "");
            store.commit("setJsToJavaPrintln", "");
            store.commit("setJsToCplus", "");
            store.commit("setJsToCplusCout", "");
        }

        return {
            createNewEditor,
            loadJsonFiles,
            nodesList,
            drag,
            drop,
            allowDrop,
            valueSelected,
            cleanEditor,
            getData,
            store,
            addProgramName,
            editorData,
            insertJSONFile
        };
    }
}
</script>

<style scoped>
.node {
    @apply block bg-sky-600 hover:bg-sky-400 text-white p-4 rounded w-full cursor-pointer sm:text-sm; 
}

.flow {
    margin-top: 15px;
    margin-bottom: 15px;
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