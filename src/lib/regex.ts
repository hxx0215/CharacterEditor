'use client'
import { useCharacterEditorStore } from '@/components/store';
import saveAs from 'file-saver';
import { useCallback } from 'react';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

const regexScriptsTableSchema = z.object({
  id: z.string(),
  scriptName: z.string(),
  findRegex: z.string(),
  replaceString: z.string(),
  trimStrings: z.array(z.string()),
  placement: z.array(z.number()),
  disabled: z.boolean(),
  markdownOnly: z.boolean(),
  promptOnly: z.boolean(),
  runOnEdit: z.boolean(),
  substituteRegex: z.boolean(),
  minDepth: z.union([z.number(), z.null()]),
  maxDepth: z.union([z.number(), z.null()]),
});

export function useGetAllRegexScriptLists(){
  // const db = useDB()
  const regexScripts = useCharacterEditorStore(s => s.regexScripts)
  return useCallback(()=>{
    return regexScripts.map(({id, uuid, scriptName}) =>({
      id,
      uuid,
      scriptName
    }))
    // const rows = useLiveQuery(() =>
    //   db.regexScripts.toArray().then((row) =>
    //     row.map(({ id, uuid, scriptName }) => ({
    //       id,
    //       uuid,
    //       scriptName,
    //     })),
    //   ),
    // );
    // return rows;
  },[regexScripts])
}

export function useGetRegexScript(){
  // const db = useDB()
  const regexScripts = useCharacterEditorStore(s => s.regexScripts)
  return useCallback((id: number)=>{
    return regexScripts.find(r => r.id === id)
    // try {
    //   const rows = db.regexScripts.get(id).then((row) => {
    //     if (row) {
    //       return row;
    //     }
    //   });
    //   return rows;
    // } catch (e) {
    //   throw e;
    // }
  },[regexScripts])
}

export function useAddRegexScript(){
  const addRegexScript = useCharacterEditorStore(s => s.addRegexScript)
  return useCallback(async (scriptName: string)=>{
    const rows = await addRegexScript({
      uuid: uuidv4(),
      scriptName: scriptName,
      findRegex: '',
      replaceString: '',
      trimStrings: [],
      placement: [],
      disabled: false,
      markdownOnly: false,
      promptOnly: false,
      runOnEdit: false,
      substituteRegex: false,
      minDepth: 0,
      maxDepth: 0,
    });
  },[addRegexScript])
}

export function useDeleteRegexScript(){
  // const db = useDB()
  const deleteRegexScript = useCharacterEditorStore(s => s.deleteRegexScript)
  return useCallback(async (id: number) =>{
    const rows = await deleteRegexScript(id);
  },[deleteRegexScript])
}

export function useImportRegex(){
  // const db = useDB()
  const addRegexScript = useCharacterEditorStore(s => s.addRegexScript)
  return useCallback(async ()=>{
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (event: any) => {
      const file = event.target.files?.[0];
      if (!file) return;
      try {
        const fileContent = await file.text();
        const json = JSON.parse(fileContent);
        const result = await regexScriptsTableSchema.safeParse(json);
        if (!result.success) {
          console.log('error file type');
          return;
        }
        const { id, ...rest } = result.data;
        const regex = {
          ...rest,
          uuid: id,
          minDepth: rest.minDepth,
          maxDepth: rest.maxDepth,
        };
        await addRegexScript(regex);
        toast.success('Add Regex:' + regex.scriptName);
      } catch (e) {
        throw e;
      }
  };
  input.click();
  },[addRegexScript])
}

export function useUpdateScriptName(){
  const patchRegexScript = useCharacterEditorStore(s => s.patchRegexScript)
  return useCallback(async(id: number, value: string)=>{
    await patchRegexScript(id, { scriptName: value });
    return '!OK';
    // try {
    //   const rows = await patchRegexScript(id, { scriptName: value });
    //   if (!rows) return '!ERROR';
    //   console.log(rows);
    // } catch (e) {
    //   console.log(e);
    // }
  },[patchRegexScript])
}

export function useUpdateFindRegex(){
  const patchRegexScript = useCharacterEditorStore(s => s.patchRegexScript)
  return useCallback(async(id: number, value: string) =>{
    await patchRegexScript(id, { findRegex: value });
    // try {
    //   const rows = await db.regexScripts.update(id, { findRegex: value });
    //   if (!rows) return '!ERROR';
    //   console.log(rows);
    // } catch (e) {
    //   console.log(e);
    //   return;
    // }
  }, [patchRegexScript])
}


export function useUpdateReplaceString(){
  // const db = useDB()
  const patchRegexScript = useCharacterEditorStore(s => s.patchRegexScript)
  return useCallback(async(id: number, value: string) =>{
    await patchRegexScript(id, { replaceString: value });
    // try {
    //   const rows = await db.regexScripts.update(id, { replaceString: value });
    //   if (!rows) return '!ERROR';
    //   console.log(rows);
    // } catch (e) {
    //   console.log(e);
    //   return;
    // }
  }, [patchRegexScript])
}

export function useUpdateIsEnable(){
  // const db = useDB()
  const regexScripts = useCharacterEditorStore(s => s.regexScripts)
  const patchRegexScript = useCharacterEditorStore(s => s.patchRegexScript)
  return useCallback(async (id: number) =>{
    const currentItem = regexScripts.find(r => r.id === id)
    if (!currentItem){
      return '!ERROR: Item not found'
    }
    const currentDisabled = currentItem.disabled
    const newDisabled = !currentDisabled
    const rows = await patchRegexScript(id, {disabled: newDisabled})
    return newDisabled
    // try {
    //   const currentItem = await db.regexScripts.get(id);
    //   if (!currentItem) {
    //     return '!ERROR: Item not found';
    //   }
    //   const currentDisabled = currentItem.disabled;

    //   const newDisabled = !currentDisabled;

    //   const rows = await db.regexScripts.update(id, { disabled: newDisabled });

    //   if (!rows) return '!ERROR: Update failed';

    //   console.log('Update successful, new disabled value:', newDisabled);
    //   return newDisabled;
    // } catch (e) {
    //   console.error('Error updating disabled value:', e);
    //   return '!ERROR: ';
    // }

  },[regexScripts, patchRegexScript])
}

export function useUpdateRegexItem(){
  // const db = useDB()
  const patchRegexScript = useCharacterEditorStore(s => s.patchRegexScript)
  return useCallback(async (regexId: number, field: string, value: any)=>{
    await patchRegexScript(regexId, {
      [`${field}` as any]: value
    })
    // try {
    //   const rows = await db.regexScripts.update(regexId, {
    //     [`${field}` as any]: value,
    //   });
    // } catch (e) {
    //   console.log(e);
    // }
  },[patchRegexScript])
}

export function useExportRegex(){
  const regexScripts = useCharacterEditorStore(s => s.regexScripts)
  return useCallback(async(regexId: number) =>{
    try {
      const rows = regexScripts.find(r => r.id === regexId);
      if (!rows) return;
      const regex = {
        id: rows.uuid,
        findRegex: rows.findRegex,
        replaceString: rows.replaceString,
        trimStrings: rows.trimStrings,
        placement: rows.placement,
        disabled: rows.disabled,
        markdownOnly: rows.markdownOnly,
        promptOnly: rows.promptOnly,
        runOnEdit: rows.runOnEdit,
        substituteRegex: rows.substituteRegex,
        minDepth: rows.minDepth,
        maxDepth: rows.maxDepth,
      };
      const jsonString = JSON.stringify(regex, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const fileName = rows.scriptName ? `${rows.scriptName}.json` : 'regex.json';
      saveAs(blob, fileName);
    } catch (e) {
      console.log(e);
    }

  },[regexScripts])
}

export function useDeleteDuplicateRegex(){
  // const db = useDB()
  const regexScripts = useCharacterEditorStore(s => s.regexScripts)
  const batchDeleteRegexScripts = useCharacterEditorStore(s => s.batchDeleteRegexScripts)
  return useCallback(async() =>{
    try {
      const allRecords = regexScripts
      const hashGroups = new Map();

      allRecords.forEach((record) => {
        const { id, uuid, ...restFields } = record;
        const hashKey = JSON.stringify(restFields);

        if (!hashGroups.has(hashKey)) {
          hashGroups.set(hashKey, []);
        }
        hashGroups.get(hashKey).push(id);
      });

      const deletionIds = [];
      for (const [key, ids] of hashGroups as any) {
        if (ids.length > 1) {
          const sortedIds = [...ids].sort((a, b) => a - b);
          deletionIds.push(...sortedIds.slice(1));
        }
      }

      if (deletionIds.length > 0) {
        return await batchDeleteRegexScripts(deletionIds);
      }
      return Promise.resolve();
    } catch (error) {
      console.log(error);
    }

  },[batchDeleteRegexScripts, regexScripts])
}

