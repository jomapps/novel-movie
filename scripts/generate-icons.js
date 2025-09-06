#!/usr/bin/env node

/**
 * Icon Generation Script
 * 
 * This script generates PNG versions of SVG icons for better browser compatibility.
 * It uses sharp for high-quality image conversion.
 * 
 * Usage: node scripts/generate-icons.js
 */

import sharp from 'sharp'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const publicDir = join(__dirname, '..', 'public')

const icons = [
  { name: 'icon', size: 32 },
  { name: 'icon-192', size: 192 },
  { name: 'icon-512', size: 512 },
  { name: 'apple-icon', size: 180 },
]

async function generateIcons() {
  console.log('🎬 Generating PNG icons from SVG sources...')
  
  for (const icon of icons) {
    const svgPath = join(publicDir, `${icon.name}.svg`)
    const pngPath = join(publicDir, `${icon.name}.png`)
    
    if (!existsSync(svgPath)) {
      console.warn(`⚠️  SVG source not found: ${svgPath}`)
      continue
    }
    
    try {
      const svgBuffer = readFileSync(svgPath)
      
      await sharp(svgBuffer)
        .resize(icon.size, icon.size)
        .png({
          quality: 100,
          compressionLevel: 9,
          adaptiveFiltering: true,
        })
        .toFile(pngPath)
      
      console.log(`✅ Generated ${icon.name}.png (${icon.size}x${icon.size})`)
    } catch (error) {
      console.error(`❌ Failed to generate ${icon.name}.png:`, error.message)
    }
  }
  
  console.log('🎉 Icon generation complete!')
}

// Check if sharp is available
try {
  await import('sharp')
  await generateIcons()
} catch (error) {
  console.log('📦 Sharp not found. Install it for PNG generation:')
  console.log('   npm install sharp --save-dev')
  console.log('')
  console.log('ℹ️  SVG icons will work fine without PNG versions.')
  console.log('   PNG versions provide better compatibility with older browsers.')
}
