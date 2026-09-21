import { defineConfig } from 'vite'
import Uni from '@dcloudio/vite-plugin-uni'
import path from 'node:path'

export default async () => {
  const UnoCSS = (await import('unocss/vite')).default

  return defineConfig({
    plugins: [
      Uni(),
      UnoCSS()
    ],
    resolve: {
      alias: {
        '@': path.join(process.cwd(), './src')
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
          silenceDeprecations: ['legacy-js-api']
        }
      }
    },
    server:{
      host:"0.0.0.0",
      port:5573
    }
  })
}
