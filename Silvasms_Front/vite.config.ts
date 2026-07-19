import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'


function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

// Figma Make source ships versioned bare specifiers like 'sonner@2.0.3' or
// '@radix-ui/react-slot@1.1.2'. Standard npm/Vite resolution has no concept
// of an inline version suffix, so strip it and resolve the plain package.
function versionedImportResolver() {
  const versionedPattern = /^((?:@[^/]+\/)?[^@/]+)@\d+\.\d+\.\d+[\w.-]*$/
  return {
    name: 'versioned-import-resolver',
    async resolveId(id, importer) {
      const match = id.match(versionedPattern)
      if (match) {
        const resolved = await this.resolve(match[1], importer, { skipSelf: true })
        return resolved
      }
    },
  }
}

export default defineConfig({
  plugins: [
    figmaAssetResolver(),
    versionedImportResolver(),
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src/app'),
    },
  },
})
