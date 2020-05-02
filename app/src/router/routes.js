const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout2.vue'),
    children: [
      {
        path: 'toonin',
        component: () => import('pages/TooninPage.vue')
      },
      {
        path: 'share',
        component: () => import('pages/SharePage.vue')
      },
      {
        path: 'chat',
        component: () => import('pages/ChatPage.vue')
      }
    ]
  }
]

// Always leave this as last one
if (process.env.MODE !== 'ssr') {
  routes.push({
    path: '*',
    component: () => import('pages/Error404.vue')
  })
}

export default routes
