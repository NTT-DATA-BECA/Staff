<template>
    <div className="h-full w-full flex flex-col p-4">
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
</template>

<script lang="ts">
import { h, getCurrentInstance, render } from 'vue'
import Drawflow from 'drawflow'
import Swal from 'sweetalert2'
import QR from 'qrcode-base64';
import { SweetAlertIcon } from 'sweetalert2'
import ImportExcel from '../components/ImportExcel.vue'
import NodeFileInput from '../components/Node-file-input.vue'
import NodeStart from '../components/Node-start.vue'
import NodeEnd from '../components/Node-end.vue'
import Condition from '../components/Node-Condition.vue'
import NodeGeneratePdf from '../components/Node-GeneratePdf.vue'
import NodeZipFolder from '../components/Node-zipFolder.vue'
import sendEmail from '../components/Node-sendEmail.vue'
//import qrcode from '../components/Node-qrcode.vue'
import filetype from '../components/Node-filetype.vue'
import groupPdfBy from '../components/Node-groupPdfBy.vue'
import alert from '../components/Node-alert.vue'
import { nodesList } from '../utils/nodesList'
import { ipcRenderer } from 'electron';
import { useI18n } from 'vue-i18n'
import quillCSS from 'quill/dist/quill.snow.css'
import 'vue3-toastify/dist/index.css';
import { mapActions } from 'vuex';
//import htmlToImage from 'html-to-image';


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
            vCardData: ''
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
        //this.editor.value.registerNode("qrcode", qrcode, {}, {});
        this.editor.value.registerNode("filetype", filetype, {}, {});
        this.editor.value.registerNode("send-email", sendEmail, {}, {});
        this.editor.value.registerNode("zip-folder", NodeZipFolder, {}, {});
        this.editor.value.registerNode("alert", alert, {}, {});
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
                var imgPath = "";
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
                        if(nameNode == "qrcode"  ) {
                            imgPath = dataNode.data.imgpath;
                          for (var i = 0; i < dataExcel.length; i++) {
                            var dataemployee = dataExcel[i];
                            var imgBase64 = this.generateQRCode(dataemployee);
                             var htmlwithqr =` <div id="qrcode" style="width: 400px; margin: 0 auto; background-color: #0072bc; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #ffffff; border-radius: 15px; text-align: center; padding: 20px;">
                                                <img style="height: 120px; width: 200px; border-radius: 50%;" src="../assets/NTT-Data-White.png">
                                                 <h2 style="color: white; font-weight: bold; font-size: 28px; margin-top: 10px;">${dataemployee['Firstname']} ${dataemployee['Lastname']}</h2>
                                               <div style="margin-top: 20px;">
                                                   <img style="height: 300px; width: 300px; border-radius: 15px;" src="${imgBase64}" >
                                               </div>
                                             </div>`;
                                   var fileName = dataemployee['Firstname'] + "-" + dataemployee['Lastname'] + ".png"; // Specify the filename
                                   await this.startgenerationimg(htmlwithqr, imgPath, fileName)

                             var dataemployee = dataExcel[i];
                                if (nameNode == "groupPdfBy") {
                                    await this.startQRCodeGeneration(dataNode, dataemployee, dataNode.data.group, templateName);
                                }
                                else {
                                    await this.startQRCodeGeneration(dataNode, dataemployee, null, templateName);
                                }
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
                            this.dialog = false;
                        }
                    }
                    this.dynamicConditionJson = {};
                }
                this.dialog = false;
            }

        },
        async generateAndSaveImage(htmlContent, imgPath, fileName) {
        var div = document.createElement('div');
        div.innerHTML = htmlContent;
        document.body.appendChild(div);
        var htmlToImage = require('html-to-image');
        var fs = require('fs');
        htmlToImage.toPng(div).then(function (dataUrl) {
        const imageBuffer = Buffer.from(dataUrl.split(',')[1], 'base64');
        fs.writeFileSync(`${imgPath}/${fileName}`, imageBuffer, 'binary');
        div.style.display = 'none'
        document.body.removeChild(div);
    }).catch(function (error) {
        console.error('Oops, something went wrong!', error);
    });
}

        ,
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
            console.log(this.vCardData)
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
        async startgenerationimg(htmlContent, imgPath, fileName) {
           /*  var div = document.getElementById('qrcode');
            div.innerHTML = htmlContent;
            document.body.appendChild(div);*/
            var htmlToImage = require('html-to-image');
            var fs = require('fs');
            htmlToImage.toPng(htmlContent).then(function (dataUrl) {
                const imageBuffer = Buffer.from(dataUrl.split(',')[1], 'base64');
                fs.writeFileSync(`${imgPath}/${fileName}`, imageBuffer, 'binary');
                htmlContent.style.display = 'none'
                document.body.removeChild(htmlContent);
            }).catch(function (error) {
                console.error('error', error);
            });
        },

        async startgenerationpdf(dataNode: any, dataemployee: any, group: any, template: any) {
            var response = await ipcRenderer.invoke('getQuillContentData', { name: template });
             const qrCodeData = await this.startQRCodeGeneration(dataNode, dataemployee, group, template);
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
       async startQRCodeGeneration(dataNode: any, dataemployee: any, group: any, template: any) {

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
                    response = this.replaceQrcodeVariable(response, dataemployee);

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
        },
        replaceQrcodeVariable(response, employee ) {
            var imageqr = this.generateQRCode(employee);

           if (response ) {
                response = response.replace("{qrcode}", "<img src="+imageqr+"/>");
           }
            return response
        },
         generateQRCode(dataemployee) {
           let imageqr = '';

            if (dataemployee) {

                const vCard = `BEGIN:VCARD
VERSION:3.0
N:${dataemployee.LastName};${dataemployee.FirstName}
FN:${dataemployee.LastName};${dataemployee.FirstName}
ORG:www.nttdata.com
TEL;TYPE=voice,work,pref:${dataemployee.Numero_de_tel}
EMAIL:${dataemployee.Email}
ADR:${dataemployee.Adress}
URL:${dataemployee.URL}
END:VCARD`;

              
            imageqr = QR.drawImg(vCard, {
                    typeNumber: 4,
                    errorCorrectLevel: 'M',
                    size: 300
                });
            
                

            
            }
            return imageqr;
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
            var name = namefile
            //var html = '<html><head><style> footer{position: fixed;bottom: 30px;margin-left:90px; margin-right:130px}' + quillCSS + '</style></head><body><div class="ql-editor">' + htmlforpdf + ' <footer style="padding-top: 100px;"><div style="border-top: 4px solid #011627;"><div style="font-size :20px; text-align:center; color:#011627;margin-left:0px;margin-right:5px;"><p> NTT DATA Morocco Centers – SARL au capital de 7.700.000 Dhs – Parc Technologique de Tétouanshore, Route de Cabo Negro, Martil – Maroc – RC: 19687 – IF : 15294847 – CNSS : 4639532 – Taxe Prof. :51840121</p></div></footer> </div></body></html>'
            var html = `<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body{
            height: 297mm
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
        <img width="300" height="200" src="data:image/png;base64,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">
        <img width="360" height="110" style="margin-left: 30rem; margin-bottom: 43px;" src="data:image/png;base64,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heiXd7tZNlePY8jMw0djra/tXM3y8BFZz/Nax4z1tZl/ZpaPT//m49+9/fHxTy8CBAgQIECAAAECBAgQIECAAAECBAg8CRg8nAIBAqcRWJ8Subx7dfQP83TG0XS+kQABAgQIECBAgAABAgQIECBAgACB9f9OexEgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIEzlzA4HHmBXr7BAgQIECAAAECBAgQIECAAAECBAgQIECAgCc83AABAgQIECBAgAABAgQIECBAgAABAgQIECAQIOAJj4ASRSBAgAABAgQIECBAgAABAgQIECBAgAABAu0CBo/2C5CfAAECBAgQIECAAAECBAgQIECAAAECBAgECBg8AkoUgQABAgQIECBAgAABAgQIECBAgAABAgQItAsYPNovQH4CBAgQIECAAAECBAgQIECAAAECBAgQIBAgYPAIKFEEAgQIECBAgAABAgQIECBAgAABAgQIECDQLmDwaL8A+QkQIECAAAECBAgQIECAAAECBAgQIECAQICAwSOgRBEIECBAgAABAgQIECBAgAABAgQIECBAgEC7gMGj/QLkJ0CAAAECBAgQIECAAAECBAgQIECAAAECAQIGj4ASRSBAgAABAgQIECBAgAABAgQIECBAgAABAu0CBo/2C5CfAAECBAgQIECAAAECBAgQIECAAAECBAgECBg8AkoUgQABAgQIECBAgAABAgQIECBAgAABAgQItAsYPNovQH4CBAgQIECAAAECBAgQIECAAAECBAgQIBAgYPAIKFEEAgQIECBAgAABAgQIECBAgAABAgQIECDQLmDwaL8A+QkQIECAAAECBAgQIECAAAECBAgQIECAQICAwSOgRBEIECBAgAABAgQIECBAgAABAgQIECBAgEC7gMGj/QLkJ0CAAAECBAgQIECAAAECBAgQIECAAAECAQIGj4ASRSBAgAABAgQIECBAgAABAgQIECBAgAABAu0CBo/2C5CfAAECBAgQIECAAAECBAgQIECAAAECBAgECBg8AkoUgQABAgQIECBAgAABAgQIECBAgAABAgQItAsYPNovQH4CBAgQIECAAAECBAgQIECAAAECBAgQIBAgYPAIKFEEAgQIECBAgAABAgQIECBAgAABAgQIECDQLmDwaL8A+QkQIECAAAECBAgQIECAAAECBAgQIECAQICAwSOgRBEIECBAgAABAgQIECBAgAABAgQIECBAgEC7gMGj/QLkJ0CAAAECBAgQIECAAAECBAgQIECAAAECAQIGj4ASRSBAgAABAgQIECBAgAABAgQIECBAgAABAu0CBo/2C5CfAAECBAgQIECAAAECBAgQIECAAAECBAgECBg8AkoUgQABAgQIECBAgAABAgQIECBAgAABAgQItAsYPNovQH4CBAgQIECAAAECBAgQIECAAAECBAgQIBAgYPAIKFEEAgQIECBAgAABAgQIECBAgAABAgQIECDQLmDwaL8A+QkQIECAAAECBAgQIECAAAECBAgQIECAQICAwSOgRBEIECBAgAABAgQIECBAgAABAgQIECBAgEC7gMGj/QLkJ0CAAAECBAgQIECAAAECBAgQIECAAAECAQIGj4ASRSBAgAABAgQIECBAgAABAgQIECBAgAABAu0CBo/2C5CfAAECBAgQIECAAAECBAgQIECAAAECBAgECBg8AkoUgQABAgQIECBAgAABAgQIECBAgAABAgQItAsYPNovQH4CBAgQIECAAAECBAgQIECAAAECBAgQIBAgYPAIKFEEAgQIECBAgAABAgQIECBAgAABAgQIECDQLmDwaL8A+QkQIECAAAECBAgQIECAAAECBAgQIECAQICAwSOgRBEIECBAgAABAgQIECBAgAABAgQIECBAgEC7gMGj/QLkJ0CAAAECBAgQIECAAAECBAgQIECAAAECAQIGj4ASRSBAgAABAgQIECBAgAABAgQIECBAgAABAu0CBo/2C5CfAAECBAgQIECAAAECBAgQIECAAAECBAgECBg8AkoUgQABAgQIECBAgAABAgQIECBAgAABAgQItAsYPNovQH4CBAgQIECAAAECBAgQIECAAAECBAgQIBAgYPAIKFEEAgQIECBAgAABAgQIECBAgAABAgQIECDQLmDwaL8A+QkQIECAAAECBAgQIECAAAECBAgQIECAQICAwSOgRBEIECBAgAABAgQIECBAgAABAgQIECBAgEC7gMGj/QLkJ0CAAAECBAgQIECAAAECBAgQIECAAAECAQIGj4ASRSBAgAABAgQIECBAgAABAgQIECBAgAABAu0CBo/2C5CfAAECBAgQIECAAAECBAgQIECAAAECBAgECBg8AkoUgQABAgQIECBAgAABAgQIECBAgAABAgQItAsYPNovQH4CBAgQIECAAAECBAgQIECAAAECBAgQIBAgYPAIKFEEAgQIECBAgAABAgQIECBAgAABAgQIECDQLmDwaL8A+QkQIECAAAECBAgQIECAAAECBAgQIECAQICAwSOgRBEIECBAgAABAgQIECBAgAABAgQIECBAgEC7gMGj/QLkJ0CAAAECBAgQIECAAAECBAgQIECAAAECAQIGj4ASRSBAgAABAgQIECBAgAABAgQIECBAgAABAu0CBo/2C5CfAAECBAgQIECAAAECBAgQIECAAAECBAgECBg8AkoUgQABAgQIECBAgAABAgQIECBAgAABAgQItAsYPNovQH4CBAgQIECAAAECBAgQIECAAAECBAgQIBAgYPAIKFEEAgQIECBAgAABAgQIECBAgAABAgQIECDQLmDwaL8A+QkQIECAAAECBAgQIECAAAECBAgQIECAQICAwSOgRBEIECBAgAABAgQIECBAgAABAgQIECBAgEC7gMGj/QLkJ0CAAAECBAgQIECAAAECBAgQIECAAAECAQIGj4ASRSBAgAABAgQIECBAgAABAgQIECBAgAABAu0CBo/2C5CfAAECBAgQIECAAAECBAgQIECAAAE3cIV8AAAB3klEQVQCBAgECBg8AkoUgQABAgQIECBAgAABAgQIECBAgAABAgQItAsYPNovQH4CBAgQIECAAAECBAgQIECAAAECBAgQIBAgYPAIKFEEAgQIECBAgAABAgQIECBAgAABAgQIECDQLmDwaL8A+QkQIECAAAECBAgQIECAAAECBAgQIECAQICAwSOgRBEIECBAgAABAgQIECBAgAABAgQIECBAgEC7gMGj/QLkJ0CAAAECBAgQIECAAAECBAgQIECAAAECAQIGj4ASRSBAgAABAgQIECBAgAABAgQIECBAgAABAu0CBo/2C5CfAAECBAgQIECAAAECBAgQIECAAAECBAgECBg8AkoUgQABAgQIECBAgAABAgQIECBAgAABAgQItAsYPNovQH4CBAgQIECAAAECBAgQIECAAAECBAgQIBAgYPAIKFEEAgQIECBAgAABAgQIECBAgAABAgQIECDQLmDwaL8A+QkQIECAAAECBAgQIECAAAECBAgQIECAQICAwSOgRBEIECBAgAABAgQIECBAgAABAgQIECBAgEC7gMGj/QLkJ0CAAAECBAgQIECAAAECBAgQIECAAAECAQIGj4ASRSBAgAABAgQIECBAgAABAgQIECBAgAABAu0CnwDVlpEPtDa65gAAAABJRU5ErkJggg==">
    </div>
    <div class="div-container">
        <div style="margin-top: 75px; font-size: 20px;">    
            <h2 style="margin: 0;">NTT DATA Morocco Centers</h2>
            <p style="margin: 0;">Parc de TetouanShore</p>
            <p style="margin: 0;">Route de Cabo Negro</p>
            <p style="margin: 0;">93000 Martil – Maroc</p>
        </div>
        `+ htmlforpdf +`
        <div style="margin-top: 75px; font-size: 20px;">
            <p>Fred SABBAH.</p>
            <p>Country Director.</p>
            <img style="margin-left: 40px;" width="169" height="106"  src="data:image/jpg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCABqAKkDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD9UqKKKACiijFABRRRQAUUCgjIIoABRTVARQB0qrqesWOi2M97qN5BYWUCF5bi5kEccajqWZsAD60bgXKM15lN8etF1BxF4V03WvHErH5JNBsGe0f5tvF5KY7Y9zxL0B9gbQ1f4mas5NvoGgeHLViSkupajJeXKr23wRRogPqFnYDPU1XK1uB6HRXzB4y/aH8W/C/xbY2uoa14Y8cabb3SxeIIfD+h3VrNpMTriNmlN3OhneR4UjttoklMg2gda63xh8cfEHws0fSPFHjbTrLS9E1GKdDoVorT6lb3AieWCITCTy5pZBH5XlIgHmyKFkcDLV7OWnmB7juA6kfnQrBgCCCPUGvC/DvwX1X4qaLc6v8AGGW4ubvV4Pk8H2l4yabo0TNuSMCMr59yo2752J+bd5YRevYfs8a3e+IvgN8P9V1O4e8v7vQbKee7lJZrhjAh80k9S/3s/wC1SlFJXuB1ni/xho/gPwxqXiHX9Qg0rR9Nga4ury4bakSKOSe59ABkkkAAk1wnwf8AjVqPxR8SeINOvfB194UtrGysdRsm1KdTc3EFy1yqedAF/wBHkH2bd5ZZmCypuCNlRyfjV4vjN8dIfCs7MfA3gOODW/EAZtkN5qbYksLZ+m5IUDXTjONxts5wRXWfs/QPrGh6z46niMc3jPUH1aAsAD9gCrDYe43WsUMhU9Hmk6Zq+WMYXluB6pRRmisLgFJx7flS5FG6mAelFFFABQKKKACikzk4rzHxt8VNTPi6TwR4I0qLXPFEUMc9/d3cpjsNGikDeW9ww+Z3baSsKfMwGWaNSGLinL4QPSbq7hsbeSe4lSGCNSzySMFVAOpJPAFeeSfHHS9Xu47Twjpmq+N5WJDXOiwp9hjA6sbuVkgbB4Ko7v8A7JrBuvh74a0LTm1r4t+LLbxTPHmV5vEcsVtpNqcgDybRj5KBSwAd98nzDLnIrYtPjdp2vpHF4K8P6x4vi3mL7ZYWwtrBB0Di5nMccsfB+aAy9OnIBtR+f4IDB8e+JPGnhzwTqvi3xd4jsPAWgaVbtd3VloEK6hfMqr8sa3NwgjLu/wAoQW5ySFDEnNY/wbfwX4r+HFr468Z6AdH1izu5479fGup/2jLpd1bzvE5SaY7I/mTcDEEXBGAMCuX+Msvi7xx4x+Hnhfxjrmi+A9Bmnl8TahHplyJpIo9PeJ4i11cqkZ/0m4sz5Zt2H7t234GK0PBqfBXwlqWpazpVzL8SdSa9+3x6ja2lx4hlsnZF3bLhFlWHc6PJncgyx9K35Uoeb7Aelz/GRvEZe08BeHNR8TzcqmqTRGy0lDjKubmUAyxnI+a3Sbj8MxS/CvxT43cS+OfGNwLJgC3h7wsz6faf7slwD9omxnBIeJWxzGOlc/ov7Ttz428SR6T4Q+GniPXoRIEudZeezi063UEB8zrM4Mi5GYgN/XgYr0nx/wDFPw38Nobb+278R3l43l2Wm20bT3l4+QoWGCMF5DlhnAwM5JA5rFxmmlGOr+bA4ceENJvfip4d8I6RptppfhPwZaDW5dPsoBBA99O0kdmoVQFIRUu5WU8h2t39DWZ8UvC6fFP9o34b+H7lfN0Xwfbz+Mb2ExblN5uFvpwLdsMbyUdebccVW/ZM+Kej/GmL4leNdJN0kN94nMCQaguyeCKGxtIlQrk7QSjuACeZG7k1zXwX+K+meKfjH8ZvE+j2Oq+ItSm1qDw1b2NiFdY7awgH71pGYRRI89zdFSzguANqkhq35KkJS01ivxYtGe1fHDxdeeCPhZruoaYiy63LCthpUJIxLqFw6wWkZyQMNNLGDk9M1NbtoHwL+EttDeXgtPD3hbR0ha5nYZEFvCFyfU7UHAHJ6CvmL4o/FjWfG3xrsfC9zcTZ8OTrPaaD4HC3eo3WqyKyIjzXCCFY4IJDJM7IqwtPD85fbjjv2ow+j6EPBOq+C9Mn8deM4LdNMv31641m8ty+o2Vs8Dz3EA+zRyJcygMhCfIyhTxmoYZycYPrq/T/AIbUZsfD/wAZ6f4u+F+keCLFr3Xdc+IdzP4o8cXGh2M1z9ktLuRpHs3kRdqu8YWxDFlCrDM2VZFU/VcHjTxVfQPBpXw+vNPZF2wPr2o2trAwA4/492uHUdODHkZAIHOOa8Fw+HPgLpFzc+L/ABRZXPjLxDcNfarfSMBcajchAPKt4Bl2jiQJHHEgJCgcFmYm1qPxV8Q+OtG1u2+HPhm4OpxRvb22r+JV+wWUNxtGPMhbNz8u4NsMK7gANwDBqio+eXurTz/r7vIDfP8Aws3VLVv+RT8M3Ctw2651hWXHpi0Kkfjn2xzzPiybWPDVlFN4u+MKeHJ7lvLgj0TS7S2M74ACQQ3IupJHJz8qlicgAetf4feH/iL8S/CFnd/EDxHd+F75w0V7oXhqzOnhXR3jkX7Q7yzMhKhkkiaIspDA4bA9A8I/Cvwt4GvJ73R9GtoNTuECXGpygzXtwoxgS3EhaWToPvMelY6Rf+X/AAQPNPh23xF1Lxlp11aa54i1HwVmQ303jrT7KyuJ12MI/skFvbQzId+0sblUwoOEbcCPc8P/AHzTggXGAB6Yp35VnKXM9gCiiikAd68a+Pnxh8c/DOXTLbwj8MtU8aLehvO1O0IeGyIzgNCmZZG4zjCJyP3meK9lpCQvJ9KcWk7tXA+Zo5Pjv4wdg1rqejZAjYTPp2jWjKW+ZgEOpXBO3/bi9sHmuev/ANh7XfEPiDWdcu/iXe6Le6vDHDeWmnQy3sEyqCuZGvp52eQR7YxIgiwo4UZ4+hfFXxi8K+EtT/sme/fUNfZQyaJpNvJe3xBHBMESs6L0+dwqjOSQKx1134meLtp0zQNO8E2DEZufEMwvb3GRkC1t38tcjOGNwcHGUNdEa1SOsbIDyPwr+wH4G8LW1yrXlqA7bxMdA024kU85zJfQXLn8GAGOlZdv8I/groOr3EWgS+KfGGvsWt5IPA91NaxwtnaUl/s37PaQNnP+tKHrk4Fe3p8BtK1yY3HjbVdU8fSMBm21qZRp6kA9LKJUgPU4Lo7D+8etejWem2um2sdtaW8VtbxjCQwoERR6ADgU3iJ3vzN/gKx8C+H/AII+LvC3x517WPC/hTTQdM8O2twNF8X+Rq2pmC4vLjd5EsZRfPAsyEE00vUAyAMdv1L4K+HvhL4meGrLxDqWraj8Q7HUollRPEDqbVcEfKbBUSBJEZSDui8xWDBjkEVV+JAf4c/GbQ/iJMl5L4dvdJk8Oay1uryizbzhNZ3LRIpYoGa4iZhkqZozgKHYZvwK8RQeCPBPinX/ABbdWvhHw/rHifUNV0WLWGWydLKeRWVpFfBV5ZTLLsbDATAEA5AqrUnVipsdju/ip41f4ceFrOHRLJLzxBqlzFo+h6aFIjkuXBILbR8sccaSSueMJE2OcV82+KdXsfhBqHjjxpdyHxV490sR+GvD6zgT3ura5cQxzSvBDnlF+0wRpHHxEkdwAB5jlu68bfEy81T4ueGfFPg7wb4o8f2Om6VqWnrDZ2TWNsl3PNaeXMJ7ryo5EKwTIZEL7M9CGOPOdL/Z7+PGk/EzV/FVlF4Ksr/WprmW1v3uHvJvDiTytJKkBkgAZ2aRizbG3hVT92qjOlGKivedvnvrsI8s+EPw78U/B2HU/hJrPiC98Ga74wvftlhbW16BLFpzxHfcz36gKZINsv7mPazzMuWaJsDvbT41aH8DPEnjP4SfDJLS91HXtXhm8P3miiO7s9MjNhBBMsm1tpuImtJH8p2G8yxl2VCzD6C8I/sleDYIm1Lx1C3xK8W3kaDVNX8RZnhunX7pW0JMMSJyEUJlQT8xLMW9Hn+FPgq68LL4Zl8I6HJ4cVty6Q2nQm0VvURbdgPvitKuKhOTcle+/TXv/wAOFj4Z8MTeLvhH4y8ceH/hP4UtNX8aeJGhMN/rGpLqGqadGsCh5L5Yd9vGHuPtE++W4Qs0xxE+0KfZvCv7Dkdx4V1yfx1488R+J/H2vQK1/rsN0bVYbmMh4DAse1vLgkVXjjZtgZdwRSePo7wr4G8O+BtO/s/w5oWnaBYbt/2XTLVLeMtgDJVAATgDn2FbnasJ4qb+HTz6sZ84+Hv2cfGc4FhrXizRfDeiklbofD7Rm0q/1QZDZnvHlkkjyVG7ytrHJ+etP9k/wzpPhJvixpuh6Smh6VB40mt7ewTJ2LDYWMG8k/MxkMRlLNksZCSSTk+94qnZ6NY6fe313bWsVvc3zrLdSxoFaZwioGf1IVEXJ5woHQCueVWUk1LqBcFFFFZAFJn6UtGPegApGOBntSnpXi37Q3jVfD2oeE9H1fXG8G+DdYlnXWPEwna2EXlhPKsxcAYt2nLufOLIQIHVWDupFRjzOyA6TxL8Y7S11ebQPDGmXnjPxJEzJNaaXgW9k+0kC7uWPlwfw/ISZSGBWNhVOL4e+LfGcnm+NvFDW2nsMr4f8KyzWcI5yPNvAVnmI4+55CEZDRkVmeFvjZ8GPCek2Wg+FPFOgXdrbRssGmeGZRqMoA+Zv3Vt5jljySSCSck5Oa10+M9zrSqfDngHxdrkZYoZ7jT10qNMY+Yi+eBypzwURu9VaS2VgO18MeD9E8F6aun6FpFjo1ipJFvYW6wx5JJJwoAySST7k1rHCDpxXhWo/EvxNfnxSmpeJ/B3gaLwvbJda/bWjy6ze2Nu0ZlEjswgSE+WpYZimU89cYPnmv8AxP8AgXY+O7Twb4/+Kes+MvEt48KppOoyXLWknm7WjSS3s4Y7VlbepxKrY7nrVRpSl0v6K4m0j37xH8cPBXhm/l02fXIr/WY/vaPpEb6hfjkD/j2gDyDkjkrjnrVIeO/GfiZ1Hh7wRJpdq24f2h4su1tAVzhXjt4fNlfudkvkHoMjcSvHfCf9pX4Jat4zX4ZeA9Rt7fWLd5oxoun6DdWcMJj3NJkmBYlwVbnIyemSeXfFj9tb4TfBHxvJ4T8Ya7c6dq8VvHdTLFptzcRxRvnaWeONgMgE01RnflUHf+uguZWvc6+T4b+K/ETZ8S+PrxIC3zWHhi1XTIXT+60rGW4B7bo5o+pwBxjY8N/CHwh4X1BdRs9BtJNXAIOrXoa7vmBOcG5lLSkdOCx6D0rnfH37Svw9+Glv4Lude8QW9ta+MbqK10a4jzIlx5gUrJkDCx/PHlzwN654Oa5PVf20fBGk/H2H4QS6T4ol8VyypGJINHd7YbsYfcDuMYzzIF2DBJbAzRGnWkrqLt6dtw5ke++Wv90flS4FeceBfj/4L+I3xG8aeB9C1MXfiDwjJFFqcQUhFZweEboxVlZGA+6wwaz9d/aa+H/hj4rah8PdV1yLT/EFjosmv3H2hgsSWyAs43ZyXEatIUxnYpboKj2U725Xfcd0esYor5eh/wCCgvw81rw94IvfDGk+IfFuqeL7u5tdO0DSLSOS/QW7ETSSoZAsaAbWBLcq2cYDbbL/ALdXhG80zRjo/hzxDq3iHUtXu9Dfw35EVvf2V5bxmSSKdJZFCnaARgnOSOoIrVYWu9ORkucUfTHSjrXyTN/wUD0vUfhY3iHw14C1zXfFb+KG8H2/hPzYlmlv1jEsmJYzIvlKmTvAPIxgA7hPd/t2rovgHVrnWvhzrWlfEjTtTsdGPgSS4R557q8Gbbyp1BDRuof5tucqRt5BNfVa38vl0/r5hzxPq/FAr5p1L9rnWfDXw01rWfE/wp8Q+HvGFrqFtpGm+GJnWYavd3PFulvdKuxwSG3EA7Np4JIBSz/ap8W6F8JPE/iHxz8JtX8MeKtGktbW10FLhbhNXuLlhHbpbTIpDFpTtKgMVyPvZxU/Vqvbrbdf5i9pE+l80V83fAb9pPxr4t+JN38P/il8OH+Hfih9O/tfTRHfJeW95bK4SQB14DoWQ4BOQTkLt5+kFOayqU5Upcsv8y009hcUZ9jRRmsxhTGjVuSM/Wn0UARJbojEgYz6U89KdRjNAH5q/tXfA34r3vxE+PXj74eWGrT3OprZ+G7rSEsjJFrWk3GlwRzPAOryQzd1zj5v7pB+nz8Ntbf9pP4QeI4dL2aXpXg3UdO1K5ZFbyZSbTy4t/Zid5GOoR+2c/RJjX0pMJH2wBXZLFTlFRa2VvwsRyJHjHgX4c65oP7UfxR8WXNuq+Htd0fRYbO4XaC80H2lZUIySSoZDnAGHUDOCa8d+ML+L/Avxy+LOoWfwu8RePNK8Z+FNP0iwfR7WGa2a5QXSFblnkXYn74ZOxsLyffsvC37aJ8dfE/+w/Dvwz8W6x4L/th9CbxvaWvmWIuVYoXwuT5AYYMpOB1IFX/hh+1Lr3xc8favpvh74YajceDtM1u60O48Wtq1qkaSQNteT7OzCQrnGMZOGHHUDWKrQk5yjsl17Wt1302J91nyx8Qv2E/jH8a9B8A+GL+90vRbDwH4KstOsp9UkaVZtSkw1x5RhYlfKWKGEu2QdoKqcnb9X6P4E8a658W/hR4+1zRhaX9l4KvrLX41uIj5F/KbNxCoDEEFkn+ZeMLyRxnK+Hn7eXgD4laBZ6npMOoM8/iu28JPZyLGJYp7hmEExw2DEwUnI54YY+U1jaZ+2T40bxX8X9M1r4SHRbH4baVLqmo3TeIYpnkH2d7i2RUWHGZo0JyGOzvk8VpN4ma5ZRS5b+W+/wCYly9zzX9l79h/4pfBv426f8YPEHi2zvdZ8Qz3b+KtAtItoCXQaU4m3bZGS48pmUKBhTtZuAaP7XP/AAT18Y/Hj4+a54/0DxAmjwXdpp9mIc7JJo2V7e9G4NwFgCNgjEgkZOMc+weA/wBsLxPr3wZ8V/ErxD4B0rQ9D0nQpNbs4rHxZBqE13iISJE6xxDySwIGW5BIBXNc94b/AG/7y98T+OdJ1TwfpUw8PeD5/GEFz4Y8Sx6tHcxRBSbd2SJfKc7/AOIZAGdpVlY6KpjFUdVJXSt020F7trHnvhH9jv4g/sran4N8WfDvw3D8RLnw/f65aTaLd6rFaXFxp1y4+yypK6hFlUIC+Ou7AHXFvSP2FfEHxpj1vWPito0Xhybxh42k13V9E0rUkL2FjFp93DahZEUo83nzozkZDDk85UfQX7Jn7RWv/tFeFrvXNU8O6XotmvlSWs+j67BqccgkTcYpQmHhmjyoZHUfeFcb4c/bC8Q+JP2kvEnw7TRfDllZaNrUekmw1LVzaa3dQsoJvbeF08ueIDL7VfeUwQCSMp1cU5TWnMt31/O27C0bLscBpv7FHjn4Q+CvCJ+Hy6Le+IPh94sv9W0dbyYwnXNPuUVXS6cIAlzsAiDD5dsY6cAMvP2X/jV8b7zxN8RPGC6H4K+IS6zoupeF9HNwbu2sV01pyqzyR7gRIbhz8u7kElQDgevaZ+2Rpep/tl6n8C1tQn2XTDImojlpb4RrO0S4JG0QseSAd6MPSvm5f+CjvxIPxkvfDmn2fg/xPEni+40C38J6dY6hHrk9okzoJ1lYm2ztUHluvJUDJGsfrlR3sr2vd9m7ifIj3jxP8Hfjd8Y/Ams3XjDUvDmheMNM1zT9b8I6XpqtcafaT2RLq08rBZJBOzMrA/cCqQMkrWnF8Gfi38YfAHiSD4q61oWi+IJrmyvPDsHhaFpLfRrm0cyx3JaYFnd5SNy5I2IADkkD0f8AZ9+Mk3xn8PeIb+50xtHutH8RajoU1nKytJGbeUqu/azLv2FdwVmXOcEivVO1ebKvODcbJNP7vQtRTR84fDf4HfEzVfjRpPxL+LOv+HbnUdC0u40rSdH8JwTpar5zKZbmV5m3F2C7doGOFPbn6OHvS0VhUm6juy0lHYMUUUfnWZQ1HEihh0IyKdRmigAoopGOKAFprpvBHrXy1rv7VfjLxZL4b8P/AA08H6Xd+Nda1PW7Zl1y/YWFlZaZetayXMrIocmRthVFU43MMnbk0fiz+1X8Q/hlafCvS9W8N+DvBvijxamqDUG8Wa95Wmae9oEKsLmMEFZg+5QeRuVTznHSsPUbS669e1/8mQ5JDPhV8O/jt8GL/T/h1o1h4Vl+HVv4huNRTxRJdObmLTJbp7iS0+zFf9ed7qJMsoDD0yMP4L/sy+I/hr8c/EXiK6+FPg7UTfeJ7/U7fxlLrsqXsFlcXDOqx23kOokRHxjKA8jdj5j9FfDr4qrr+i+EYtYvtH1DXNfguZobjwk82oaTIIG+cpdBNoADKPnK5bcFzivAvjN+3hqvwx/aDm8GWfg231Lwbod9pOneJfEMt8I3spNQy0RVO4VPmPXO0gleCeiEq1VzhGK1WvS/4k2SszC8Nf8ABPa88Jah8JNW0vVtNstR8Na8194iht1kSDWLdL6a5tZCAOZ4lcIC+cByN+FG71/xN+zvqeqal+0RdW99YofiZodvp1kJC4+zyx2EtqTNheF3OpyuTjPGQM+Z6f8A8FBLnT/Eeu3HiXwvZWXg6RfEY8N3djfNLdX76MA04lUoFjWVNxQg8FdpByCbHgn9rX4pfFLwN43t9J8IeFvDvjvw4uk6k8mt6m7aTBpl/bm5W4mcbHDRRK28DGOozjFa1FipPmn+ne/4P7tiVyLYo/DP9kTxPZ/Bbxb8P9Y8FfDjwnJq3hb+xk8ReG5JZL66udgAe5326kozqHbDEg9ATgj0fwv+yLZ/B/xX421H4WXdl4P0/wAU+Hhp72X2MTrZahECttdRqxKsmHfzI2HzEA5+Y14DqP7f/j6Xwf8ABTX3i8LeE9P8UDUX17WNS0++u7CJba7FurRCFvMRXwWG/gFlywAJPvnjj43eNfCn7Ufw+8Eg+Grjwb41t70WBjEzX0RgtRMZ3kJERUudgjXJK4O7J4dVYpNqTVndvtpv+QLl6GP+y5+zH4y+GHxN8QeN/F7+C9Iu7/So9JTRvh/ZS2lhcbZfNN5cI4VTcEkrlVxgnmrvxL/Zb8W/E/4qaXqeq+LNEuPCuma7a67ZvcaCj65ZiGRZTZwXYZQsDOg5278HBLY5851j4+/HPRtJ+NoTU/CetN4b1TSvDuh6tY6bLBAdQu54ElDq0sn+oW5QMp3fPjkgEHldJ/an+N2ozwfDiPU9GXxzp3iTxHpd34nudKzDewaXax3MeLdWAQzmUISv3VAIBY1Sp4hzdRSV/wBLX7dAbjazPZ4f2CPCtt4ik8c2mpTWvxVfX211vFmZnVs3hmNubbzgnlGE+RgEHHOc8Voz/sPeE7V4tZ0S4h0Hx1aeKrnxTaeKbSxVbgNNdPK1rNhg00HlyGEqXGRzxyD4rp/7bHjDxtcaf4s0zW9C0nwj4atPCknifTVtfPN9NqzhLkJLuJg+z5OEG4ko249qzfA/7Z3xBhupvGeq6nb6t4X8T23i2fRfDb6fHC2knSIfPhBmjOZhIisGySAehpunjd3Pb/Lbbt8rCvBaWPov4cfs1+MPhf8AEHxJq2j/ABUkTwlr3iS58R3XhltAgJLzsGki+0ly4XhQCAMBRx1z9Brwozzx1r87fDP7TnxOtLi4+HureNG1XX9YvfCSWvimHSraGXTE1ZVedBGFMT7RxGWU/eOc4AGV8Qv+CgWueCvgLrHhyx8UQaj8W9M13UtIk1m7t4Lc/ZbSc7bryMbDJIhSJYwvLeYcfITWUsFiK00rpvTbtbfb/gjVSMVsfpSWpQc18Ia5+0zrWo/tZQRLf+Kk+HdhLoNvaXvhqK3n0d21GON91+zKWYSmZI0ZHGwLuAYtz93LzXDVozo8vN1VzSMlIWjHuaKM1gWFFBpKAFpD0pTSHtSYHyc/7J3jvwp/Y3ibwP4v0nTfHuk6nr04/tSxafT76y1K+a5NvMFIkUp+7YMv8SsOhzTfiD+yj8RPE8Pw11j/AITLw/4s8ZeFrnWLi6ufF+kvNY3Jv8fKluknyJCAFjUsQAq9htr6zFHeupYionfqvL+u5PKjzjwN4f8AiJp2n+Fo/EWs+GTJZpcLq1tomkSww3AIAt1gLzkxbDksSpD5wAmK8i+MH7D1n8V/jdB43bxRLpug3txpt34h8MrYRyx6vNYl/szNMzZQBXKsNpDL+n1EKB0rGNadOTlB2Y3FHx74R/4J16To3jjXbzWvF97rvgu4TWl0nwwbRIf7MOqxiO7P2gMWkPl5VcgYyD1zmgv/AATrvLX4N+M/Bdr8VNVOreKpdNgvteurFWY6dYx+Xb2flrKvAQ4LbvmAAIxmvtM96TvW/wBbrXvzduxPKj578a/sxeI/Fvwj0LwHb/Ey90OyttLbQ9VOnaNaJBqdkyqjIICNsDCNSitGRtDHg8Yu67+zBL4k+KHhrXr7xxrE/hDw7d22q6d4PeKFoIL+CDyI5VnK+aI9mSYs4Lktnkivd/Wis/bVO/fouoWR5Ze/s8+HNQ+GPijwXJNeQWviDVLvWLm/tHWG7S7mvDdLMjqPvxP5YQkHiJAc4rhtO/Yq0DTfCn2CDxX4jg8QSa3fa/c+KIpYFvri4vYfJugwMRjCPHtGAgwUVhgivosjg0o6URr1YrSQnCLWx83a3+wd8O9X8S+GdSgbVtM0vRrewt5/DlndhdO1UWRzaG7iKnzShJ5J5yc9TnS0L9ijwBo3xG1rxZJJrOpx6jFfxR6BqF95mm2H27/j8NrEFBiMoLBsN0ZgO2PoDtQOn405Yms1ZyZXLHsfNVp+wD8MrLwH4n8LxyeIHHiCWzkn1ibVDJqFuLTAtEhkZSEWIDao2nAOCSAuOq0L9jb4TaJ8Lk8Ct4Us9S04W08DX+pRJcX7NNkyzfaGXcsjE7ty7cELgAAAe2UDpQ8TWlq5PvuHLHseVal+zH8PdT8XaV4ifRZIbrTktFitLW7lgs5DasWtWlt0YRyGIk7CwO3gDgCvVQMUUGspTlK3M9hpJbAaWm9qXFSM/9kA"/>
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
</style>