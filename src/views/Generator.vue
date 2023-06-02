<template>
    <div className="h-full w-full flex flex-col p-4">
        <div class="flex items-center flex-end mb-2">
            <v-select v-model="selectedOption" label="name" class="h-9 text-primary-dark rounded w-60 mr-3"
                @click="() => loadJsonFiles()" :options="programs" @option:selected="onChangeFile()"></v-select>
            <button class="btn" @click="() => generateFlow()">Generate</button>
            <input id="program-name" className="hidden input mr-2" placeholder="Add program name"
                @input="addProgramName($event)" v-model="nodeProgramName" />
        </div>
        <div class="w-full h-full">
            <div class="drawflow-container border border-slate-400 rounded w-full h-full relative">
                <div id="drawflow">
                    <div>
                        <div v-if="action != 'add'" class="flex bg-primary-light w-fit text-white p-2 justify-center"
                            style="border-bottom-right-radius: 7px;">
                            <pre class="mr-1 my-0 p-0 flex items-center">{{ flowName }}</pre>

                        </div>
                    </div>
                </div>
                <a className="absolute m-2 right-0 top-0 cursor-pointer text-primary-dark hover:text-primary-light"
                    @click=" cleanEditor()" title="Press to clear">
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
import Swal from 'sweetalert2'
import { SweetAlertIcon } from 'sweetalert2'
import ImportExcel from '../components/ImportExcel.vue'
import NodeFileInput from '../components/Node-file-input.vue'
import NodeStart from '../components/Node-start.vue'
import NodeEnd from '../components/Node-end.vue'
import Condition from '../components/Node-Condition.vue'
import NodeGeneratePdf from '../components/Node-GeneratePdf.vue'
import NodeZipFolder from '../components/Node-zipFolder.vue'
import sendEmail from '../components/Node-sendEmail.vue'
import groupPdfBy from '../components/Node-groupPdfBy.vue'
import { nodesList } from '../utils/nodesList'
import { ipcRenderer } from 'electron';
import quillCSS from 'quill/dist/quill.snow.css'
import 'vue3-toastify/dist/index.css';
import { mapActions } from 'vuex';

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
            programs: [] as any,
            editor: [] as any,
            node_select: '',
            node_last_move: null as any,
            nodesList: nodesList,
            dynamicConditionJson: {},
            groups:[] as any,
        };
    },
    mounted() {
        const internalInstance: any = getCurrentInstance();
        internalInstance.appContext.app._context.config.globalProperties.$df = this.editor;
        const id: HTMLElement = document.getElementById("drawflow") || document.createElement('div');
        this.editor.value = new Drawflow(id, { version: 3, h, render }, internalInstance.appContext.app._context);
        this.editor.value.start();

        this.editor.value.registerNode("ImportExcel", ImportExcel, {}, {});
        this.editor.value.registerNode("file-input", NodeFileInput, {}, {});
        this.editor.value.registerNode("start", NodeStart, {}, {});
        this.editor.value.registerNode("end", NodeEnd, {}, {});
        this.editor.value.registerNode("Generatepdf", NodeGeneratePdf, {}, {});
        this.editor.value.registerNode("condition", Condition, {}, {});
        this.editor.value.registerNode("groupPdfBy", groupPdfBy, {}, {});
        this.editor.value.registerNode("send-email", sendEmail, {}, {});
        this.editor.value.registerNode("zip-folder", NodeZipFolder, {}, {});
    },
    methods: {
        ...mapActions(['setHeaders', 'setExcelData']),
        touchScreenPosition(ev: any) {
            this.node_last_move = ev;
        }
        ,
        addNodeToDrawFlow(name: any, pos_x: any, pos_y: any) {
            pos_x = pos_x * (this.editor.value.precanvas.clientWidth / (this.editor.value.precanvas.clientWidth * this.editor.value.zoom)) - (this.editor.value.precanvas.getBoundingClientRect().x
                * (this.editor.value.precanvas.clientWidth / (this.editor.value.precanvas.clientWidth * this.editor.value.zoom)));
            pos_y = pos_y * (this.editor.value.precanvas.clientHeight / (this.editor.value.precanvas.clientHeight * this.editor.value.zoom)) - (this.editor.value.precanvas.getBoundingClientRect().y
                * (this.editor.value.precanvas.clientHeight / (this.editor.value.precanvas.clientHeight * this.editor.value.zoom)));
            const nodeSelected: any = nodesList.find(object => object.item === name);
            this.editor.value.addNode(name, nodeSelected.input, nodeSelected.output, pos_x, pos_y, name, { mytemplate: "", excelName: "", headers: [], excelData: "", symbole: "", pdfpath: "", myzip: "", varaible1: "", varaible2: "" }, name, "vue");
        },
        addProgramName(event: any) {
            this.programName = event.target.value;
        },
        async loadJsonFiles() {
            const response = await ipcRenderer.invoke('getJsonFiles');
            this.programs = response;
        },
        async onChangeFile() {
            const selectedFile = this.selectedOption;
            this.action = "edit"
            this.flowName = selectedFile;
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
                    headNames = nodeExcelData.data.headers;
                    this.setHeaders(headNames);
                }
            }
        },
        cleanEditor() {
            this.editor.value.clear();
        },
        async generateFlow() {
            var idNode = parseFloat(this.getStartId());
            this.searchNodeEnd();
            if (idNode) {
                var dataNode = this.editor.value.getNodeFromId(idNode)
                var dataNodeStart = this.editor.value.getNodeFromId(idNode)
                var nameNode = dataNode.name;
                var startoutputs = 0;
                var dataExcel = [];
                var templateName = "";
                var genebasic = "yes";
                var pdfPathGrpBy = "";
                while (dataNodeStart.outputs?.output_1?.connections[startoutputs]) {
                    dataNode = this.MoveToNextNodeByOutput1(dataNode)
                    nameNode = dataNode.name;
                    startoutputs = startoutputs + 1;
                    while (nameNode != "end") {
                        if (nameNode == "ImportExcel") {
                            var genebasic = "no";
                            dataExcel = dataNode.data.excelData;
                            await this.generateNodeExcel(dataNode, dataExcel);
                        }
                        if (nameNode == "file-input") {
                            templateName = dataNode.data.mytemplate;
                        }
                        if (nameNode == "Generatepdf" || nameNode == "groupPdfBy") {
                            if (JSON.stringify(this.dynamicConditionJson) != "{}") {
                                for (var i = 0; i < dataExcel.length; i++) {
                                    var dataemployee = dataExcel[i];
                                    if (nameNode == "groupPdfBy") {
                                        pdfPathGrpBy=dataNode.data.pdfpath;
                                        this.groups.push(dataemployee[dataNode.data.variable1]);
                                        await this.generateNodePdf(dataNode, this.dynamicConditionJson, dataemployee, dataNode.data.variable1);
                                    } else {
                                        await this.generateNodePdf(dataNode, this.dynamicConditionJson, dataemployee, null);
                                    }
                                }
                            }
                            else if (dataExcel) {
                                for (var i = 0; i < dataExcel.length; i++) {
                                    var dataemployee = dataExcel[i];
                                    if (nameNode == "groupPdfBy") {
                                        await this.startgenerationpdf(dataNode, dataemployee, dataNode.data.variable1, templateName);
                                    }
                                    else {
                                        await this.startgenerationpdf(dataNode, dataemployee, null, templateName);
                                    }
                                }
                            }
                            if (genebasic == "yes") {
                                await this.startgenerationpdf(dataNode, null, null, templateName);
                            }

                        }
                        if (nameNode == "zip-folder") {
                           if(pdfPathGrpBy){
                            for(var i=0;i<this.groups.length;i++){ 
                                console.log(pdfPathGrpBy+"/"+this.groups[i])
                                await this.zipFolder(pdfPathGrpBy+"/"+this.groups[i]);
                            }
                           }
                        }
                        dataNode = this.MoveToNextNodeByOutput1(dataNode);
                        nameNode = dataNode.name;
                        if (nameNode == "end") {
                            this.showSucess();
                        }
                    }
                }
            }

        },
        async generateNodeExcel(dataNodeFlow: any, dataExcel: any) {
            dataExcel = dataNodeFlow.data.excelData;
            var dataNode = this.MoveToNextNodeByOutput1(dataNodeFlow);
            var nameNode = dataNode.name;
            if (nameNode == "condition") {
                nameNode = await this.generateNodeCondition(dataNode);
            }
            return nameNode;
        },
        async generateNodeCondition(dataNode: any) {
            var pointer = require('json-pointer');
            pointer.set(this.dynamicConditionJson, '/label', dataNode.data.variable1);
            pointer.set(this.dynamicConditionJson, '/symbole', dataNode.data.symbole);
            pointer.set(this.dynamicConditionJson, '/number', dataNode.data.variable2);
            var dataOutput1 = this.MoveToNextNodeByOutput1(dataNode);
            var dataOutput2 = this.MoveToNextNodeByOutput2(dataNode);
            pointer.set(this.dynamicConditionJson, '/accept', (dataOutput1.name === "condition") ? dataOutput1.id : dataOutput1?.data.mytemplate);
            pointer.set(this.dynamicConditionJson, '/refuse', (dataOutput2.name === "condition") ? dataOutput2.id : dataOutput2?.data.mytemplate);
            if (dataOutput1.name === "condition") {
                this.fillJSONCondition('/accept', dataOutput1);
            }
            if (dataOutput2.name === "condition") {
                this.fillJSONCondition('/refuse', dataOutput2);
            }

        },
        fillJSONCondition(direction: any, dataNode: any) {
            var pointer = require('json-pointer');
            var dataOutput1 = this.MoveToNextNodeByOutput1(dataNode);
            var dataOutput2 = this.MoveToNextNodeByOutput2(dataNode);
            var NextNodeByOutput1 = this.MoveToNextNodeByOutput1(dataOutput1);
            var NextNodeByOutput2 = this.MoveToNextNodeByOutput2(dataOutput2);
            pointer.set(this.dynamicConditionJson, direction, {});
            pointer.set(this.dynamicConditionJson, direction + '/label', dataNode.data.variable1);
            pointer.set(this.dynamicConditionJson, direction + '/symbole', dataNode.data.symbole);
            pointer.set(this.dynamicConditionJson, direction + '/number', dataNode.data.variable2);
            pointer.set(this.dynamicConditionJson, direction + '/accept', (dataOutput1.name === "condition") ? dataOutput1.id : dataOutput1?.data.mytemplate);
            pointer.set(this.dynamicConditionJson, direction + '/refuse', (dataOutput2.name === "condition") ? dataOutput2.id : dataOutput2?.data.mytemplate);
            if (dataOutput1.name === "condition" && NextNodeByOutput1.name != "end") {
                this.fillJSONCondition(direction + '/accept', dataOutput1);
            }
            if (dataOutput2.name === "condition" && NextNodeByOutput2.name != "end") {
                this.fillJSONCondition(direction + '/refuse', dataOutput2);

            }
        },
        async generateNodePdf(dataNode: any, conditions: any, dataemployee: any, group: any) {
            var headerCondition = conditions.label;
            var symbole = conditions.symbole;
            var number = conditions.number;
            var value = parseFloat(dataemployee[headerCondition]);
            if (isNaN(value)) {
                value = 0
            }
            if (this.compare(symbole, value, parseFloat(number))) {
                if (typeof conditions.accept === 'object' && conditions.accept) {
                    conditions = conditions.accept;
                    await this.generateNodePdf(dataNode, conditions, dataemployee, group);
                }
                else if (conditions.accept) {
                    await this.startgenerationpdf(dataNode, dataemployee, group, conditions.accept);
                }
            }
            else {
                if (typeof conditions.refuse === 'object' && conditions.refuse) {
                    conditions = conditions.refuse;
                    await this.generateNodePdf(dataNode, conditions, dataemployee, group);
                }
                else if (conditions.refuse) {
                    this.startgenerationpdf(dataNode, dataemployee, group, conditions.refuse);
                }
            }
        },
        async startgenerationpdf(dataNode: any, dataemployee: any, group: any, template: any) {
            const currentDate = new Date();
            const currentYear = currentDate.getFullYear();
            const currentDateStr = currentDate.toISOString().split('T')[0];
            var response = await ipcRenderer.invoke('getQuillContentData', { name: template });
            if (response) {
                if (dataemployee) {
                    var replacedResponse = this.replaceVariables(response, dataemployee);
                    if (dataemployee) {
                        response = replacedResponse;
                        response = response.replace(/{Name}/g, dataemployee.Name);
                        response = response.replace(/{DOC_YEAR}/g, "" + currentYear);
                        response = response.replace(/{DOC_DATE}/g, currentDateStr);
                        if (group) {
                            this.downloadPdf(response, dataemployee.LastName + dataemployee.FirstName + "-" + dataemployee.Year, dataNode.data.pdfpath + '/' + dataemployee[group] + '/')
                        } else {
                            this.downloadPdf(response, dataemployee.LastName + dataemployee.FirstName + "-" + dataemployee.Year, dataNode.data.pdfpath + '/')
                        }
                    }
                }
                else {
                    this.downloadPdf(response, template, dataNode.data.pdfpath + '/')
                }
            }
            else {
                this.modalMessage('Error!', 'Something wrong.', 'error')
            }
        },
        compare(operator: any, num1: number, num2: number): boolean {
            switch (operator.toLowerCase()) {
                case '>':
                    return num1 > num2;
                case '>=':
                    return num1 >= num2;
                case '<':
                    return num1 < num2;
                case '<=':
                    return num1 <= num2;
                case '=':
                    return num1 == num2;
                case '!=':
                    return num1 != num2;
                default:
                    throw new Error('Invalid comparison operator');
            }
        }

        ,
        MoveToNextNodeByOutput1(dataNode) {
            var idNode = parseFloat(dataNode.outputs?.output_1?.connections[0]?.node);
            if (idNode) {
                dataNode = this.editor.value.getNodeFromId(idNode);
            }
            return dataNode;
        },
        MoveToNextNodeByOutput2(dataNode) {
            var idNode = parseFloat(dataNode.outputs?.output_2?.connections[0]?.node);
            if (idNode) {
                dataNode = this.editor.value.getNodeFromId(idNode);
            }
            return dataNode;
        },
        replaceVariables(response, employee) {
            for (var prop in employee) {
                if (employee.hasOwnProperty(prop)) {
                    const variableName = `{${prop}}`;
                    const variableValue = employee[prop];
                    response = response.split(variableName).join(variableValue);
                }
            }
            return response;
        }
        ,
        searchNodeEnd() {
            const editorData = this.editor.value.export().drawflow.Home.data;
            let idEnd = "";
            Object.keys(editorData).forEach(function (i) {
                if (editorData[i].name === "end") {
                    idEnd = editorData[i].id;
                }
            });
            if (!idEnd) {
                this.modalMessage('Error!', 'To generate the flow, include at least one End node.', 'error')
            }
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
        getStartId() {
            const editorData = this.editor.value.export().drawflow.Home.data;
            let idStart = "";
            var numStart = 0;
            Object.keys(editorData).forEach(function (i) {
                if (editorData[i].name === "start") {
                    numStart++;
                    idStart = editorData[i].id;
                }
            });
            if (!idStart) {
                this.modalMessage('Error!', 'To generate the flow, include Start node.', 'error')
            }
            if (numStart > 1) {
                this.modalMessage('Error!', 'Include just one Start node.', 'error')
            }
            return idStart
        },
        async zipFolder(folderPath) {
            const archiver = require('archiver');
            const fs = require('fs');
            const path = require('path');
            const outputZip = fs.createWriteStream(folderPath + '.zip');
            const archive = archiver('zip', {
                zlib: { level: 9 } // Compression level
            });
            outputZip.on('close', function () {
                console.log(archive.pointer() + ' total bytes');
                console.log('Archiver has been finalized and the output file descriptor has closed.');
                const zipFileName = path.basename(folderPath) + '.zip';
                const zipFilePath = path.join(folderPath, zipFileName);
                const data = fs.readFileSync(zipFilePath);
                const blob = new Blob([data], { type: 'application/octet-stream' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = zipFileName;
                a.click();
                URL.revokeObjectURL(url);
                fs.unlinkSync(zipFilePath);

            });




            archive.on('error', function (err) {

                throw err;

            });




            archive.pipe(outputZip);

            archive.directory(folderPath, false);

            if (!fs.existsSync(folderPath)) {

                console.log('Folder does not exist:', folderPath);

                return;

            }




            archive.finalize();

        },
        async downloadPdf(htmlforpdf: any, namefile: any, path: any) {

            var name = namefile
            var html = '<html><head><style> footer{position: fixed;bottom: 0;}' + quillCSS + '</style></head><body><div class="ql-editor">' + htmlforpdf + ' <footer style="padding-top: 100px;"><div style="border-top: 2px solid gray;"><div style="font-size :15px; text-align:center; color:gray;margin-left:0px;margin-right:5px;"><p> NTT DATA Morocco Centers – SARL au capital de 7.700.000 Dhs – Parc Technologique de Tétouanshore, Route de Cabo Negro, Martil – Maroc – RC: 19687 – IF : 15294847 – CNSS : 4639532 – </br>Taxe Prof. :51840121</p></div></footer> </div></body></html>'
            var pdf = require('hm-html-pdf');
            var options = {
                format: 'A4',
                orientation: "portrait",
            };
            pdf.create(html, options).toFile(path + name + '.pdf', function (err, res) {
                if (err) return console.log(err);
            });
        },
        showSucess() {
            Swal.fire({
                toast: true,
                icon: 'success',
                title: 'Your flow has been successfully generated!',
                position: 'bottom-left',
                timer: 2000,
                showConfirmButton: false,
                timerProgressBar: true,
            })
        },
        modalMessage(title: string, type: string, message: SweetAlertIcon) {
            Swal.fire(
                title,
                type,
                message
            );
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