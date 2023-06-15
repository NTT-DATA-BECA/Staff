/**
 * Created by ayou on 17/7/21.
 */

import VueTreeList from '../vueTree/VueTreeList'
import { Tree, TreeNode } from '../vueTree/Tree'

VueTreeList.install = Vue => {
  Vue.component(VueTreeList.name, VueTreeList)
}

export default VueTreeList
export { Tree, TreeNode, VueTreeList }
