<template>
    <v-select v-model="selectedOption" :options="files" label="name"
        class="mb-5 hover:bg-blue-200 rounded text-black-600 font-bold hover:text-blue-400"
        style="border: 2px solid white; border-radius: 5px;" @option:selected="onOptionSelected"></v-select>
</template>
<script>

import { ref } from 'vue'

import { ipcRenderer } from 'electron';

export default {

    name: 'FileSelect',



    props: {

        value: String

    },



    emits: ['input'],



    setup(props, { emit }) {

        const files = ref([]);

        const selectedOption = ref(props.value);



        const loadFiles = async () => {

            const response = await ipcRenderer.invoke('getQuillContentName');

            files.value = response;

        };



        const onOptionSelected = async () => {

            const selectedFile = selectedOption.value;

            const response = await ipcRenderer.invoke('getQuillContentData', { name: selectedFile });

            emit('input', selectedFile);

            emit('htmlData', response);

        };



        loadFiles();



        return {

            files,

            selectedOption,

            onOptionSelected

        };

    }

};

</script>