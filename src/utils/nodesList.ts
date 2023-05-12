import { readonly } from 'vue'

export const nodesList = readonly([
    {
        name: "End",
        item: "end",
        color: 'gray',
        input: 1,
        output: 0,
    },
    {
        name: "Start",
        item: "start",
        input: 0,
        output: 1,
    },
    {
        name: "File Input",
        item: "file-input",
        input: 1,
        output: 1,

    },
    {
        name: "ImportCsv",
        item: "ImportCsv",
        input: 1,
        output: 1,
    },
    {
        name: "GeneratePdf",
        item: "Generatepdf",
        input: 1,
        output: 1,
    },
    {
        name: "Condition",
        item: "condition",
        input: 1,
        output: 3,
    }
]);