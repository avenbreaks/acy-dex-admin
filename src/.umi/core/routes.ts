// @ts-nocheck
import React from 'react';
import { ApplyPluginsType, dynamic } from 'D:/ACY/acy-dex-admin/node_modules/umi/node_modules/@umijs/runtime';
import * as umiExports from './umiExports';
import { plugin } from './plugin';
import LoadingComponent from '@/components/PageLoading/index';

export function getRoutes() {
  const routes = [
  {
    "path": "/",
    "component": dynamic({ loader: () => import(/* webpackChunkName: 'layouts__BasicLayout' */'D:/ACY/acy-dex-admin/src/layouts/BasicLayout'), loading: LoadingComponent}),
    "Routes": [
      "src/pages/Authorized"
    ],
    "routes": [
      {
        "path": "/",
        "redirect": "/launchpad",
        "exact": true
      },
      {
        "path": "/launchpad",
        "name": "Launch",
        "hideChildrenInMenu": true,
        "routes": [
          {
            "path": "/launchpad",
            "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__LaunchPad__Index' */'D:/ACY/acy-dex-admin/src/pages/LaunchPad/Index'), loading: LoadingComponent}),
            "exact": true
          },
          {
            "path": "/launchpad/project/:projectId",
            "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__LaunchPad__LaunchpadProject' */'D:/ACY/acy-dex-admin/src/pages/LaunchPad/LaunchpadProject'), loading: LoadingComponent}),
            "exact": true
          }
        ]
      },
      {
        "path": "/launchmanager",
        "name": "Launch Manager",
        "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__LaunchManager' */'D:/ACY/acy-dex-admin/src/pages/LaunchManager'), loading: LoadingComponent}),
        "exact": true
      },
      {
        "path": "/transaction/:id?",
        "name": "Transaction",
        "hideInMenu": true,
        "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__Transaction__Index' */'D:/ACY/acy-dex-admin/src/pages/Transaction/Index'), loading: LoadingComponent}),
        "exact": true
      }
    ]
  }
];

  // allow user to extend routes
  plugin.applyPlugins({
    key: 'patchRoutes',
    type: ApplyPluginsType.event,
    args: { routes },
  });

  return routes;
}
