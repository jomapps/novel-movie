import { getPayload } from 'payload'
import config from '@payload-config'

// Import seed data
import movieFormatsData from '../../seed/movie-formats.json'
import movieStylesData from '../../seed/movie-styles.json'

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

    payload.logger.info('Database seeding completed successfully!')
    process.exit(0)
  } catch (error) {
    payload.logger.error('Error during database seeding:', error)
    process.exit(1)
  }
}

seed()
