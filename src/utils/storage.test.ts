import { describe, it, expect, beforeEach, vi } from 'vitest'
import { makeId, loadIndex, saveIndex, loadSession, persistSession, emptySession, exportSession, importSession } from './storage'

describe('storage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('makeId', () => {
    it('generates a non-empty string', () => {
      const id = makeId()
      expect(id).toBeTruthy()
      expect(typeof id).toBe('string')
    })

    it('generates unique ids', () => {
      const ids = new Set()
      for (let i = 0; i < 100; i++) {
        ids.add(makeId())
      }
      expect(ids.size).toBe(100)
    })
  })

  describe('session index', () => {
    it('loadIndex returns empty array initially', () => {
      expect(loadIndex()).toEqual([])
    })

    it('saveIndex and loadIndex work round-trip', () => {
      const index = [{ id: 'test', title: 'Test', updatedAt: Date.now(), started: false }]
      saveIndex(index)
      expect(loadIndex()).toEqual(index)
    })
  })

  describe('session data', () => {
    it('emptySession returns valid structure', () => {
      const session = emptySession('test-id')
      expect(session.id).toBe('test-id')
      expect(session.chatMsgs).toEqual([])
      expect(session.roadmap).toBeNull()
      expect(session.logEntries).toEqual([])
      expect(session.started).toBe(false)
      expect(session.memory).toBeNull()
    })

    it('persistSession and loadSession work round-trip', () => {
      const session = emptySession('test-id')
      persistSession('test-id', session)
      const loaded = loadSession('test-id')
      expect(loaded).toEqual(session)
    })

    it('loadSession returns null for non-existent id', () => {
      expect(loadSession('nonexistent')).toBeNull()
    })
  })

  describe('export/import', () => {
    it('exportSession returns null for non-existent session', () => {
      expect(exportSession('nonexistent')).toBeNull()
    })

    it('exportSession returns valid json', () => {
      const session = emptySession('test-id')
      persistSession('test-id', session)
      const json = exportSession('test-id')
      expect(json).toBeTruthy()
      expect(() => JSON.parse(json!)).not.toThrow()
    })

    it('importSession creates new session with new id', () => {
      const session = emptySession('original-id')
      persistSession('original-id', session)
      const json = exportSession('original-id')!

      const meta = importSession(json)
      expect(meta).not.toBeNull()
      expect(meta!.id).not.toBe('original-id')
      expect(meta!.title).toBe('imported game')
    })

    it('importSession returns null for invalid json', () => {
      expect(importSession('not json')).toBeNull()
    })
  })
})
