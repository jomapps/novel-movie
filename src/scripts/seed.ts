import { getPayload } from 'payload'
import config from '@payload-config'

// Import seed data
import movieFormatsData from '../../seed/movie-formats.json'
import movieStylesData from '../../seed/movie-styles.json'
import genresData from '../../seed/genres.json'
import audienceDemographicsData from '../../seed/audience-demographics-simple.json'
import toneOptionsData from '../../seed/tone-options-simple.json'
import centralThemesData from '../../seed/central-themes-simple.json'
import moodDescriptorsData from '../../seed/mood-descriptors-simple.json'
import cinematographyStylesData from '../../seed/cinematography-styles-simple.json'

const seed = async (): Promise<void> => {
  // Get a local copy of Payload by passing your config
  const payload = await getPayload({ config })

  payload.logger.info('Starting database seeding...')

  try {
    // Seed Movie Formats
    payload.logger.info('Seeding movie formats...')
    for (const formatData of movieFormatsData) {
      const existing = await payload.find({
        collection: 'movie-formats',
        where: {
          slug: {
            equals: formatData.slug,
          },
        },
        limit: 1,
      })

      if (existing.docs.length === 0) {
        await payload.create({
          collection: 'movie-formats',
          data: formatData,
        })
        payload.logger.info(`Created movie format: ${formatData.name}`)
      } else {
        payload.logger.info(`Movie format already exists: ${formatData.name}`)
      }
    }

    // Seed Movie Styles
    payload.logger.info('Seeding movie styles...')
    for (const styleData of movieStylesData) {
      const existing = await payload.find({
        collection: 'movie-styles',
        where: {
          slug: {
            equals: styleData.slug,
          },
        },
        limit: 1,
      })

      if (existing.docs.length === 0) {
        await payload.create({
          collection: 'movie-styles',
          data: styleData,
        })
        payload.logger.info(`Created movie style: ${styleData.name}`)
      } else {
        payload.logger.info(`Movie style already exists: ${styleData.name}`)
      }
    }

    // Seed Genres
    payload.logger.info('Seeding genres...')
    for (const genreData of genresData) {
      const existing = await payload.find({
        collection: 'genres',
        where: {
          slug: {
            equals: genreData.slug,
          },
        },
        limit: 1,
      })

      if (existing.docs.length === 0) {
        await payload.create({
          collection: 'genres',
          data: genreData as any,
        })
        payload.logger.info(`Created genre: ${genreData.name}`)
      } else {
        payload.logger.info(`Genre already exists: ${genreData.name}`)
      }
    }

    // Seed Audience Demographics
    payload.logger.info('Seeding audience demographics...')
    for (const demographicData of audienceDemographicsData) {
      const existing = await payload.find({
        collection: 'audience-demographics',
        where: {
          slug: {
            equals: demographicData.slug,
          },
        },
        limit: 1,
      })

      if (existing.docs.length === 0) {
        await payload.create({
          collection: 'audience-demographics',
          data: demographicData as any,
        })
        payload.logger.info(`Created audience demographic: ${demographicData.name}`)
      } else {
        payload.logger.info(`Audience demographic already exists: ${demographicData.name}`)
      }
    }

    // Seed Tone Options
    payload.logger.info('Seeding tone options...')
    for (const toneData of toneOptionsData) {
      const existing = await payload.find({
        collection: 'tone-options',
        where: {
          slug: {
            equals: toneData.slug,
          },
        },
        limit: 1,
      })

      if (existing.docs.length === 0) {
        await payload.create({
          collection: 'tone-options',
          data: toneData as any,
        })
        payload.logger.info(`Created tone option: ${toneData.name}`)
      } else {
        payload.logger.info(`Tone option already exists: ${toneData.name}`)
      }
    }

    // Seed Central Themes
    payload.logger.info('Seeding central themes...')
    for (const themeData of centralThemesData) {
      const existing = await payload.find({
        collection: 'central-themes',
        where: {
          slug: {
            equals: themeData.slug,
          },
        },
        limit: 1,
      })

      if (existing.docs.length === 0) {
        await payload.create({
          collection: 'central-themes',
          data: themeData as any,
        })
        payload.logger.info(`Created central theme: ${themeData.name}`)
      } else {
        payload.logger.info(`Central theme already exists: ${themeData.name}`)
      }
    }

    // Seed Mood Descriptors
    payload.logger.info('Seeding mood descriptors...')
    for (const moodData of moodDescriptorsData) {
      const existing = await payload.find({
        collection: 'mood-descriptors',
        where: {
          slug: {
            equals: moodData.slug,
          },
        },
        limit: 1,
      })

      if (existing.docs.length === 0) {
        await payload.create({
          collection: 'mood-descriptors',
          data: moodData as any,
        })
        payload.logger.info(`Created mood descriptor: ${moodData.name}`)
      } else {
        payload.logger.info(`Mood descriptor already exists: ${moodData.name}`)
      }
    }

    // Seed Cinematography Styles
    payload.logger.info('Seeding cinematography styles...')
    for (const styleData of cinematographyStylesData) {
      const existing = await payload.find({
        collection: 'cinematography-styles',
        where: {
          slug: {
            equals: styleData.slug,
          },
        },
        limit: 1,
      })

      if (existing.docs.length === 0) {
        await payload.create({
          collection: 'cinematography-styles',
          data: styleData as any,
        })
        payload.logger.info(`Created cinematography style: ${styleData.name}`)
      } else {
        payload.logger.info(`Cinematography style already exists: ${styleData.name}`)
      }
    }

    payload.logger.info('Database seeding completed successfully!')
    process.exit(0)
  } catch (error) {
    payload.logger.error('Error during database seeding:', error)
    process.exit(1)
  }
}

seed()
