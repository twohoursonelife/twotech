import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import { createHead } from '@vueuse/head';
import './css/tippy.css';
// import 'tippy.js/themes/light.css'
import VueTippy from 'vue-tippy';
import App from './App.vue';

import * as Sentry from "@sentry/vue";

if (window.location.hostname.startsWith('edge')) {
  global.edge = true;
  global.staticPath = ROOT_PATH + 'static-edge';
} else {
  global.staticPath = ROOT_PATH + 'static';
}

// Create the Vue app instance
const app = createApp(App);

// Configure Tippy plugin
app.use(VueTippy, {
  theme: 'twotech',
  animateFill: false,
  animation: 'scale',
  duration: 100,
  distance: 3,
  hideOnClick: false,
});

const routes = [
  { path: '/', component: () => import('./components/ObjectBrowser.vue') },
  { path: '/not-found', component: () => import('./components/NotFound.vue') },
  { path: '/filter/:filter*', component: () => import('./components/ObjectBrowser.vue') },
  { path: '/letters', component: () => import('./components/RecipeForLetters.vue') },
  { path: '/versions', component: () => import('./components/ChangeLog.vue') },
  { path: '/versions/:id', component: () => import('./components/ChangeLog.vue') },
  { path: '/biomes/:id', component: () => import('./components/BiomeInspector.vue') },
  { path: '/:id/tech-tree', component: () => import('./components/TechTree.vue') },
  { path: '/:id/recipe', component: () => import('./components/Recipe.vue') },
  { path: '/:id', component: () => import('./components/ObjectInspector.vue'), props: true },
  { path: '/:catchAll(.*)', redirect: '/not-found' }, // Catch-all route for 404
];

// Set up routing
const router = createRouter({
  history: createWebHistory(ROOT_PATH),
  routes: routes,
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { x: 0, y: 0 };
  },
});

Sentry.init({
  app,
  dsn: "https://30058b6a4ad33eea2e51df7b70ba9e32@o4508150301065216.ingest.us.sentry.io/4508183709876224",
  integrations: [
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],
  // Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});

// Configure and use VueUse head plugin for meta info
const head = createHead();
app.use(head);

// Use the router in the app
app.use(router);

// Mount the app
app.mount('#app');
