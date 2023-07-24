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
import alert from '../components/Node-alert.vue'
import { nodesList } from '../utils/nodesList'
import { ipcRenderer } from 'electron';
import { useI18n } from 'vue-i18n'
import quillCSS from 'quill/dist/quill.snow.css'
import 'vue3-toastify/dist/index.css';
import { mapActions } from 'vuex';

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
            allow: true
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
                var nbreAlert = this.countNodeAlert();
                var messagesAlert = "";
                var zipPathGrpBy = "";
                var headersExcel = []
                this.dialog = true;
                while (dataNodeStart.outputs?.output_1?.connections[startoutputs]) {
                    dataNode = this.MoveToNextNodeByOutput1(dataNode)
                    nameNode = dataNode.name;
                    startoutputs = startoutputs + 1;
                    while (nameNode != "end") {
                        if (nameNode == "ImportExcel") {
                            var genebasic = "no";
                            dataExcel = dataNode.data.excelData;
                            headersExcel = dataNode.data.headers;
                            await this.generateNodeExcel(dataNode);
                        }
                        if (nameNode == "file-input") {
                            templateName = dataNode.data.mytemplate;
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
                                if (!templateName) {
                                    var dataNodeinput = this.MoveToNextNodeByOutput1(dataNode)
                                    templateName = dataNodeinput.data.mytemplate;
                                }
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
                        }
                    }
                    this.dynamicConditionJson = {};
                }
            }

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
            var name = namefile
            var html = '<html><head><style> footer{position: fixed;bottom: 0;margin-left:90px; margin-right:130px}' + quillCSS + '</style></head><body><div class="ql-editor">' + htmlforpdf + ' <footer style="padding-top: 100px;"><div style="border-top: 2px solid #011627;"><div style="font-size :15px; text-align:center; color:#011627;margin-left:0px;margin-right:5px;"><p> NTT DATA Morocco Centers – SARL au capital de 7.700.000 Dhs – Parc Technologique de Tétouanshore, Route de Cabo Negro, Martil – Maroc – RC: 19687 – IF : 15294847 – CNSS : 4639532 – Taxe Prof. :51840121</p></div></footer> </div></body></html>'
            var pdf = require('hm-html-pdf');
            var options = {
                "height": "1700px",
                "width": "1375px",
                timeout: 210000
            };
            if (this.lenghtData > 300) {
                options = {
                    "height": "1700px",
                    "width": "1375px",
                    timeout: 500000
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
                console.log("next1")
            });
            console.log("next2")
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