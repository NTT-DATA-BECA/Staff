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
import ImportCsv from '../components/ImportCsv.vue'
import NodeFileInput from '../components/Node-file-input.vue'
import NodeStart from '../components/Node-start.vue'
import NodeEnd from '../components/Node-end.vue'
import NodeGeneratePdf from '../components/Node-GeneratePdf.vue'
import sendEmail from '../components/Node-sendEmail.vue'
import { nodesList } from '../utils/nodesList'
import { ipcRenderer } from 'electron';
import quillCSS from 'quill/dist/quill.snow.css'
import 'vue3-toastify/dist/index.css';
import nodemailer from 'nodemailer';

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
            nodesList: nodesList
        };
    },
    mounted() {
        const internalInstance: any = getCurrentInstance();
        internalInstance.appContext.app._context.config.globalProperties.$df = this.editor;
        const id: HTMLElement = document.getElementById("drawflow") || document.createElement('div');
        this.editor.value = new Drawflow(id, { version: 3, h, render }, internalInstance.appContext.app._context);
        this.editor.value.start();

        this.editor.value.registerNode("ImportCsv", ImportCsv, {}, {});
        this.editor.value.registerNode("file-input", NodeFileInput, {}, {});
        this.editor.value.registerNode("start", NodeStart, {}, {});
        this.editor.value.registerNode("end", NodeEnd, {}, {});
        this.editor.value.registerNode("Generatepdf", NodeGeneratePdf, {}, {});
        this.editor.value.registerNode("send-email", sendEmail, {}, {});

    },
    methods: {
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
            this.editor.value.addNode(name, nodeSelected.input, nodeSelected.output, pos_x, pos_y, name, { mytemplate: "", csv: "" }, name, "vue");
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
                var namefile;
                while (dataNodeStart.outputs?.output_1?.connections[startoutputs]) {
                    console.log("entred");
                    idNode = parseFloat(dataNodeStart.outputs.output_1.connections[startoutputs].node)
                    dataNode = this.editor.value.getNodeFromId(idNode)
                    nameNode = dataNode.name;
                    startoutputs = startoutputs + 1;
                    console.log(" startoutputs++ " + startoutputs)
                    while (nameNode != "end") {
                        if (nameNode == "Generatepdf") {
                            const response = await ipcRenderer.invoke('getQuillContentData', { name: dataNode.data.mytemplate });
                            if (response) {
                                const pdfPath = await this.downloadPdf(response, dataNode.data.mytemplate);
                                this.sendEmailWithAttachment(pdfPath); // Send email with the generated PDF as attachment
                                this.showSucess();
                            }
                            else {
                                this.modalMessage('Error!', 'Something wrong.', 'error')
                            }
                        }
                        console.log("Hello I'm " + nameNode + " Node")
                        idNode = parseFloat(dataNode.outputs.output_1.connections[0].node)
                        dataNode = this.editor.value.getNodeFromId(idNode)
                        nameNode = dataNode.name;
                    }
                }
            }
        },
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
        searchNodeGeneratepdf() {
            const editorData = this.editor.value.export().drawflow.Home.data;
            let variableName = "";
            Object.keys(editorData).forEach(function (i) {
                if (editorData[i].name === "Generatepdf") {
                    variableName = editorData[i].mytemplate;
                }
            });
            return variableName
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
        async downloadPdf(htmlforpdf: any, namefile: any) {
            var name = this.selectedOption + "-" + namefile
            var html = '<html><head><style> footer{position: fixed;bottom: 0;} .ql-editor{margin:0px;} div { page-break-before: auto; max-height:3000px;}' + quillCSS + '</style></head><body><div class="ql-editor">' + htmlforpdf + ' <footer style="padding-top: 100px;"><div style="border-top: 2px solid gray; font-size :15px; text-align:center; color:gray;"><p>NTT DATA Morocco Centers – SARL au capital de 7.700.000 Dhs – Parc Technologique de Tétouanshore, Route de Cabo Negro, Martil – Maroc – RC: 19687 – IF : 15294847 – CNSS : 4639532 – Taxe Prof. :51840121</p></div></footer> </div></body></html>'
            var pdf = require('hm-html-pdf');
            var options = { format: 'A4' };
            return new Promise((resolve, reject) => {
                pdf.create(html, options).toFile('src/assets/pdfs/' + name + '.pdf', function (err, res) {
                if (err) {
                    reject(err);
                    return console.log(err);
                }
                resolve(res.filename);
                });
            });
        },
        async sendEmailWithAttachment(pdfPath) {
            const path = require('path');
            const filename = path.basename(pdfPath);
            const emailData = {
                to: 'sanae.lmnjaoui@etu.uae.ac.ma',
                subject: 'Test Email',
                text: 'This is a test email sent from Electron.js!',
                attachments: [
                    {
                        filename: filename, // The name you want to give to the PDF attachment
                        path: pdfPath // Update with the correct file path
                    }
                ]
        };
        ipcRenderer.invoke('sendEmail', emailData)
          .then(() => {
            console.log('Email sent successfully');
          })
          .catch((error) => {
            console.error('Error sending email:', error);
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