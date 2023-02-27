import { ipcRenderer } from 'electron'

export const getHome = {
  methods: {
    async getHome() {
      return await ipcRenderer.invoke('home')
    },

    async insertPlaylist(name:any) {
      await ipcRenderer.invoke('insert', { name })
    },

    async updatePlaylist(id:any, name:any) {
      await ipcRenderer.invoke('update', { id, name })
    },

    async deletePlaylist(id:any) {
      await ipcRenderer.invoke('delete', { id })
    },
  },
}
