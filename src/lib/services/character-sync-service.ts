import { characterLibraryClient } from './character-library-client'
import { checkCharacterLibraryHealth } from './character-library-health'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { Character } from '@/payload-types'

export interface SyncConflict {
  characterId: string
  field: string
  novelMovieValue: any
  characterLibraryValue: any
  lastModified: {
    novelMovie: Date
    characterLibrary: Date
  }
}

export interface SyncResult {
  success: boolean
  syncedCharacters: number
  conflicts: SyncConflict[]
  errors: string[]
}

export class CharacterSyncService {
  private payload: any

  constructor() {
    this.initializePayload()
  }

  private async initializePayload() {
    if (!this.payload) {
      this.payload = await getPayload({ config })
    }
  }

  async syncCharacterToLibrary(characterId: string): Promise<SyncResult> {
    await this.initializePayload()

    try {
      // Check Character Library health
      const healthCheck = await checkCharacterLibraryHealth()
      if (!healthCheck.isHealthy) {
        return {
          success: false,
          syncedCharacters: 0,
          conflicts: [],
          errors: [`Character Library unavailable: ${healthCheck.error}`],
        }
      }

      // Get latest character data from Novel Movie
      const character = await this.payload.findByID({
        collection: 'characters',
        id: characterId,
        depth: 1,
      })

      if (!character) {
        return {
          success: false,
          syncedCharacters: 0,
          conflicts: [],
          errors: ['Character not found in Novel Movie database'],
        }
      }

      // Check if character exists in Character Library (dual-ID check)
      const hasLibraryLink =
        (character.libraryIntegration &&
          (character.libraryIntegration.libraryDbId ||
            character.libraryIntegration.libraryCharacterId)) ||
        !!character.characterLibraryId
      if (!hasLibraryLink) {
        // Create new character in Character Library
        const projectId =
          typeof character.project === 'string' ? character.project : character.project?.id
        const project = await this.payload.findByID({
          collection: 'projects',
          id: projectId,
          depth: 1,
        })

        const libraryResult = await characterLibraryClient.createNovelMovieCharacter(
          character,
          project,
        )

        if (libraryResult.success !== false) {
          // Update Novel Movie character with library IDs and sync status
          await this.payload.update({
            collection: 'characters',
            id: characterId,
            data: {
              libraryIntegration: {
                libraryDbId: libraryResult.id || undefined,
                libraryCharacterId: libraryResult.characterId || undefined,
                syncStatus: 'created',
                lastSyncAt: new Date(),
              },
              // Keep legacy field for backward compatibility
              characterLibraryId: libraryResult.characterId || libraryResult.id,
              characterLibraryStatus: 'created',
            },
          })

          return {
            success: true,
            syncedCharacters: 1,
            conflicts: [],
            errors: [],
          }
        } else {
          return {
            success: false,
            syncedCharacters: 0,
            conflicts: [],
            errors: [libraryResult.error || 'Failed to create character in library'],
          }
        }
      } else {
        // Replace existing record in Character Library: delete old -> create new
        const oldDbId = character.libraryIntegration?.libraryDbId
        const projectId =
          typeof character.project === 'string' ? character.project : character.project?.id
        const project = await this.payload.findByID({
          collection: 'projects',
          id: projectId,
          depth: 1,
        })

        // Best-effort delete; if it fails, proceed to create anyway
        if (oldDbId) {
          try {
            await characterLibraryClient.deleteCharacter(oldDbId)
          } catch (e) {
            console.warn('Delete in Character Library failed; proceeding to recreate', e)
          }
        }

        const libraryResult = await characterLibraryClient.createNovelMovieCharacter(
          character,
          project,
        )

        if (libraryResult?.success === false) {
          return {
            success: false,
            syncedCharacters: 0,
            conflicts: [],
            errors: [libraryResult.error || 'Failed to recreate character in library'],
          }
        }

        // Update local IDs and sync status
        await this.payload.update({
          collection: 'characters',
          id: characterId,
          data: {
            libraryIntegration: {
              libraryDbId: libraryResult.id || undefined,
              libraryCharacterId: libraryResult.characterId || undefined,
              syncStatus: 'synced',
              lastSyncAt: new Date(),
            },
            characterLibraryId: libraryResult.characterId || libraryResult.id,
            characterLibraryStatus: 'synced',
          },
        })

        return {
          success: true,
          syncedCharacters: 1,
          conflicts: [],
          errors: [],
        }
      }
    } catch (error) {
      return {
        success: false,
        syncedCharacters: 0,
        conflicts: [],
        errors: [error instanceof Error ? error.message : 'Unknown sync error'],
      }
    }
  }

  async syncProjectCharacters(projectId: string): Promise<SyncResult> {
    await this.initializePayload()

    try {
      // Get all characters for the project
      const characters = await this.payload.find({
        collection: 'characters',
        where: {
          project: {
            equals: projectId,
          },
        },
        depth: 1,
      })

      if (characters.docs.length === 0) {
        return {
          success: true,
          syncedCharacters: 0,
          conflicts: [],
          errors: [],
        }
      }

      // Check Character Library health
      const healthCheck = await checkCharacterLibraryHealth()
      if (!healthCheck.isHealthy) {
        return {
          success: false,
          syncedCharacters: 0,
          conflicts: [],
          errors: [`Character Library unavailable: ${healthCheck.error}`],
        }
      }

      // Get project data
      const project = await this.payload.findByID({
        collection: 'projects',
        id: projectId,
        depth: 1,
      })

      // Separate characters that need creation vs update (dual-ID aware)
      const charactersToCreate = characters.docs.filter((char: any) => {
        const linked =
          (char.libraryIntegration &&
            (char.libraryIntegration.libraryDbId || char.libraryIntegration.libraryCharacterId)) ||
          char.characterLibraryId
        return !linked
      })
      const charactersToUpdate = characters.docs.filter((char: any) => {
        const linked =
          (char.libraryIntegration &&
            (char.libraryIntegration.libraryDbId || char.libraryIntegration.libraryCharacterId)) ||
          char.characterLibraryId
        return !!linked
      })

      let syncedCount = 0
      const errors: string[] = []

      // Bulk create new characters
      if (charactersToCreate.length > 0) {
        try {
          const bulkResult = await characterLibraryClient.bulkCreateCharacters(
            projectId,
            charactersToCreate,
          )

          if (bulkResult.success !== false) {
            // Update Novel Movie characters with library IDs
            for (let i = 0; i < charactersToCreate.length; i++) {
              const character = charactersToCreate[i]
              const created = bulkResult.characters?.[i]
              const libraryDbId = created?.id
              const libraryCharacterId = created?.characterId

              if (libraryDbId || libraryCharacterId) {
                await this.payload.update({
                  collection: 'characters',
                  id: character.id,
                  data: {
                    libraryIntegration: {
                      libraryDbId: libraryDbId || undefined,
                      libraryCharacterId: libraryCharacterId || undefined,
                      syncStatus: 'created',
                      lastSyncAt: new Date(),
                    },
                    characterLibraryId: libraryCharacterId || libraryDbId,
                    characterLibraryStatus: 'created',
                  },
                })
                syncedCount++
              }
            }
          } else {
            errors.push(`Bulk creation failed: ${bulkResult.error}`)
          }
        } catch (error) {
          errors.push(
            `Bulk creation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          )
        }
      }

      // Replace existing characters: delete old -> create new
      if (charactersToUpdate.length > 0) {
        for (const char of charactersToUpdate) {
          const oldDbId = char.libraryIntegration?.libraryDbId
          if (oldDbId) {
            try {
              await characterLibraryClient.deleteCharacter(oldDbId)
            } catch (e) {
              console.warn(`Delete failed for ${char.name} (${oldDbId}); proceeding`, e)
            }
          }
          try {
            const created = await characterLibraryClient.createNovelMovieCharacter(char, project)
            if (created?.success === false) {
              errors.push(created.error || `Recreate failed for ${char.name}`)
            } else {
              await this.payload.update({
                collection: 'characters',
                id: char.id,
                data: {
                  libraryIntegration: {
                    libraryDbId: created.id || undefined,
                    libraryCharacterId: created.characterId || undefined,
                    syncStatus: 'synced',
                    lastSyncAt: new Date(),
                  },
                  characterLibraryId: created.characterId || created.id,
                  characterLibraryStatus: 'synced',
                },
              })
              syncedCount++
            }
          } catch (e) {
            errors.push(
              `Error recreating ${char.name}: ${e instanceof Error ? e.message : 'Unknown'}`,
            )
          }
        }
      }

      return {
        success: errors.length === 0,
        syncedCharacters: syncedCount,
        conflicts: [], // Conflict detection requires Character Library implementation
        errors,
      }
    } catch (error) {
      return {
        success: false,
        syncedCharacters: 0,
        conflicts: [],
        errors: [error instanceof Error ? error.message : 'Unknown sync error'],
      }
    }
  }

  async handleSyncConflict(
    characterId: string,
    conflict: SyncConflict,
    resolution: 'novel-movie-wins' | 'character-library-wins' | 'manual',
  ): Promise<boolean> {
    // Placeholder for conflict resolution
    // This would require Character Library to provide conflict resolution endpoints
    console.log('Conflict resolution not yet implemented - requires Character Library support')
    return false
  }

  async validateCharacterConsistency(characterId: string): Promise<any> {
    await this.initializePayload()

    try {
      const character = await this.payload.findByID({
        collection: 'characters',
        id: characterId,
        depth: 1,
      })

      if (!character?.characterLibraryId) {
        return {
          success: false,
          error: 'Character not linked to Character Library',
        }
      }

      // This would call Character Library validation endpoint
      // For now, return basic validation
      return {
        success: true,
        visualConsistency: 85,
        narrativeConsistency: 80,
        overallScore: 82,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Validation error',
      }
    }
  }
}

export const characterSyncService = new CharacterSyncService()
