import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {VitePWA} from 'vite-plugin-pwa';

export default defineConfig({
  plugins:[
    react(),

    VitePWA({
      registerType:'autoUpdate',

      manifest:{
        name:'90 Days',
        short_name:'90 Days',
        description:'A 90-day personal growth tracker',
        theme_color:'#f5f4f0',
        background_color:'#f5f4f0',
        display:'standalone',
        start_url:'/',
        scope:'/',
        icons:[
          {
            src:'/favicon.png',
            sizes:'512x512',
            type:'image/png'
          },
          {
            src:'/favicon.png',
            sizes:'192x192',
            type:'image/png'
          }
        ]
      },

      workbox:{
        navigateFallback:'/index.html'
      }
    })
  ]
});