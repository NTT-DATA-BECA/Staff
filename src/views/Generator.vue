<template>
    <div className="h-full w-full flex flex-col p-4 bg-white">
        <div class="flex items-center flex-end mb-2">
            <v-select v-model="selectedOption" label="name" class="h-9 text-primary-dark rounded w-60 mr-3"
                @click="() => loadJsonFiles()" :options="programs" @option:selected="onChangeFile()"></v-select>
            <button class="btn" @click="() => generateFlow()">{{ t("generator.btn") }}</button>
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
            </div>
        </div>
    </div>
    <div class="text-center">
        <v-dialog v-model="dialog" width="auto">
            <template v-slot:activator="{ props }">
            </template>
            <v-card class="w-80 text-center">
                <v-card-text>
                    <h1 class="text-primary-dark font-mono">{{ t("generator.progress") }}</h1>
                    <v-card-actions>
                        <v-progress-linear indeterminate></v-progress-linear>
                    </v-card-actions>
                </v-card-text>
            </v-card>
        </v-dialog>
    </div>
    <div class="digital-card-fred" id="div-template">
        <div class="div">
            <img class="NTT-LOGO-japan" src="data:image/png;base64,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" />
            <div class="text-wrapper">{{ fullname }}</div>
            <div class="group" id="qr-container">
                <img class="qr-img" id="img-qr" :src="image"/>
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
import NodeQrCode from '../components/Node-QrCode.vue'
import groupPdfBy from '../components/Node-groupPdfBy.vue'
import alert from '../components/Node-alert.vue'
import { nodesList } from '../utils/nodesList'
import { ipcRenderer } from 'electron'; 
import { useI18n } from 'vue-i18n'
import quillCSS from 'quill/dist/quill.snow.css'
import 'vue3-toastify/dist/index.css';
import { mapActions } from 'vuex';
import QR from 'qrcode-base64';


export default {
    name: "DrawflowDashboard",
    inject: ['ipcRenderer'],
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
            programs: [] as any,
            editor: [] as any,
            node_select: '',
            node_last_move: null as any,
            nodesList: nodesList,
            dynamicConditionJson: {},
            groups: [] as any,
            alertMessages: [] as any,
            dialog: false,
            dataList: [] as any,
            lenghtData: 0,
            nonGeneratedPdf: false,
            allow: true,
            vCardData: '' as any,
            fullname : '' as any,
            image : '' as any,
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
        this.editor.value.registerNode("alert", alert, {}, {});
        this.editor.value.registerNode("QrCode", NodeQrCode, {}, {});
    },
    methods: {
        ...mapActions(['setHeaders', 'setExcelData']),
        touchScreenPosition(ev: any) {
            this.node_last_move = ev;
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
                    var dataRows = [] as string[];
                    headNames = nodeExcelData.data.headers;
                    dataRows = nodeExcelData.data.excelData;
                    this.setHeaders(headNames);
                    this.setExcelData(dataRows);
                }
            }
        },
        async generateFlow() {
            var idNode = parseFloat(this.getStartId());
            var idEnd = this.searchNodeEnd();
            var nbre: number = this.searchForNodespdf();
            if (idNode && nbre < 2 && idEnd) {
                var dataNode = this.editor.value.getNodeFromId(idNode)
                var dataNodeStart = this.editor.value.getNodeFromId(idNode)
                var nameNode = dataNode.name;
                var startoutputs = 0;
                var dataExcel = [];
                var templateName = "";
                var genebasic = "yes";
                var pdfPathGrpBy = "";
                var imgPath="";
                var nbreAlert = this.countNodeAlert();
                var messagesAlert = "";
                var zipPathGrpBy = "";
                var headersExcel = []
                while (dataNodeStart.outputs?.output_1?.connections[startoutputs]) {
                    dataNode = this.MoveToNextNodeByOutput1(dataNode)
                    nameNode = dataNode.name;
                    startoutputs = startoutputs + 1;
                    while (nameNode != "end") {
                        this.dialog = true;
                        if (nameNode == "ImportExcel") {
                            var genebasic = "no";
                            dataExcel = dataNode.data.excelData;
                            headersExcel = dataNode.data.headers;
                            await this.generateNodeExcel(dataNode);
                        }
                        if (nameNode == "file-input") {
                            templateName = dataNode.data.mytemplate;
                        }
                        if(nameNode == "QrCode"){
                          imgPath=dataNode.data.imgpath;
                          for (var i = 0; i < dataExcel.length; i++) {
                            var dataemployee = dataExcel[i];
                            var imgBase64 = this.getImageFormQrCode(dataemployee);
                            this.fullname = dataemployee['Firstname']+" "+dataemployee['Lastname'];
                            this.image = imgBase64;
                            var fileName = dataemployee['Firstname']+" "+dataemployee['Lastname']+".png";
                            await this.generateAndSaveImage(imgPath,fileName)
                        }
                        }
                        if (nameNode == "Generatepdf" || nameNode == "groupPdfBy") {
                            this.lenghtData = dataExcel.length;
                            if (JSON.stringify(this.dynamicConditionJson) != "{}") {
                                for (var i = 0; i < dataExcel.length; i++) {
                                    var dataemployee = dataExcel[i];
                                    if (nameNode == "groupPdfBy") {
                                        pdfPathGrpBy = dataNode.data.pdfpath;
                                        this.groups.push(dataemployee[dataNode.data.group]);
                                        this.generateNodePdf(dataNode, this.dynamicConditionJson, dataemployee, dataNode.data.group);
                                    } else {
                                        this.generateNodePdf(dataNode, this.dynamicConditionJson, dataemployee, null);
                                    }

                                }
                                if (nameNode == "groupPdfBy") {
                                    this.groups = [...new Set(this.groups)];
                                }
                            }
                            else if (dataExcel) {
                                for (var i = 0; i < dataExcel.length; i++) {
                                    var dataemployee = dataExcel[i];
                                    if (nameNode == "groupPdfBy") {
                                        await this.startgenerationpdf(dataNode, dataemployee, dataNode.data.group, templateName);
                                    }
                                    else {
                                        await this.startgenerationpdf(dataNode, dataemployee, null, templateName);
                                    }
                                }

                            }
                            if (genebasic == "yes") {
                                if (!templateName) {
                                    var dataNodeinput = this.MoveToNextNodeByOutput1(dataNode)
                                    templateName = dataNodeinput.data.mytemplate;
                                }
                                await this.startgenerationpdf(dataNode, null, null, templateName);
                            }

                        }
                        if (nameNode == "zip-folder") {
                            while (this.allow) {
                                await new Promise((resolve) => setTimeout(resolve, 300));
                            }
                            if (pdfPathGrpBy) {
                                await new Promise((resolve) => setTimeout(resolve, 30000));
                                zipPathGrpBy = dataNode.data.myzip;
                                const fs = require('fs');
                                if (!fs.existsSync(zipPathGrpBy)) {
                                    fs.mkdirSync(zipPathGrpBy, { recursive: true });
                                }
                                for (let i = 0; i < this.groups.length; i++) {
                                    const folderPath = pdfPathGrpBy + "/" + this.groups[i];
                                    const zipFolderPath = zipPathGrpBy + "/" + this.groups[i] + '.zip';
                                    await this.zipFolder(folderPath, zipFolderPath);
                                }
                            }
                        }

                        if (nameNode == "send-email") {
                            if (zipPathGrpBy) {
                                for (let i = 0; i < this.groups.length; i++) {
                                    ipcRenderer.invoke('getEmailByManager', this.groups[i], this.groups[i])
                                        .then(email => {
                                            const groupZipPath = zipPathGrpBy + "/" + this.groups[i] + '.zip';
                                            this.sendEmailWithAttachment(email, groupZipPath);
                                        })
                                        .catch(error => {
                                        });
                                }
                            }

                        }
                        if (nameNode == "alert") {
                            nbreAlert--;
                            if (dataExcel) {
                                var valeur1 = dataNode.data.variable1;
                                var valeur2 = dataNode.data.variable2;
                                var symbole = dataNode.data.symbole;
                                for (var i = 0; i < dataExcel.length; i++) {
                                    var dataemployee = dataExcel[i];
                                    if (this.compare(symbole, parseFloat(dataemployee[valeur1]), parseFloat(valeur2))) {
                                        this.alertMessages.push(dataNode.data.message);
                                        break;
                                    }
                                }
                                for (var i = 0; i < this.alertMessages.length; i++) {
                                    if (messagesAlert) {
                                        messagesAlert = messagesAlert + " and " + this.alertMessages[i];
                                    }
                                    else {
                                        messagesAlert = this.alertMessages[i];
                                    }
                                }
                                if (nbreAlert == 0) {
                                    this.dialog = false;
                                    this.modalMessage(this.t('messages.alert'), this.t('messages.generatealert') + messagesAlert, 'warning');
                                    this.alertMessages = [];
                                }
                            }
                        }
                        dataNode = this.MoveToNextNodeByOutput1(dataNode);
                        nameNode = dataNode.name;

                        if (nameNode == "end" && !messagesAlert) {
                            this.dialog = false;
                            if (this.nonGeneratedPdf) {
                                this.modalMessage(this.t('messages.alert'), this.t('messages.nongeneratealert'), 'warning');
                            }
                        } else if (messagesAlert) {
                            messagesAlert = "";
                            //this.dialog = false;
                        }
                    }
                    this.dynamicConditionJson = {};
                }
                this.dialog = false;
            }

        },
        async generateAndSaveImage(imgPath: string, fileName : string){
            var tem = document.getElementById('div-template');
            var htmlToImage = require('html-to-image');
            var fs = require('fs');
            if(!fs.existsSync(imgPath)){
                fs.mkdirSync(imgPath);
            }
            await htmlToImage.toPng(tem).then((dataUrl) => {
                const imageBuffer = Buffer.from(dataUrl.split(',')[1], 'base64');
                fs.writeFileSync(`${imgPath}/${fileName}`, imageBuffer, 'binary');
            }).catch(function (error) {
                //console.error('error', error);
            });            
        },
        getImageFormQrCode(dataemployee: any) {
            this.vCardData = `BEGIN:VCARD
VERSION:3.0
N:${dataemployee.Firstname} ${dataemployee.Lastname}
FN:${dataemployee.Firstname} ${dataemployee.Lastname}
ORG:${dataemployee.Organization}
TEL;TYPE=voce,work,pref:${dataemployee.Phone} 
EMAIL:${dataemployee.Email}
ADR:${dataemployee.Address}
URL:${dataemployee.web_site}
END:VCARD`
            var imgData = QR.drawImg(this.vCardData, {
                typeNumber: 4,
                errorCorrectLevel: 'M',
                size: 500
            })
            return imgData;
        },
        async generateNodeExcel(dataNode: any) {
            while (dataNode.name != "condition" && dataNode.name != "end") {
                var dataNode = this.MoveToNextNodeByOutput1(dataNode);
                var nameNode = dataNode.name;
                if (nameNode == "condition") {
                    nameNode = await this.generateNodeCondition(dataNode);
                }
            }
        },
        async generateNodeCondition(dataNode: any) {
            var pointer = require('json-pointer');
            pointer.set(this.dynamicConditionJson, '/label', dataNode.data.variable1);
            pointer.set(this.dynamicConditionJson, '/symbole', dataNode.data.symbole);
            pointer.set(this.dynamicConditionJson, '/number', dataNode.data.variable2);
            var dataOutput1 = this.MoveToNextNodeByOutput1(dataNode);
            var dataOutput2 = this.MoveToNextNodeByOutput2(dataNode);
            if (dataOutput1.name != "end") {
                pointer.set(this.dynamicConditionJson, '/accept', (dataOutput1?.name === "condition") ? dataOutput1.id : dataOutput1?.data.mytemplate);
            }
            if (dataOutput2.name != "end") {
                pointer.set(this.dynamicConditionJson, '/refuse', (dataOutput2?.name === "condition") ? dataOutput2.id : dataOutput2?.data.mytemplate);
            }
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
            var number = parseFloat(conditions.number);
            headerCondition = this.replaceHeader(headerCondition);
            var value = parseFloat(dataemployee[headerCondition]);
            if (isNaN(value) || dataemployee[headerCondition] === "-") {
                value = 0
            }
            if (this.compare(symbole, value, number)) {
                if (typeof conditions.accept === 'object' && conditions.accept) {
                    conditions = conditions.accept;
                    return await this.generateNodePdf(dataNode, conditions, dataemployee, group);
                }
                else if (conditions.accept) {
                    this.startgenerationpdf(dataNode, dataemployee, group, conditions.accept);
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
            var response = await ipcRenderer.invoke('getQuillContentData', { name: template });
            if (response) {
                if (dataemployee) {
                    const currentDate = new Date();
                    const currentYear = currentDate.getFullYear();
                    const currentDateStr = currentDate.toISOString().split('T')[0];
                    const lastNameKeys = ["LastName", "Last Name", "Lastname", "Last name", "Surname", "SurName"];
                    var lastName = this.searchAndReplace(lastNameKeys, dataemployee, lastName);
                    const firstNameKeys = ["FirstName", "First Name", "Firstname", "First name", "name", "Name"];
                    var firstName = this.searchAndReplace(firstNameKeys, dataemployee, firstName);
                    const fullNameKeys = ["Full Name", "FullName", "Fullname", "Full name"];
                    var fullName = this.searchAndReplace(fullNameKeys, dataemployee, fullName);
                    response = response.replace(/{ANS}/g, "" + currentYear);
                    response = response.replace(/{ANS-(\d+)}/g, function (match, number) {
                        const previousYear = currentYear - parseInt(number);
                        return "" + previousYear;
                    });
                    response = response.replace(/{DATE}/g, currentDateStr);
                    response = response.replace(/{([^{}]+)}/g, (match, var1) => {
                        var1 = this.replaceHeader(var1);
                        return `{${var1}}`;
                    });
                    response = this.replaceVariables(response, dataemployee);
                    if (group) {
                        if (!lastName || !firstName) {
                            this.downloadPdf(response, "NTT DATA Morocco Centers -" + fullName, dataNode.data.pdfpath + '/' + dataemployee[group] + '/')
                        } else {
                            this.downloadPdf(response, "NTT DATA Morocco Centers -" + lastName + "_" + firstName, dataNode.data.pdfpath + '/' + dataemployee[group] + '/')
                        }
                    } else {
                        if (!lastName || !firstName) {
                            this.downloadPdf(response, "NTT DATA Morocco Centers -" + fullName, dataNode.data.pdfpath + '/')
                        } else {
                            this.downloadPdf(response, "NTT DATA Morocco Centers -" + lastName + "_" + firstName, dataNode.data.pdfpath + '/')
                        }
                    }
                }
                else {
                    this.downloadPdf(response, template, dataNode.data.pdfpath + '/')
                }
            }
            else {
                console.log(fullName + "full Name")
            }
        },
        addDataEmployeeAndTemplate(dataEmployee, template) {
            var data = {
                dataEmployee: dataEmployee,
                template: template
            };
            this.dataList.push(data);
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
        },
        searchAndReplace(list: any, employees, valeur: any) {
            for (const key of list) {
                if (key in employees) {
                    valeur = employees[key];
                    break;
                }

            }
            return valeur;
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
                    response = response.split(new RegExp(variableName, 'g')).join(variableValue);
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
                this.modalMessage(this.t('messages.error'), this.t('messages.oneEnd'), 'error')
            }
            return idEnd;
        },
        searchForNodespdf() {
            const editorData = this.editor.value.export().drawflow.Home.data;
            var nbre = 0;
            Object.keys(editorData).forEach(function (i) {
                if (editorData[i].name === "Generatepdf" || editorData[i].name === "groupPdfBy") {
                    nbre++;
                }
            });
            console.log(nbre);
            if (nbre >= 2) {
                this.modalMessage(this.t('messages.error'), this.t('messages.onenodegenerate'), 'error')
            }
            return nbre;
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
        countNodeAlert() {
            const editorData = this.editor.value.export().drawflow.Home.data;
            var nbre = 0;
            Object.keys(editorData).forEach(function (i) {
                if (editorData[i].name === "alert") {
                    nbre++;
                }
            });
            return nbre;
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
                this.modalMessage(this.t('messages.error'), this.t('messages.includeonestart'), 'error')
            }
            if (numStart > 1) {
                this.modalMessage(this.t('messages.error'), this.t('messages.onestart'), 'error')
            }
            return idStart
        },
        async zipFolder(folderPath, zipFolderPath) {
            const fs = require('fs');
            const archiver = require('archiver');
            try {
                const output = fs.createWriteStream(zipFolderPath);
                const archive = archiver('zip', {
                    zlib: { level: 9 } // Set compression level
                });

                output.on('close', () => {
                    // console.log('Zip folder created successfully.');
                });

                archive.on('error', (err) => {
                    console.error('Error while creating zip folder:', err);
                });

                archive.pipe(output);
                archive.directory(folderPath, false);
                await archive.finalize();
            } catch (error) {
                console.error('Error while creating zip folder:', error);
            }
        }
        ,
        async sendEmailWithAttachment(email: any, zipPath: any) {
            const path = require('path');
            const filename = path.basename(zipPath);
            const emailData = {
                to: email,
                subject: 'Augmentation_Bonus',
                text: 'Hello, you find here the recapulatif of your employees',
                attachments: [
                    {
                        filename: filename,
                        path: zipPath
                    }
                ]
            };
            await ipcRenderer.invoke('sendEmail', emailData)
                .then(() => {
                })
                .catch((error) => {
                    // Swal.fire('Error', 'Error sending email: ' + error, 'error')
                });
        },
        downloadPdf(htmlforpdf: any, namefile: any, path: any) {
            this.dialog = true;
            var name = namefile
            var html = `<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body{
            height: 297mm;
        }
        footer{
            position: fixed;
            bottom: 10px;
            margin-left:100px; 
            margin-right:100px;
            padding-top: 20px;
        }
        .div-container{
            margin-left: 100px;
            margin-right: 100px;
            margin-top: 30px;
        }
        .image-dev{
          margin-top: 30px;
        }
    </style>
</head>
<body>
    <div class="image-dev">
        <img width="360" height="110" style="margin-left: 45rem; margin-bottom: 45px; margin-top: 45px;" src="data:image/png;base64,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heiXd7tZNlePY8jMw0djra/tXM3y8BFZz/Nax4z1tZl/ZpaPT//m49+9/fHxTy8CBAgQIECAAAECBAgQIECAAAECBAg8CRg8nAIBAqcRWJ8Subx7dfQP83TG0XS+kQABAgQIECBAgAABAgQIECBAgACB9f9OexEgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIEzlzA4HHmBXr7BAgQIECAAAECBAgQIECAAAECBAgQIECAgCc83AABAgQIECBAgAABAgQIECBAgAABAgQIECAQIOAJj4ASRSBAgAABAgQIECBAgAABAgQIECBAgAABAu0CBo/2C5CfAAECBAgQIECAAAECBAgQIECAAAECBAgECBg8AkoUgQABAgQIECBAgAABAgQIECBAgAABAgQItAsYPNovQH4CBAgQIECAAAECBAgQIECAAAECBAgQIBAgYPAIKFEEAgQIECBAgAABAgQIECBAgAABAgQIECDQLmDwaL8A+QkQIECAAAECBAgQIECAAAECBAgQIECAQICAwSOgRBEIECBAgAABAgQIECBAgAABAgQIECBAgEC7gMGj/QLkJ0CAAAECBAgQIECAAAECBAgQIECAAAECAQIGj4ASRSBAgAABAgQIECBAgAABAgQIECBAgAABAu0CBo/2C5CfAAECBAgQIECAAAECBAgQIECAAAECBAgECBg8AkoUgQABAgQIECBAgAABAgQIECBAgAABAgQItAsYPNovQH4CBAgQIECAAAECBAgQIECAAAECBAgQIBAgYPAIKFEEAgQIECBAgAABAgQIECBAgAABAgQIECDQLmDwaL8A+QkQIECAAAECBAgQIECAAAECBAgQIECAQICAwSOgRBEIECBAgAABAgQIECBAgAABAgQIECBAgEC7gMGj/QLkJ0CAAAECBAgQIECAAAECBAgQIECAAAECAQIGj4ASRSBAgAABAgQIECBAgAABAgQIECBAgAABAu0CBo/2C5CfAAECBAgQIECAAAECBAgQIECAAAECBAgECBg8AkoUgQABAgQIECBAgAABAgQIECBAgAABAgQItAsYPNovQH4CBAgQIECAAAECBAgQIECAAAECBAgQIBAgYPAIKFEEAgQIECBAgAABAgQIECBAgAABAgQIECDQLmDwaL8A+QkQIECAAAECBAgQIECAAAECBAgQIECAQICAwSOgRBEIECBAgAABAgQIECBAgAABAgQIECBAgEC7gMGj/QLkJ0CAAAECBAgQIECAAAECBAgQIECAAAECAQIGj4ASRSBAgAABAgQIECBAgAABAgQIECBAgAABAu0CBo/2C5CfAAECBAgQIECAAAECBAgQIECAAAECBAgECBg8AkoUgQABAgQIECBAgAABAgQIECBAgAABAgQItAsYPNovQH4CBAgQIECAAAECBAgQIECAAAECBAgQIBAgYPAIKFEEAgQIECBAgAABAgQIECBAgAABAgQIECDQLmDwaL8A+QkQIECAAAECBAgQIECAAAECBAgQIECAQICAwSOgRBEIECBAgAABAgQIECBAgAABAgQIECBAgEC7gMGj/QLkJ0CAAAECBAgQIECAAAECBAgQIECAAAECAQIGj4ASRSBAgAABAgQIECBAgAABAgQIECBAgAABAu0CBo/2C5CfAAECBAgQIECAAAECBAgQIECAAAECBAgECBg8AkoUgQABAgQIECBAgAABAgQIECBAgAABAgQItAsYPNovQH4CBAgQIECAAAECBAgQIECAAAECBAgQIBAgYPAIKFEEAgQIECBAgAABAgQIECBAgAABAgQIECDQLmDwaL8A+QkQIECAAAECBAgQIECAAAECBAgQIECAQICAwSOgRBEIECBAgAABAgQIECBAgAABAgQIECBAgEC7gMGj/QLkJ0CAAAECBAgQIECAAAECBAgQIECAAAECAQIGj4ASRSBAgAABAgQIECBAgAABAgQIECBAgAABAu0CBo/2C5CfAAECBAgQIECAAAECBAgQIECAAAECBAgECBg8AkoUgQABAgQIECBAgAABAgQIECBAgAABAgQItAsYPNovQH4CBAgQIECAAAECBAgQIECAAAECBAgQIBAgYPAIKFEEAgQIECBAgAABAgQIECBAgAABAgQIECDQLmDwaL8A+QkQIECAAAECBAgQIECAAAECBAgQIECAQICAwSOgRBEIECBAgAABAgQIECBAgAABAgQIECBAgEC7gMGj/QLkJ0CAAAECBAgQIECAAAECBAgQIECAAAECAQIGj4ASRSBAgAABAgQIECBAgAABAgQIECBAgAABAu0CBo/2C5CfAAECBAgQIECAAAECBAgQIECAAAECBAgECBg8AkoUgQABAgQIECBAgAABAgQIECBAgAABAgQItAsYPNovQH4CBAgQIECAAAECBAgQIECAAAECBAgQIBAgYPAIKFEEAgQIECBAgAABAgQIECBAgAABAgQIECDQLmDwaL8A+QkQIECAAAECBAgQIECAAAECBAgQIECAQICAwSOgRBEIECBAgAABAgQIECBAgAABAgQIECBAgEC7gMGj/QLkJ0CAAAECBAgQIECAAAECBAgQIECAAAECAQIGj4ASRSBAgAABAgQIECBAgAABAgQIECBAgAABAu0CBo/2C5CfAAECBAgQIECAAAECBAgQIECAAAECBAgECBg8AkoUgQABAgQIECBAgAABAgQIECBAgAABAgQItAsYPNovQH4CBAgQIECAAAECBAgQIECAAAECBAgQIBAgYPAIKFEEAgQIECBAgAABAgQIECBAgAABAgQIECDQLmDwaL8A+QkQIECAAAECBAgQIECAAAECBAgQIECAQICAwSOgRBEIECBAgAABAgQIECBAgAABAgQIECBAgEC7gMGj/QLkJ0CAAAECBAgQIECAAAECBAgQIECAAAECAQIGj4ASRSBAgAABAgQIECBAgAABAgQIECBAgAABAu0CBo/2C5CfAAECBAgQIECAAAECBAgQIECAAAE3cIV8AAAB3klEQVQCBAgECBg8AkoUgQABAgQIECBAgAABAgQIECBAgAABAgQItAsYPNovQH4CBAgQIECAAAECBAgQIECAAAECBAgQIBAgYPAIKFEEAgQIECBAgAABAgQIECBAgAABAgQIECDQLmDwaL8A+QkQIECAAAECBAgQIECAAAECBAgQIECAQICAwSOgRBEIECBAgAABAgQIECBAgAABAgQIECBAgEC7gMGj/QLkJ0CAAAECBAgQIECAAAECBAgQIECAAAECAQIGj4ASRSBAgAABAgQIECBAgAABAgQIECBAgAABAu0CBo/2C5CfAAECBAgQIECAAAECBAgQIECAAAECBAgECBg8AkoUgQABAgQIECBAgAABAgQIECBAgAABAgQItAsYPNovQH4CBAgQIECAAAECBAgQIECAAAECBAgQIBAgYPAIKFEEAgQIECBAgAABAgQIECBAgAABAgQIECDQLmDwaL8A+QkQIECAAAECBAgQIECAAAECBAgQIECAQICAwSOgRBEIECBAgAABAgQIECBAgAABAgQIECBAgEC7gMGj/QLkJ0CAAAECBAgQIECAAAECBAgQIECAAAECAQIGj4ASRSBAgAABAgQIECBAgAABAgQIECBAgAABAu0CnwDVlpEPtDa65gAAAABJRU5ErkJggg==">
    </div>
    <div class="div-container">
        <div style="margin-top: 75px; font-size: 25px;">    
            <h3 style="margin: 0;">NTT DATA Morocco Centers</h3>
            <p style="margin: 0;">Parc de TetouanShore</p>
            <p style="margin: 0;">Route de Cabo Negro</p>
            <p style="margin: 0;">93000 Martil – Maroc</p>
        </div>
        `+ htmlforpdf +`
        <div style="margin-top: 40px; font-size: 25px;">
            <p>Fred SABBAH.</p>
            <p>Country Director.</p>
        </div>
    </div>
    <footer>
            <div style="border-top: 2px solid #011627;">
                <div style="font-size :20px; text-align:center; color:#011627;margin-left:0px;margin-right:5px;">
                    <p style="font-size :15px; margin-top: 5px;"> NTT DATA Morocco Centers – SARL au capital de 7.700.000 Dhs – Parc Technologique de Tétouanshore, Route de Cabo Negro, Martil – Maroc – RC: 19687 – IF : 15294847 – CNSS : 4639532 – Taxe Prof. :51840121</p>
                </div>
        </div>
    </footer>
</body>
</html>`;
            var pdf = require('html-pdf-phantomjs-included');
            const pathpdf = require('path');
            var options = {
                timeout: 210000,
                phantomPath: require('requireg')('phantomjs').path.replace('app.asar', 'app.asar.unpacked'),
                //script: pathpdf.join(__dirname, 'node_modules/html-pdf-phantomjs-included/lib/scripts/pdf_a4_portrait.js').replace('app.asar', 'app.asar.unpacked').replace('\dist',''),
   
            };
            if (this.lenghtData > 300) {
                options = {
                    timeout: 500000 ,
                    phantomPath: require('requireg')('phantomjs').path.replace('app.asar', 'app.asar.unpacked'),
                    //script: pathpdf.join(__dirname, 'node_modules/html-pdf-phantomjs-included/lib/scripts/pdf_a4_portrait.js').replace('app.asar', 'app.asar.unpacked').replace('\dist',''),
   
                };
            }
            pdf.create(html, options).toFile(path + name + '.pdf', (err, res) => {
                if (err) {
                    console.log(name + "name");
                    this.nonGeneratedPdf = true;
                }
                if (res) {
                    this.allow = false;
                } 
            });
        },

        modalMessage(title: string, type: string, message: SweetAlertIcon) {
            Swal.fire(
                title,
                type,
                message
            );
        },
        replaceHeader(header: string) {
            header = header.replace(/\s+/g, "_");
            header = header.replace(/([[\]()])/g, "\\$1");
            header = header.replace(/[\[\]]/g, "\\$1");
            header = header.replace(/([[\]\/])/g, "\\$1");
            header = header.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
            header = header.replace(/\//g, "_");
            header = header.replace(/[\(\)]/g, "_");
            header = header.replace(/_%/g, "");
            return header;
        }
    }
}
</script>

<style scoped>
#drawflow {
    text-align: initial;
    width: 100%;
    height: 100%;
    background: #f1eeee;
    background-size: 20px 20px;
    background-image: radial-gradient(#c5c3c3 1px, transparent 1px);
    
}

.digital-card-fred {
    background-color: #0072bc;
    display: flex;
    flex-direction: row;
    justify-content: center;
    width: 928px;
    height: 1000px;
    margin: 0px;
    position: fixed;
    z-index: -100;
    margin-left: 2rem;
}

.digital-card-fred .div {
    width: 928px;
    height: 1192px;
    position: relative;
}

.digital-card-fred .text-wrapper {
    position: absolute;
    top: 357px;
    width: 100%;
    font-family: "NotoSerif-Regular", Helvetica;
    font-weight: 550;
    font-size: 50px;
    text-align: center;
    letter-spacing: 0;
    line-height: normal;
    color: white;
}

.digital-card-fred .NTT-LOGO-japan {
    position: absolute;
    width: 435px;
    height: 125px;
    top: 83px;
    left: 247px;
}

.digital-card-fred .group {
    position: absolute;
    width: 386px;
    height: 391px;
    top: 532px;
    left: 265px;
    mix-blend-mode: screen;
    background-size: 100% 100%;
    background-color: white;
    border-radius: 25px;
}
.qr-img{
    width: 386px;
    height: 391px;
    padding: 20px;
    border-radius: 15px;
}
</style>