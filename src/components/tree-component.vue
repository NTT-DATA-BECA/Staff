<template>
    <ul id="explorer" class="explorer tree-item-node-parent">
        <li v-for="treeViewItem in items" 
            :key="treeViewItem.id" 
            :id="treeViewItem.id"
            class="tree-item-node"
            >
            <treeview-item class="pointer tree-view-item" 
                :item="treeViewItem"
                :parent="parent"
                :treeState="treeState"
                @contextmenu.prevent="$emit('onContextMenu', { item: treeViewItem, event: $event })">
                <template v-slot:expander><slot name="item-expander" v-bind="treeViewItem"></slot></template>
            </treeview-item>
            
            <div class="node-child hide"
                :class="{'hide-guidelines': hideGuideLines, 'nested': parent != null, 'root': parent == null}" 
                v-if="treeViewItem.children && treeViewItem.children.length > 0">
                    <tree-view :items="treeViewItem.children"
                        :hideGuideLines="hideGuideLines"
                        :parent="treeViewItem"
                        :treeState="treeState"
                       >
                        <template v-for="(_, slot) of $slots" v-slot:[slot]="props">
                            <slot :name="slot" v-bind="props"/>
                        </template>
                    </tree-view>
            </div>
        </li>
    </ul>
</template>
<script src="../Tree/tree-component.ts" lang="ts" />   