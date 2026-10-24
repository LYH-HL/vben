import { createApp } from 'vue';
import { createPinia } from 'pinia';

// Element Plus 按需引入：组件与样式都走子路径。
// 不用 `from 'element-plus'` 的桶导入，否则整个组件库都会被打进包里。
import { ElContainer, ElAside, ElHeader, ElMain } from 'element-plus/es/components/container/index.mjs';
import { ElAvatar } from 'element-plus/es/components/avatar/index.mjs';
import { ElButton } from 'element-plus/es/components/button/index.mjs';
import { ElCard } from 'element-plus/es/components/card/index.mjs';
import { ElCheckbox } from 'element-plus/es/components/checkbox/index.mjs';
import { ElConfigProvider } from 'element-plus/es/components/config-provider/index.mjs';
import { ElDialog } from 'element-plus/es/components/dialog/index.mjs';
import { ElDropdown, ElDropdownItem, ElDropdownMenu } from 'element-plus/es/components/dropdown/index.mjs';
import { ElForm, ElFormItem } from 'element-plus/es/components/form/index.mjs';
import { ElIcon } from 'element-plus/es/components/icon/index.mjs';
import { ElInput } from 'element-plus/es/components/input/index.mjs';
import { ElInputNumber } from 'element-plus/es/components/input-number/index.mjs';
import { ElLink } from 'element-plus/es/components/link/index.mjs';
import { ElMenu, ElMenuItem } from 'element-plus/es/components/menu/index.mjs';
import { ElPagination } from 'element-plus/es/components/pagination/index.mjs';
import { ElSelect, ElOption } from 'element-plus/es/components/select/index.mjs';
import { ElSwitch } from 'element-plus/es/components/switch/index.mjs';
import { ElTable, ElTableColumn } from 'element-plus/es/components/table/index.mjs';
import { ElTag } from 'element-plus/es/components/tag/index.mjs';
// v-loading 指令（表格加载态）：以插件形式安装，只注册指令本身
import { ElLoading } from 'element-plus/es/components/loading/index.mjs';

// 样式同样按需：每个 entry 自带它依赖的样式（比如 table 会带上 scrollbar/tooltip）
import 'element-plus/es/components/container/style/css.mjs';
import 'element-plus/es/components/avatar/style/css.mjs';
import 'element-plus/es/components/button/style/css.mjs';
import 'element-plus/es/components/card/style/css.mjs';
import 'element-plus/es/components/checkbox/style/css.mjs';
import 'element-plus/es/components/config-provider/style/css.mjs';
import 'element-plus/es/components/dialog/style/css.mjs';
import 'element-plus/es/components/dropdown/style/css.mjs';
import 'element-plus/es/components/form/style/css.mjs';
import 'element-plus/es/components/icon/style/css.mjs';
import 'element-plus/es/components/input/style/css.mjs';
import 'element-plus/es/components/input-number/style/css.mjs';
import 'element-plus/es/components/link/style/css.mjs';
import 'element-plus/es/components/loading/style/css.mjs';
import 'element-plus/es/components/menu/style/css.mjs';
import 'element-plus/es/components/pagination/style/css.mjs';
import 'element-plus/es/components/select/style/css.mjs';
import 'element-plus/es/components/switch/style/css.mjs';
import 'element-plus/es/components/table/style/css.mjs';
import 'element-plus/es/components/tag/style/css.mjs';
import 'element-plus/es/components/message/style/css.mjs';
import 'element-plus/es/components/message-box/style/css.mjs';

import App from './App.vue';
import router from './router/index.js';

const components = [
  ElContainer,
  ElAside,
  ElHeader,
  ElMain,
  ElAvatar,
  ElButton,
  ElCard,
  ElCheckbox,
  ElConfigProvider,
  ElDialog,
  ElDropdown,
  ElDropdownItem,
  ElDropdownMenu,
  ElForm,
  ElFormItem,
  ElIcon,
  ElInput,
  ElInputNumber,
  ElLink,
  ElMenu,
  ElMenuItem,
  ElPagination,
  ElSelect,
  ElOption,
  ElSwitch,
  ElTable,
  ElTableColumn,
  ElTag,
];

const app = createApp(App);

for (const component of components) {
  app.component(component.name, component);
}

// 指令不走 app.component，必须用插件方式安装，否则模板里的 v-loading 不生效
app.use(ElLoading);

app.use(createPinia());
app.use(router);

// 语言包统一在 App.vue 的 el-config-provider 上设置
app.mount('#app');
