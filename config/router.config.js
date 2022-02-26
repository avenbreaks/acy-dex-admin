/*
 * @Author: Doctor
 * @Date: 2021-09-29 22:07:58
 * @LastEditTime: 2021-10-18 18:30:54
 * @LastEditors: Doctor
 * @Description:
 * @FilePath: \acy-dex-interface\config\router.config.js
 * jianqiang
 */
export default [
  {
    path: '/',
    component: '../layouts/BasicLayout',
    Routes: ['src/pages/Authorized'],
    routes: [
      { path: '/', redirect: '/launchpad' },
      {
        path: '/launchpad',
        name: 'Launch',
        hideChildrenInMenu: true,
        routes: [
          {
            path: '/launchpad',
            component: './LaunchPad/Index',
          },
          {
            path: '/launchpad/project/:projectId',
            component: './LaunchPad/LaunchpadProject',
          },
          {
            path: '/launchpad/pending/project/:projectId',
            component: './LaunchPad/LaunchpadPendingProject',
          },
          {
            path: '/launchpad/applyProject',
            component: './LaunchPad/ApplicationForm',
          }
          ,
          {
            path: '/launchpad/applyProject/:projectId',
            component: './LaunchPad/ApplicationForm',
          }
        ],
      },
      {
        path: '/launchmanager',
        name: 'Launch Manager',
        component: './LaunchManager'
      },
      {
        path: '/transaction/:id?',
        name: 'Transaction',
        hideInMenu: true,
        component: './Transaction/Index',
      },
    ],
  },
];
