<template>
  <div class="home">
    Home screen
    <ul>
      <li v-for="(item, i) in list" :key="`list${i}`"> {{item.id}} || {{item.name}} </li>
     </ul>
    <div>
      <input type="text" v-model="playlistName" placeholder="Playlist name">
      <button @click="insertPlaylist">Add Playlist</button> <br/>
      <h3> Si vous voulez supprimer il suffit d'entrer id !</h3>
      <input type="text" v-model="updateName" placeholder="New name">     
      <input type="text" v-model="deleteId" placeholder="Playlist ID">
      <button @click="deletePlaylist">Delete Playlist</button><button @click="updatePlaylist">Update Playlist</button>
    </div>
  </div>
</template>

<script lang="ts">
interface MyData {
  id: number;
  name: string;
}

import { defineComponent } from 'vue'
import { getHome } from '../api/home'
import { IpcRenderer } from 'electron';

export default defineComponent({
  name: 'HomeView',
  inject: ['ipcRenderer'],
  mixins: [getHome],
  components: {},
  data() {
    return {
      list: [] as MyData[],
      playlistName: '',
      updateName: '',
      deleteId: '',
    }
  },
  async mounted() {
    await this.getHome()
  },
  methods: {
    async getHome() {
      const ipcRenderer = this.ipcRenderer as IpcRenderer;
      const result = await ipcRenderer.invoke('home')
      this.list = result
    },

    async insertPlaylist() {
      const ipcRenderer = this.ipcRenderer as IpcRenderer;
      await ipcRenderer.invoke('insert', { name: this.playlistName })
      this.playlistName = ''
      await this.getHome()
    },

    async updatePlaylist() {
      const ipcRenderer = this.ipcRenderer as IpcRenderer;
      await ipcRenderer.invoke('update', { id: this.deleteId, name: this.updateName })
      this.updateName = ''
      this.deleteId = ''
      await this.getHome()
    },

    async deletePlaylist() {
      const ipcRenderer = this.ipcRenderer as IpcRenderer;
      await ipcRenderer.invoke('delete', { id: this.deleteId })
      this.deleteId = ''
      await this.getHome()
    },
  },
})
</script>
<style>
button {
  margin: 10px;
}
input {
  margin: 10px;
}
</style>
