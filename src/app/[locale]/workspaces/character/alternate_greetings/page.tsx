'use client';

import { TokenCounter } from '@/components/tokenCounter';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
// import { db } from '@/db/schema';
import { useDB } from '@/components/db-provider';
import {
  useAddCharacterGreetings,
  useDeleteCharacterGreetings,
  useUpdateCharacter,
  useUpdateCharacterGreeting,
  usePageGuard,
} from '@/lib/character';
import { selectedCharacterIdAtom } from '@/store/action';
import { useLiveQuery } from 'dexie-react-hooks';
import { debounce } from 'es-toolkit';
import { atom, useAtom } from 'jotai';
import { ArrowUpDownIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export const runtime = 'edge';

const greetingIndexAtom = atom<string | null>('null');
const sortGreetingModalAtom = atom<boolean>(false);
const deleteModalAtom = atom(false);
function page() {
  usePageGuard();
  return (
    <>
      <Header />
      <Alternate_Greetings />
      <DeleteModal />
      <SortGreetingModalAtom />
    </>
  );
}

export default page;

function Header() {
  const [cid] = useAtom(selectedCharacterIdAtom);
  const [index, setIndex] = useAtom(greetingIndexAtom);
  const [isShow, setIsShow] = useAtom(deleteModalAtom);
  const [isSortDialogOpen,setIsSortDialogOpen] = useAtom(sortGreetingModalAtom);
  const db = useDB()
  const addCharacterGreetings = useAddCharacterGreetings()
  const lists = useLiveQuery(() => {
    const rows = db.character.get(cid).then((list) => {
      if (list) {
        return list.data.alternate_greetings;
      }
    });
    return rows;
  });
  const handleAddCharacterGreetings = async () => {
    addCharacterGreetings(cid as number);
    toast.success(t('ais'));
  };
  const t = useTranslations();
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={handleAddCharacterGreetings}>
          <PlusIcon />
        </Button>
        {lists && lists.length > 0 ? (
          <Select onValueChange={(value) => setIndex(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t('select greetings')} />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {lists?.map((list, index) => (
                  <SelectItem value={String(index)}>{index + 1}</SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        ) : (
          <></>
        )}
      </div>
      {lists && lists.length > 0 && index ? (
        <div>
          <Button onClick={() => setIsSortDialogOpen(true)} variant="outline" size="icon">
            <ArrowUpDownIcon />
          </Button>
          <Button onClick={() => setIsShow(true)} variant="outline" size="icon">
            <Trash2Icon />
          </Button>
        </div>

      ) : (
        <></>
      )}
    </div>
  );
}

function Alternate_Greetings() {
  const [cid] = useAtom(selectedCharacterIdAtom);
  const [index, setIndex] = useAtom(greetingIndexAtom);
  const [greeting, setGreeting] = useState('');
  const db = useDB()
  const updateCharacterGreeting = useUpdateCharacterGreeting()

  const handleChangeText = debounce(async (value: string) => {
    await updateCharacterGreeting(cid as number, Number(index), value as string);
  }, 1000);
  const t = useTranslations();
  useEffect(() => {
    const fetchData = async () => {
      const rows = await db.character.get(cid).then((item) => {
        if (item) {
          return item.data.alternate_greetings[Number(index)];
        }
      });
      if (rows) {
        setGreeting(rows);
      }
    };
    fetchData();
  }, [index, db]);
  return (
    <>
      {index !== 'null' ? (
        <>
          <Textarea
            onChange={(e) => {
              const value = e.target.value;
              setGreeting(value);
              handleChangeText(value);
            }}
            value={greeting}
            className="mt-4 h-full"
            placeholder={t('type messages')}
          />
          <TokenCounter text={greeting}></TokenCounter>
        </>
      ) : (
        <></>
      )}
    </>
  );
}

function DeleteModal() {
  const t = useTranslations();
  const [cid] = useAtom(selectedCharacterIdAtom);
  const [index, setIndex] = useAtom(greetingIndexAtom);
  const [isShow, setIsShow] = useAtom(deleteModalAtom);
  const db = useDB()
  const deleteCharacterGreetings = useDeleteCharacterGreetings()
  const lists = useLiveQuery(() => {
    const rows = db.character.get(cid).then((list) => {
      if (list) {
        return list.data.alternate_greetings;
      }
    });
    return rows;
  });
  const handleDeleteCharacterGreetings = async () => {
    deleteCharacterGreetings(cid as number, Number(index));
    if (lists && lists.length > 1) {
      const newIndex = index === '0' ? '1' : '0';
      setIndex(newIndex);
    } else {
      setIndex('null');
    }
    setIsShow(false);
  };
  return (
    <AlertDialog open={isShow}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('ays')}</AlertDialogTitle>
          <AlertDialogDescription>{t('nrb')}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setIsShow(false)}>{t('cancel')}</AlertDialogCancel>
          <AlertDialogAction
            className={buttonVariants({ variant: 'destructive' })}
            onClick={handleDeleteCharacterGreetings}
          >
            {t('delete')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

const SortGreetingModalAtom = () => {
  const t = useTranslations()
  const [isOpen, setIsOpen] = useAtom(sortGreetingModalAtom);
  const [cid] = useAtom(selectedCharacterIdAtom);
  const [sortList, setSortList] = React.useState<string[]>([]);
  const db = useDB()
  const updateCharacter = useUpdateCharacter()
  
  const handleSave = async () => {
    const result = await updateCharacter(Number(cid),"data.alternate_greetings",sortList)
    if(result) {
      setIsOpen(false)
      toast.success(t('success'));
      return
    }
    toast.error("Unknow Error");
  }
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event:any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setSortList((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const SortableItem = ({ id, greeting }: { id: string; greeting: string }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        className="flex items-center gap-2 p-2 border rounded mb-2"
      >
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing"
          aria-label="Drag to reorder"
        >
          ≡
        </button>
        <span>{greeting}</span>
      </div>
    );
  };

  const lists = useLiveQuery(() => {
    return db.character.get(cid).then(list => list?.data.alternate_greetings);
  });

  React.useEffect(() => {
    if (lists) setSortList(lists);
  }, [lists]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sort Greeting</DialogTitle>
          <DialogDescription>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext 
                items={sortList}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2 max-h-[80vh] overflow-y-auto">
                  {sortList.map((greeting) => (
                    <SortableItem
                      key={greeting}
                      id={greeting}
                      greeting={greeting.slice(0,50)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
        <Button variant="outline" onClick={() => setIsOpen(false)}>
          {t("cancel")}
        </Button>
        <Button onClick={handleSave}>
          {t("ok")}
        </Button>
      </DialogFooter>
      </DialogContent>

    </Dialog>
  );
};