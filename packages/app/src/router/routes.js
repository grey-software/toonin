const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: 'toonin',
        component: () => import('pages/TooninPage.vue')
      },
      {
        path: 'share',
        component: () => import('pages/SharePage.vue')
      }
    ]
  }
]

export default routes
