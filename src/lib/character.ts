'use client'
import { useRouter } from '@/i18n/routing';
import { selectedCharacterIdAtom } from '@/store/action';
import { useLiveQuery } from 'dexie-react-hooks';
import { get, omit } from 'es-toolkit/compat';
import { saveAs } from 'file-saver';
import { useAtom } from 'jotai';
import { useTranslations } from 'next-intl';
import { default as text } from 'png-chunk-text';
import { default as encode } from 'png-chunks-encode';
import extract from 'png-chunks-extract';
import { useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { v7 as uuidv7 } from 'uuid';
import { CharacterTable, RegexScriptsTable } from '../db/schema';
import { useGetCharacterBook } from './worldbook';
import { useDB } from '@/components/db-provider';

export function useAllCharacterLists() {
  const db = useDB()
  return useLiveQuery(() =>
    db.character.toArray().then((row) =>
      row.map(({ id, name, cover, data }) => ({
        id,
        name,
        cover,
        creator: data.creator,
        character_version: data.character_version,
      })),
    ),
    [db]);
}

export function useCharacter() {
  const db = useDB()
  return useCallback((cid: number) => {
    try {
      const rows = db.character.get(cid).then((row) => {
        if (row) {
          return row;
        }
      });
      return rows;
    } catch (e) {
      throw e;
    }
  }, [db])
}

export function useCharacterField() {
  const db = useDB()
  return useCallback(async (cid: number, field: string) => {
    try {
      const rows = await db.character.get(cid);
      if (rows) {
        return get(rows, field);
      }
    } catch (e) {
      throw e;
    }
  }, [db])
}

export function useAddCharacter() {
  const db = useDB()
  return useCallback(async (name: string, cover: string) => {
    try {
      const rows = await db.character.add({
        cover: cover,
        name: name,
        description: '',
        personality: '',
        scenario: '',
        first_mes: '',
        mes_example: '',
        spec: '',
        spec_version: '',
        data: {
          name: name,
          description: '',
          personality: '',
          scenario: '',
          first_mes: '',
          mes_example: '',
          creator_notes: '',
          system_prompt: '',
          post_history_instructions: '',
          alternate_greetings: [],
          tags: [],
          creator: '',
          character_version: '',
          extensions: [],
        },
      });
    } catch (e) {
      throw e;
    }

  }, [db])
}

export function useAddCharacterGreetings(){
  const db = useDB();
  const updateCharacter = useUpdateCharacter()
  return useCallback(async (id: number) =>{
    try {
      const lists = await db.character.get(id).then((list) => {
        if (list) {
          return list.data.alternate_greetings;
        }
      });
      if (lists) {
        const newGreetings = [...lists, ''];
        updateCharacter(id, 'data.alternate_greetings', newGreetings);
      }
    } catch (e) {
      throw e;
    }
  },[db, updateCharacter])
}

export function useDeleteCharacter(){
  const db = useDB()
  return useCallback(async(id: number) =>{
    try {
      const row = await db.character.delete(id);
    } catch (e) {
      throw e;
    }
  },[db])
}

export function useDeleteCharacterGreetings(){
  const db = useDB()
  const updateCharacter = useUpdateCharacter()
  return useCallback(async(id: number, index:number) =>{
    try {
      const lists = await db.character.get(id).then((list) => {
        if (list) {
          return list.data.alternate_greetings;
        }
      });
      if (lists) {
        const newGreetings = [...lists];
        newGreetings.splice(index, 1);
        updateCharacter(id, 'data.alternate_greetings', newGreetings);
      }
    } catch (e) {
      throw e;
    }
  },[db, updateCharacter])
}

export function useUpdateSpecV1Character(){
  const db = useDB()
  return useCallback(async (id: number, field: keyof CharacterTable, value: any) => {
    try {
      const rows = await db.character.update(id, {
        [field]: value,
        [`data.${field}`]: value,
      });
      return rows;
    } catch (e) {
      throw e;
    }
  },[db])
}

export function useUpdateCharacter(){
  const db = useDB()
  return useCallback(async(id: number, field: string, value: any) => {
    try {
      const rows = await db.character.update(id, { [field]: value });
      return rows;
    } catch (e) {
      throw e;
    }
  },[db])
}

export function useUpdateCharacterGreeting(){
  const db = useDB()
  return useCallback(async (id: number, index: number, value: string) => {
    try {
      const rows = await db.character.update(id, {
        [`data.alternate_greetings.${index}`]: value,
      });
    } catch (e) {
      throw e;
    }
  }, [db])
}

export function useImportCharacters(){
  const db = useDB()
  return useCallback(()=>{
    const handleSelectFile = () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.png';
      input.multiple = true;

      input.onchange = async (event: any) => {
        const files = event.target.files;
        if (!files || files.length === 0) return console.warn('No files selected');

        const filePromises = Array.from(files).map((file: any) => {
          return new Promise<void>(async (resolve, reject) => {
            if (!file.type.startsWith('image/png')) {
              console.warn('Invalid file type', file.name);
              return resolve();
            }

            try {
              const base64Image = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(file);
              });

              const arrayBuffer = await file.arrayBuffer();
              const tEXtChunks = extract(new Uint8Array(arrayBuffer)).filter(
                (chunk: { name: string }) => chunk.name === 'tEXt',
              );

              if (!tEXtChunks.length) return console.warn(`No tEXt chunks found in ${file.name}`);

              const charaText = text.decode(tEXtChunks[0].data)?.text;
              if (!charaText) return console.warn(`No character data found in ${file.name}`);

              const c = JSON.parse(
                new TextDecoder('utf-8').decode(
                  Uint8Array.from(atob(charaText), (c) => c.charCodeAt(0)),
                ),
              );

              if (base64Image && c) {
                const character = {
                  cover: base64Image,
                  name: c.name,
                  description: c.description,
                  personality: c.personality,
                  scenario: c.scenario,
                  first_mes: c.first_mes,
                  mes_example: c.mes_example,
                  spec: c.spec,
                  spec_version: c.spec_version,
                  data: {
                    name: c.data.name,
                    description: c.data.description,
                    personality: c.data.personality,
                    scenario: c.data.scenario,
                    first_mes: c.data.first_mes,
                    mes_example: c.data.mes_example,
                    creator_notes: c.data.creator_notes,
                    system_prompt: c.data.system_prompt,
                    post_history_instructions: c.data.post_history_instructions,
                    alternate_greetings: c.data.alternate_greetings,
                    tags: c.data.tags,
                    creator: c.data.creator,
                    character_version: c.data.character_version,
                    extensions: c.data.extensions,
                  },
                };
                const rows = await db.character.add(character);
                if (!rows) return;
                toast.success('Added Character: ' + character.name, {
                  id: 'IMPORT_CHARACTER_NAME',
                });
              }

              if (c.data.character_book) {
                const characterBook = {
                  name: c.data.character_book.name,
                  description: c.data.character_book.description,
                  scan_depth: c.data.character_book.scan_depth,
                  token_budget: c.data.character_book.token_budget,
                  recursive_scanning: c.data.character_book.recursive_scanning,
                  extensions: c.data.character_book.extensions,
                  entries: c.data.character_book.entries,
                };
                const rows = await db.characterBook.add(characterBook);
                if (!rows) return;
                toast.success(characterBook.name, {
                  id: 'IMPORT_CHARACTER_BOOK',
                });
              }

              if (c.data.extensions.regex_scripts) {
                const regex = c.data.extensions.regex_scripts.map((item: RegexScriptsTable) => {
                  return {
                    uuid: uuidv7(),
                    scriptName: item.scriptName,
                    findRegex: item.findRegex,
                    replaceString: item.replaceString,
                    trimStrings: item.trimStrings,
                    placement: item.placement,
                    disabled: item.disabled,
                    markdownOnly: item.markdownOnly,
                    promptOnly: item.promptOnly,
                    runOnEdit: item.runOnEdit,
                    substituteRegex: item.substituteRegex,
                    minDepth: item.minDepth,
                    maxDepthL: item.maxDepth,
                  };
                });
                const rows = await db.regexScripts.bulkAdd(regex as RegexScriptsTable[]);
                if (!rows) return;
                toast.success('Added Regex Scripts', {
                  id: 'IMPORT_CHARACTER_REGEX',
                });
              }
              resolve();
            } catch (error) {
              console.error('Error processing the PNG file:', error);
              reject(error);
            }
          });
        });

        try {
          await Promise.all(filePromises);
          toast.success('All characters have been imported successfully!');
        } catch (error) {
          toast.error('There was an error importing some characters.');
        }
      };

      input.click(); // Trigger the file input dialog
    };

    handleSelectFile(); // Invoke the file selection function

  },[db])
}

export function useImportCharacter(){
  const db = useDB();
  return useCallback(()=>{
    const handleSelectFile = () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.png';
      input.onchange = async (event: any) => {
        const file = event.target.files?.[0];
        if (!file || !file.type.startsWith('image/png')) return console.warn('Invalid file');

        try {
          const base64Image = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });

          const arrayBuffer = await file.arrayBuffer();
          const tEXtChunks = extract(new Uint8Array(arrayBuffer)).filter(
            (chunk: { name: string }) => chunk.name === 'tEXt',
          );

          if (!tEXtChunks.length) return console.warn('No tEXt chunks found');

          const charaText = text.decode(tEXtChunks[0].data)?.text;
          if (!charaText) return console.warn('No character data found');

          const c = JSON.parse(
            new TextDecoder('utf-8').decode(Uint8Array.from(atob(charaText), (c) => c.charCodeAt(0))),
          );
          if (base64Image && c) {
            const character = {
              cover: base64Image,
              name: c.name,
              description: c.description,
              personality: c.personality,
              scenario: c.scenario,
              first_mes: c.first_mes,
              mes_example: c.mes_example,
              spec: c.spec,
              spec_version: c.spec_version,
              data: {
                name: c.data.name,
                description: c.data.description,
                personality: c.data.personality,
                scenario: c.data.scenario,
                first_mes: c.data.first_mes,
                mes_example: c.data.mes_example,
                creator_notes: c.data.creator_notes,
                system_prompt: c.data.system_prompt,
                post_history_instructions: c.data.post_history_instructions,
                alternate_greetings: c.data.alternate_greetings,
                tags: c.data.tags,
                creator: c.data.creator,
                character_version: c.data.character_version,
                extensions: c.data.extensions,
              },
            };
            if (character) {
              const rows = await db.character.add(character);
              if (!rows) return;
              toast.success('Add it Character' + character.name, {
                id: 'IMPORT_CHARACTER_NAME',
              });
            }

            if (c.data.character_book) {
              const characterBook = {
                name: c.data.character_book.name,
                descripton: c.data.character_book.description,
                scan_depth: c.data.character_book.scan_depth,
                token_budget: c.data.character_book.token_budget,
                recursive_scanning: c.data.character_book.recursive_scanning,
                extensions: c.data.character_book.extensions,
                entries: c.data.character_book.entries,
              };
              const rows = await db.characterBook.add(characterBook);
              if (!rows) return;
              toast.success('Add it CharacterBook' + characterBook.name, {
                id: 'IMPORT_CHARACTER_BOOK',
              });
            }
            if (c.data.extensions.regex_scripts) {
              const regex = c.data.extensions.regex_scripts.map((item: RegexScriptsTable) => {
                return {
                  uuid: uuidv7(),
                  scriptName: item.scriptName,
                  findRegex: item.findRegex,
                  replaceString: item.replaceString,
                  trimStrings: item.trimStrings,
                  placement: item.placement,
                  disabled: item.disabled,
                  markdownOnly: item.markdownOnly,
                  promptOnly: item.promptOnly,
                  runOnEdit: item.runOnEdit,
                  substituteRegex: item.substituteRegex,
                  minDepth: item.minDepth,
                  maxDepthL: item.maxDepth,
                };
              });
              const rows = db.regexScripts.bulkAdd(regex as RegexScriptsTable[]);
              if (!rows) return;
              toast.success('Add it' + regex.scriptName, {
                id: 'IMPORT_CHARACTER_REGEX',
              });
            }
          }
        } catch (error) {
          console.error('Error processing the PNG file:', error);
        }
      };
      input.click();
    };
    handleSelectFile();

  },[db])
}

export function useCopyCharacter(){
  const db = useDB()
  return useCallback(async (id: number)=>{
    try {
      const rows = await db.character.get(id);
      if (!rows) return;
      const char = omit(rows, ['id']);
      db.character.add(char);
      toast.success('OK');
    } catch (e) {
      console.log(e);
    }
  },[db])
}

export function useExportCharacter() {
  const db = useDB()
  const getCharacter = useCharacter()
  const getCharacterBook = useGetCharacterBook()
  return useCallback(async (cid: number, worldbookId?: string, regexId?: string[]) => {
    try {
      const c = await getCharacter(cid);
      if (!c) return;

      const characterData = {
        name: c.name,
        description: c.description,
        personality: c.personality,
        scenario: c.scenario,
        first_mes: c.first_mes,
        mes_example: c.mes_example,
        spec: 'chara_card_v2',
        spec_version: '2.0',
        data: {
          name: c.data.name,
          description: c.data.description,
          personality: c.data.personality,
          scenario: c.data.scenario,
          first_mes: c.data.first_mes,
          mes_example: c.data.mes_example,
          creator_notes: c.data.creator_notes,
          system_prompt: c.data.system_prompt,
          post_history_instructions: c.data.post_history_instructions,
          alternate_greetings: c.data.alternate_greetings,
          tags: c.data.tags,
          creator: c.data.creator,
          character_version: c.data.character_version,
          extensionsL: c.data.extensions,
        },
      };

      if (worldbookId && worldbookId != 'null') {
        const book = await getCharacterBook(Number(worldbookId));
        if (book) {
          const { id, ...bookWithoutId } = book;
          (characterData.data as any).character_book = bookWithoutId;
        }
      }

      if (regexId && regexId.length > 0) {
        const regexScripts = await db.regexScripts.bulkGet(regexId.map(Number));

        if (regexScripts && regexScripts.length > 0) {
          const formattedRegexScripts = regexScripts
            .filter((script) => script !== undefined)
            .map(({ id, uuid, ...rest }) => ({ id: uuid, ...rest }));

          if (!(characterData.data as any).extensions) {
            (characterData.data as any).extensions = {};
          }

          (characterData.data as any).extensions.regex_scripts = formattedRegexScripts;
        }
      }

      const base64Data = c.cover.replace(/^data:image\/\w+;base64,/, '');
      const imageBuffer = Buffer.from(base64Data, 'base64');
      const chunks = extract(imageBuffer);

      const filteredChunks = chunks.filter((chunk: { name: string }) => chunk.name !== 'tEXt');
      const charString = JSON.stringify(characterData);
      const base64EncodedData = Buffer.from(charString, 'utf8').toString('base64');

      filteredChunks.splice(-1, 0, text.encode('chara', base64EncodedData));
      const encodedBuffer = Buffer.from(encode(filteredChunks));
      const pngBase64 = encodedBuffer.toString('base64');
      const charBase64Data = `data:image/png;base64,${pngBase64}`;
      saveAs(new Blob([encodedBuffer], { type: 'image/png' }), `${characterData.name}.png`);
    } catch (e) {
      throw e;
    }

  }, [db, getCharacter, getCharacterBook])
}


export async function changeCharacterCover() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.png;.webp;.jpg;.jpeg;.avif';
  input.onload = async (event: any) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
    } catch (e) {
      throw e;
    }
  };
  input.click();
}

export function usePageGuard() {
  const t = useTranslations();
  const router = useRouter();
  const [cid] = useAtom(selectedCharacterIdAtom);

  useEffect(() => {
    if (!cid) {
      toast.warning(t('selectCID'), {
        id: 'CHARACTER_PAGE_GUARD',
      });
      router.push('/workspaces/exhibit/character');
    }
  }, [cid, router, t]);
}
