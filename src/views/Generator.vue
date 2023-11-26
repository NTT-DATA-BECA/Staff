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
import NodeQrCode from '../components/Node-QrCode.vue'
import groupPdfBy from '../components/Node-groupPdfBy.vue'
import alert from '../components/Node-alert.vue'
import { nodesList } from '../utils/nodesList'
import { ipcRenderer } from 'electron';
import { useI18n } from 'vue-i18n'
import quillCSS from 'quill/dist/quill.snow.css'
import 'vue3-toastify/dist/index.css';
import { mapActions } from 'vuex';
import QR from 'qrcode-base64'


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
            vCardData: '' as any
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
        this.editor.value.registerNode("Qr-Code", NodeQrCode, {}, {});
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
                        if(nameNode == "Qr-Code"){
                          imgPath=dataNode.data.imgpath;
                          for (var i = 0; i < dataExcel.length; i++) {
                            var dataemployee = dataExcel[i];
                            var imgBase64 = this.getImageFormQrCode(dataemployee);
                            var htmlwithqr = `
                                <div style="width: 500px; margin: 0 auto; text-align: center; background-color: #0072bc; ">
                                    
                                 <center><img style="height: 200px; width: 200px;" src="data:image/jpeg;base64,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xN8H/BFr4Y0vR9KurS3klkWa5Ehcl3Ln7rAdzX1GfYGvjsHGlRV2mvyZ8tw/mGHy/GSrVnZNP80eV/Fb/kqXjD/sM3n/AKPev0F/YR1K3u/2fbCCJgZbS9uYZx3DmTfz77XWvzj8Sa3J4k8QalrE6LFcahdy3ckcecIzuXIGe2Tiuz+D/wAe/FvwRvribw7dwm2utpuLC9jMkErAYDEAgqR6qRkdegozbLauOwEaFN2lGz8ticnzSll+YSrzXuSuvPc908ffsH/EXX/G/iDU7PU9EuLS/vprmKS4upFkKu5YblERAPOMA4GOK1/gv+xT4/8AAPxS8N+ItTu9Daw065E0ywXMryFcEfKPLUE89656P/got43VMN4d0En1Czf/ABylP/BRbxttx/wjuhf+Rv8A4uvBlRz+VH2LjHltbpc+hjW4eVZV1OXNe/W1/uPUP+Cjf/JN/C3tq2Of+uL1+f1ez/G79qLX/jroen6VrGm6fYQ2dz9qSSz8zLNsK4O5jx8xrxhTg19LkeErYLBKjXVnd/mfLZ/jaOPx0q9Hay/ISiiivoT5sKKKKACiiigDt/hT8XfEPwb8UJrWgXWGOFubSbJhuUHO1wP0bqOox0r9CvhL+2D4D+KFpBDeXqeGdcb5XsNTcIjN38uU/K/04b1UV+YAx3OKXzM8FRj1/wA/596+dzPI8NmXvP3Zd1+p9NlefYrLPdh70ez2+R+tnij9nn4Z+OJXudT8JaXPPIdzzwJ5Dye7NGVJP1NUtB/Za+FHhu4E9n4M05pV6G7L3I/KVmFfl5ofj7xN4ZjEej+I9W0mP+5Y30sA/wDHTVnVfih4y1yEw6l4u13UYCPmiutSmlU/gzEfpXzf+rePS9msU+T5/lex9P8A6z4B/vHhFz/L87H6dfEr9of4ffBuxeDUNWtWvoV2R6PpxEtxx0TYpwn/AAIqBX5+/Hz9pLxB8dNSEdwBpfh+3k3WulQuSuQMeZK2PnfHA4wB0AOSfIt3vj/PU/5NN4x05r3ct4fw2Xy9q3zz7v8ARHz2Z8RYnMY+yS5KfZfqJRRRX1J8mFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQB/9k=">
                                    <p style="color: white; font-weight: bold; font-size: 25px;padding: 20px;padding-top:0px">${dataemployee['Firstname']} ${dataemployee['Lastname']}</p>
                                      <div style="display: inline-block;">
                                        <img style="height: 250px; width: 250px;padding: 20px;" src="${imgBase64}" >
                                    </div></center> 
                                </div>
                            `;

                            var fileName = dataemployee['Firstname']+"-"+dataemployee['Lastname']+".png"; // Specify the filename
                            await this.generateAndSaveImage(htmlwithqr,imgPath,fileName)

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
                if (editorData[i].name === "Generatepdf"/*  || editorData[i].name === "groupPdfBy" */) {
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
            var html = '<html><head><style> footer{position: fixed;bottom: 30px;margin-left:90px; margin-right:130px}' + quillCSS + '</style></head><body><div class="ql-editor">' + htmlforpdf + ' <footer style="padding-top: 100px;"><div style="border-top: 4px solid #011627;"><div style="font-size :20px; text-align:center; color:#011627;margin-left:0px;margin-right:5px;"><p> NTT DATA Morocco Centers – SARL au capital de 7.700.000 Dhs – Parc Technologique de Tétouanshore, Route de Cabo Negro, Martil – Maroc – RC: 19687 – IF : 15294847 – CNSS : 4639532 – Taxe Prof. :51840121</p></div></footer> </div></body></html>'
            var pdf = require('html-pdf-phantomjs-included');
            const pathpdf = require('path');
            var options = {
                "height": "920px",
                 "width": "690px",
                timeout: 210000,
                phantomPath: require('requireg')('phantomjs').path.replace('app.asar', 'app.asar.unpacked'),
                script: pathpdf.join(__dirname, 'node_modules/html-pdf-phantomjs-included/lib/scripts/pdf_a4_portrait.js').replace('app.asar', 'app.asar.unpacked').replace('\dist',''),
   
            };
            if (this.lenghtData > 300) {
                options = {
                    "height": "920px",
                    "width": "690px",
                    timeout: 500000 ,
                    phantomPath: require('requireg')('phantomjs').path.replace('app.asar', 'app.asar.unpacked'),
                    script: pathpdf.join(__dirname, 'node_modules/html-pdf-phantomjs-included/lib/scripts/pdf_a4_portrait.js').replace('app.asar', 'app.asar.unpacked').replace('\dist',''),
   
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