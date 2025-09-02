'use client'
import type { CharacterEditorDBType } from '@/db/character-db';
import { CharacterBookTable, CharacterTable, GalleryTable, RegexScriptsTable } from '@/db/schema'
import type { StoreNames, StoreValue } from 'idb';
import {create} from 'zustand'
import {set as update} from 'es-toolkit/compat'
import { omit, toMerged } from 'es-toolkit';
import {persist, createJSONStorage} from 'zustand/middleware'

type Store = {
  babyMode: boolean;
  setBabyMode: (b:boolean) => void;
  character: CharacterTable[];
  characterBook: CharacterBookTable[];
  regexScripts: RegexScriptsTable[];
  gallery: GalleryTable[];
  dbReady: boolean;
  init: () => Promise<void>;
  sync: (s: StoreNames<CharacterEditorDBType> | 'all') => Promise<void>;
  addEntity: (s: StoreNames<CharacterEditorDBType>, entity: Omit<StoreValue<CharacterEditorDBType, StoreNames<CharacterEditorDBType>>,'id'>) => Promise<number>;
  deleteEntity: (s: StoreNames<CharacterEditorDBType>,id: number) => Promise<void>;
  addCharacter: (c:Omit<CharacterTable, 'id'>) => Promise<number>;
  updateCharacter: (id: number, field: string, value: any) => Promise<void>;
  patchCharacter: (id: number, value: any) => Promise<void>;
  findCharacter: (id: number) => Promise<CharacterTable | undefined>;
  deleteCharacter: (id: number) => Promise<void>;
  duplicateCharacter: (id: number) => Promise<void>;
  addCharacterBook: (cb:Omit<CharacterBookTable, 'id'>) => Promise<number>;
  findCharacterBook: (id: number) => Promise<CharacterBookTable | undefined>;
  patchCharacterBook: (id: number, book: Partial<CharacterBookTable>) => Promise<void>;
  deleteCharacterBook: (id: number) => Promise<void>;
  batchDeleteCharacterBooks: (ids: number[]) => Promise<void>;
  addRegexScript: (r: Omit<RegexScriptsTable, 'id'>) => Promise<number>;
  batchFindRegexScript: (ids: number[]) => Promise<RegexScriptsTable[]>;
  deleteRegexScript: (id: number) => Promise<void>;
  batchDeleteRegexScripts: (ids: number[]) => Promise<void>;
  patchRegexScript:(id: number, script: Partial<RegexScriptsTable>) => Promise<void>;
  addGallery: (g: Omit<GalleryTable, 'id'>) => Promise<number>;
  deleteGallery: (id: number) => Promise<void>;
  findGallery:(id: number) => Promise<GalleryTable | undefined>;
  patchGallery: (id: number, gallery: Partial<GalleryTable>) => Promise<void>;
}

export const useCharacterEditorStore = create<Store>()(
  persist(
    (set, get) => ({
      babyMode: true,
      setBabyMode: (b) => {
        set({
          babyMode: b
        })
      },
      character: [],
      characterBook: [],
      regexScripts: [],
      gallery: [],
      dbReady: false,
      db: null,
      init: async () =>{
        await get().sync('all')
        set({
          dbReady: true
        })
      },
      sync: async (s: StoreNames<CharacterEditorDBType> | 'all') =>{
        const {db} = await import('@/db/character-db')
        if (s === 'all'){
          const cs = await db.getAll('character')
          const book = await db.getAll('characterBook')
          const regexs = await db.getAll('regexScripts')
          const g = await db.getAll('gallery')
          set({
            character: cs,
            characterBook: book,
            regexScripts: regexs,
            gallery: g
          })
        }else{
          const data = await db.getAll(s)
          set({
            [s]:data
          })
        }
      },
      addEntity: async (s: StoreNames<CharacterEditorDBType>, entity: Omit<StoreValue<CharacterEditorDBType, StoreNames<CharacterEditorDBType>>,'id'>) =>{
        const {db} = await import('@/db/character-db')
        const x = await db.add(s, entity as StoreValue<CharacterEditorDBType, StoreNames<CharacterEditorDBType>>)
        await get().sync(s) // just appended it to characters
        return x
      },
      deleteEntity: async (s: StoreNames<CharacterEditorDBType>, id: number) =>{
        const {db} = await import('@/db/character-db')
        const x = await db.delete(s,id)
        await get().sync(s)
        return x
      },
      addCharacter: async (c: Omit<CharacterTable, 'id'>) =>{
        return get().addEntity('character', c)
      },
      updateCharacter: async (id: number, field: string, value: any) => {
        const {db} = await import('@/db/character-db')
        const oldChar = await db.get('character', id)
        if (oldChar){
          const newChar = update(oldChar,field,value)
          await db.put('character',newChar,id)
        }
        await get().sync('character')
      },
      findCharacter: async (id: number) => {
        return get().character.find(c => c.id === id)
      },
      deleteCharacter: async(id: number) =>{
        return get().deleteEntity('character', id)
      },
      patchCharacter: async (id: number, value: any) =>{
        const {db} = await import('@/db/character-db')
        const oldChar = await db.get('character', id)
        if (oldChar){
          const newChar = toMerged(oldChar, value)
          await db.put('character',newChar,id)
        }
        await get().sync('character')
      },
      duplicateCharacter: async (id: number) =>{
        const c = await get().findCharacter(id)
        if (c){
          const newC = omit(c,['id'])
          await get().addCharacter(newC)
        }
      },
      addCharacterBook: async (cb: Omit<CharacterBookTable,'id'>) =>{
        return get().addEntity('characterBook', cb)
      },
      findCharacterBook: async (id: number) => {
        return get().characterBook.find(b => b.id === id) 
      },
      patchCharacterBook: async (id: number, book: Partial<CharacterBookTable>) =>{
        const {db} = await import('@/db/character-db')
        const cb = await db.get('characterBook', id)
        if (cb){
          const newBook = toMerged(cb, book)
          await db.put('characterBook', newBook, id)
        }
        await get().sync('characterBook')
      },
      deleteCharacterBook: async (id: number) =>{
        return get().deleteEntity('characterBook', id)
      },
      batchDeleteCharacterBooks: async (ids: number[])=>{
        return Promise.all(ids.map(async id => get().deleteCharacterBook(id))).then()
      },
      addRegexScript: async (r: Omit<RegexScriptsTable, 'id'>) =>{
        return get().addEntity('regexScripts', r)
      },
      batchFindRegexScript: async (ids: number[]) => {
        return get().regexScripts.filter(r => ids.indexOf(r.id) >= 0)
      },
      deleteRegexScript: async (id: number) =>{
        return get().deleteEntity('regexScripts', id)
      },
      batchDeleteRegexScripts: async (ids: number[]) =>{
        const p = ids.map(async id => await get().deleteRegexScript(id))
        return Promise.all(p).then()
      },
      patchRegexScript: async(id: number,script: Partial<RegexScriptsTable>) => {
        const {db} = await import('@/db/character-db')
        const regexScripts = await db.get('regexScripts', id)
        if (regexScripts){
          const newScript = toMerged(regexScripts, script)
          await db.put('regexScripts', newScript, id)
        }
        await get().sync('regexScripts')
      },
      addGallery: async (g: Omit<GalleryTable, 'id'>) =>{
        return get().addEntity('gallery', g)
      },
      deleteGallery: async (id: number) =>{
        return get().deleteEntity('gallery', id)
      },
      findGallery: async (id:number) =>{
        const {db} = await import('@/db/character-db')
        return db.get('gallery',id)
      },
      patchGallery: async (id: number, data: Partial<GalleryTable>) =>{
        const {db} = await import('@/db/character-db')
        const gallery = await db.get('gallery', id)
        if (gallery){
          const newGallery = toMerged(gallery, data )
          await db.put('gallery', newGallery,id)
        }
        await get().sync('gallery')
      }
    }),{
      name:'character-editor',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({babyMode: state.babyMode})
    }
  ))
