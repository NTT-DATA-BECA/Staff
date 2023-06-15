<template>
    <div>
      <vueTreeList
        :model="data"
        default-tree-node-name="new node"
        default-leaf-node-name="new leaf"
        v-bind:default-expanded="false"
      >
      </vueTreeList>
    </div>
  </template>
  <script>
  import { VueTreeList, Tree } from '../vueTree'
  export default {
    name: 'TreeComponent',
    components: {
      VueTreeList
    },
    data() {
      return {
        newTree: {},
        data: new Tree([
          {
            name: 'Years',
            id: 1,
            pid: 0,
            dragDisabled: true,
            addTreeNodeDisabled: true,
            addLeafNodeDisabled: true,
            editNodeDisabled: true,
            delNodeDisabled: true,
            children: [
              {
                name: '2023',
                id: 2,
                pid: 0,
                dragDisabled: true,
                addTreeNodeDisabled: true,
                addLeafNodeDisabled: true,
                editNodeDisabled: true,
                delNodeDisabled: true,
                children: [
                  {
                    name: 'flow',
                    id: 3,
                    pid: 0,
                    addLeafNodeDisabled: true,
                    editNodeDisabled: true,
                    delNodeDisabled: true,
                    addTreeNodeDisabled: true
                  }
                ]
              }
            ]
          }
        ])
      }
    }
  }
  </script>
  <style lang="less" rel="stylesheet/less">
  .vtl {
    .vtl-drag-disabled {
      background-color: white;
      &:hover {
        background-color: white;
      }
    }
    .vtl-disabled {
      background-color: white;
    }
  }
  </style>
  
  <style lang="less" rel="stylesheet/less" scoped>
  .icon {
    &:hover {
      cursor: pointer;
    }
  }
  
  .muted {
    color: gray;
    font-size: 80%;
  }
  </style>
  