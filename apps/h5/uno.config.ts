import { defineConfig, presetUno, presetIcons } from 'unocss'

export default defineConfig({
  presets: [
    presetUno({ dark: 'class' }),
    presetIcons({ scale: 1.1 }),
  ],
  theme: {
    colors: {
      accent: 'var(--gg-accent)',
      fg: 'var(--gg-fg)',
      muted: 'var(--gg-muted)',
      border: 'var(--gg-border)',
    },
  },
})
