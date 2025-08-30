import { DBSchema, openDB } from 'idb'
import { CharacterBookTable, CharacterTable, GalleryTable, RegexScriptsTable } from './schema';

export interface CharacterEditorDBType extends DBSchema {
  character: {
    key: number;
    value: CharacterTable;
  };
  characterBook:{
    key: number;
    value: CharacterBookTable
  };
  regexScripts: {
    key: number;
    value: RegexScriptsTable
  };
  gallery: {
    key: number;
    value: GalleryTable
  }
}

async function prepareCharactDB() {
  console.log('prepare charact db')
  return openDB<CharacterEditorDBType>('OoC-CharacterEditor', 10, {
    upgrade(db) {
      db.createObjectStore('character', {
        autoIncrement: true,
        keyPath: 'id'
      })
      db.createObjectStore('characterBook',{
        autoIncrement: true,
        keyPath: 'id'
      })
      db.createObjectStore('regexScripts',{
        autoIncrement: true,
        keyPath: 'id'
      })
      db.createObjectStore('gallery',{
        autoIncrement: true,
        keyPath: 'id'
      })
    }
  })

}

export const db = await prepareCharactDB()