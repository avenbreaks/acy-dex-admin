// @ts-nocheck
import { Component } from 'react';
import { ApplyPluginsType } from 'umi';
import dva from 'dva';
// @ts-ignore
import createLoading from 'D:/ACY/acy-dex-admin/node_modules/dva-loading/dist/index.esm.js';
import { plugin, history } from '../core/umiExports';
import ModelGlobal0 from 'D:/ACY/acy-dex-admin/src/models/global.js';
import ModelList1 from 'D:/ACY/acy-dex-admin/src/models/list.js';
import ModelLogin2 from 'D:/ACY/acy-dex-admin/src/models/login.js';
import ModelMenu3 from 'D:/ACY/acy-dex-admin/src/models/menu.js';
import ModelProject4 from 'D:/ACY/acy-dex-admin/src/models/project.js';
import ModelSetting5 from 'D:/ACY/acy-dex-admin/src/models/setting.js';
import ModelTransaction6 from 'D:/ACY/acy-dex-admin/src/models/transaction.js';
import ModelUser7 from 'D:/ACY/acy-dex-admin/src/models/user.js';
import ModelProfile8 from 'D:/ACY/acy-dex-admin/src/pages/Profile/models/profile.js';

let app:any = null;

export function _onCreate(options = {}) {
  const runtimeDva = plugin.applyPlugins({
    key: 'dva',
    type: ApplyPluginsType.modify,
    initialValue: {},
  });
  app = dva({
    history,
    
    ...(runtimeDva.config || {}),
    // @ts-ignore
    ...(typeof window !== 'undefined' && window.g_useSSR ? { initialState: window.g_initialProps } : {}),
    ...(options || {}),
  });
  
  app.use(createLoading());
  (runtimeDva.plugins || []).forEach((plugin:any) => {
    app.use(plugin);
  });
  app.model({ namespace: 'global', ...ModelGlobal0 });
app.model({ namespace: 'list', ...ModelList1 });
app.model({ namespace: 'login', ...ModelLogin2 });
app.model({ namespace: 'menu', ...ModelMenu3 });
app.model({ namespace: 'project', ...ModelProject4 });
app.model({ namespace: 'setting', ...ModelSetting5 });
app.model({ namespace: 'transaction', ...ModelTransaction6 });
app.model({ namespace: 'user', ...ModelUser7 });
app.model({ namespace: 'profile', ...ModelProfile8 });
  return app;
}

export function getApp() {
  return app;
}

/**
 * whether browser env
 * 
 * @returns boolean
 */
function isBrowser(): boolean {
  return typeof window !== 'undefined' &&
  typeof window.document !== 'undefined' &&
  typeof window.document.createElement !== 'undefined'
}

export class _DvaContainer extends Component {
  constructor(props: any) {
    super(props);
    // run only in client, avoid override server _onCreate()
    if (isBrowser()) {
      _onCreate()
    }
  }

  componentWillUnmount() {
    let app = getApp();
    app._models.forEach((model:any) => {
      app.unmodel(model.namespace);
    });
    app._models = [];
    try {
      // 释放 app，for gc
      // immer 场景 app 是 read-only 的，这里 try catch 一下
      app = null;
    } catch(e) {
      console.error(e);
    }
  }

  render() {
    let app = getApp();
    app.router(() => this.props.children);
    return app.start()();
  }
}
