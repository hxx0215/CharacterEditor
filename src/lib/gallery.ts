import { remove } from 'es-toolkit';
import { toast } from 'sonner';
import { v7 as uuidv7 } from 'uuid';

import { useCallback } from 'react';
import { useCharacterEditorStore } from '@/components/store';

export function useNewGallery(){
  // const db = useDB()
  const addGallery = useCharacterEditorStore(s => s.addGallery)
  return useCallback(async(name: string)=>{
    await addGallery({
      uuid:uuidv7(),
      name:name,
      content:[]
    })
    return "!OK"
    // try{
    //   await db.gallery.add({
    //     uuid:uuidv7(),
    //     name:name,
    //     content:[]
    //   })
    //   return "!OK"
    // }catch(e){
    //   console.log(e)
    //   return "!ERROR"
    // }
  },[addGallery])
}

export function useDeleteGallery(){
  const deleteGallery = useCharacterEditorStore(s => s.deleteGallery)
  // const db = useDB()
  return useCallback(async (id: number)=>{
    await deleteGallery(id)
    return "!OK"
    // try {
    //   await db.gallery.delete(id);
    //   return "!OK"
    // } catch (e) {
    //   console.log(e)
    //   return "!ERROR"
    // }
  },[deleteGallery])
}

export function useGetGally(){
  // const db = useDB()
  const gallery = useCharacterEditorStore(s => s.gallery)
  return useCallback(()=>{
    return gallery.map(({id, uuid, name}) =>({
          id,
          uuid,
          name
    }))
    // const rows = useLiveQuery(() =>
    //   db.gallery.toArray().then((row) =>
    //     row.map(({ id, uuid, name,}) => ({
    //       id,
    //       uuid,
    //       name,
    //     }))
    //   )
    // );
    // return rows;
  },[gallery])
}

export function useGellyList(){
  // const db = useDB()
  const gallery = useCharacterEditorStore(s => s.gallery)
  return useCallback((id: number)=>{
    // const rows = useLiveQuery(() =>
    //   db.gallery.get(id)
    // );
    // return rows;
    return gallery.find(g => g.id === id)
  }, [gallery])
}


export function useAddGalleryItem(){
  // const db = useDB()
  const gallery = useCharacterEditorStore(s => s.gallery)
  const patchGallery = useCharacterEditorStore(s => s.patchGallery)
  return useCallback(async(id:number, name: string, value: string)=>{
    const list = gallery.find(g => g.id === id)
    if (!list){
      toast.error("Gallery Not Found")
      return
    }
    const entried = list.content
    const newEntry = {
        uuid:uuidv7(),
        name:name,
        url:value,
    }
    const entry = [...entried, newEntry]
    await patchGallery(id, {
      content: entry
    })
    // try{
    //   const list = await db.gallery.get(id)
    //   if(!list) {
    //     toast.error("Gallery Not Found")
    //     return
    //   }
    //   const entried = list.content
    //   const newEntry = {
    //     uuid:uuidv7(),
    //     name:name,
    //     url:value,
    //   }
    //   const entry = [...entried,newEntry]
    //   await db.gallery.update(id,{
    //     "content":entry
    //   })
    // }catch(e){
    //   console.log(e)
    // }
  },[gallery, patchGallery])
}

export function useDeleteGalleryItem(){
  // const db = useDB()
  const patchGallery = useCharacterEditorStore(s => s.patchCharacter)
  const gallery = useCharacterEditorStore(s => s.gallery)
  return useCallback(async(id:number, uuid: string) =>{
    const deleteUUID = uuid
    const item = gallery.find(g => g.id === id)
    if (!item){
      return
    }
    const entried = item.content
    if (!entried) return
    remove(entried, item => item.uuid === deleteUUID)
    await patchGallery(id, {
      content: entried  
    })
    // try{
    //   const deleteUUID = uuid
    //   const entried = await db.gallery.get(id).then((item)=>{
    //     if(!item) return
    //     return item.content
    //   })
    //   if(!entried) return
    //   remove(entried,item => item.uuid == deleteUUID)
    //   await db.gallery.update(id,{
    //     "content":entried
    //   })
    // }catch(e){
    //   console.log(e)
    // }

  },[gallery, patchGallery])
}
