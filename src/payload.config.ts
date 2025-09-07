// storage-adapter-import-placeholder
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Projects } from './collections/Projects'
import { MovieFormats } from './collections/MovieFormats'
import { MovieStyles } from './collections/MovieStyles'
import { Series } from './collections/Series'

import { Stories } from './collections/Stories'
import StoryStructures from './collections/StoryStructures'
import { CharacterReferences } from './collections/CharacterReferences'
import { FundamentalData } from './collections/FundamentalData'
import { Genres } from './collections/Genres'
import { AudienceDemographics } from './collections/AudienceDemographics'
import { ToneOptions } from './collections/ToneOptions'
import { CentralThemes } from './collections/CentralThemes'
import { MoodDescriptors } from './collections/MoodDescriptors'
import { CinematographyStyles } from './collections/CinematographyStyles'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    Users,
    Media,
    Projects,
    MovieFormats,
    MovieStyles,
    Series,

    Stories,
    StoryStructures,
    CharacterReferences,
    FundamentalData,
    Genres,
    AudienceDemographics,
    ToneOptions,
    CentralThemes,
    MoodDescriptors,
    CinematographyStyles,
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: mongooseAdapter({
    url: process.env.DATABASE_URI || '',
  }),
  sharp,
  plugins: [
    payloadCloudPlugin(),
    // storage-adapter-placeholder
  ],
})
