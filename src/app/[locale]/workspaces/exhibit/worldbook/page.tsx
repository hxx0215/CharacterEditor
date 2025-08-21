'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useRouter } from '@/i18n/routing';
import {
  useAddCharacterBook,
  useCopyWorldBook,
  useDeleteCharacterBook,
  useDeleteDuplicateWorldBook,
  useExportWorldBook,
  useGetAllCharacterBookLists,
  useImportCharacterBook,
  useUpdateCharacterBookName,
  useLiveCharacterBook,
} from '@/lib/worldbook';
import { atom, useAtom } from 'jotai';
import { CopyXIcon, EllipsisVerticalIcon, ImportIcon, PlusIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import React, { useState } from 'react';
import { toast } from 'sonner';

export const runtime = 'edge';

const newWorldBookModalAtom = atom(false);
const changeNameModalAtom = atom(false)
const actionAtom = atom<number | undefined>(undefined)

function Page() {
  return (
    <>
      <Header />
      <WorldbookLists />
      <NewCharacterBookModal />
      <ChangeNameModel />
    </>
  );
}

export default Page;

function Header() {
  const t = useTranslations();
  const [, setNewModal] = useAtom(newWorldBookModalAtom);
  const importCharacterBook = useImportCharacterBook()
  return (
    <div className="flex justify-between">
      <div className="font-bold">{t('worldbook')}🚧</div>
      <div className="flex gap-x-2">
        <DeleteDuplicateWorldBook />
        <Button onClick={() => setNewModal(true)} variant="outline" size="icon">
          <PlusIcon />
        </Button>
        <Button variant="outline" size="icon" onClick={importCharacterBook}>
          <ImportIcon />
        </Button>
      </div>
    </div>
  );
}

function WorldbookLists() {
  const t = useTranslations();
  const getAllCharacterBookLists = useGetAllCharacterBookLists()
  const lists = getAllCharacterBookLists();
  const router = useRouter();
  const [deleteCharacterBookId, setDeleteCharacterBookId] = useState<Number>();
  const [isDeleteCharacterBookModal, setIsDeleteCharacterBookModal] = useState(false);
  const [,setIsNameModalShow] = useAtom(changeNameModalAtom)
  const [action,setAction] = useAtom(actionAtom)
  const exportWorldBook = useExportWorldBook()
  const copyWorldBook = useCopyWorldBook()
  const handleDeleteCharacterBook = (id: number) => {
    setDeleteCharacterBookId(id);
    setIsDeleteCharacterBookModal(true);
  };
  const handleActionCharacterBook = (bookId: number) => {
    router.push(`/workspaces/worldbook/${bookId}`);
  };
  const handleExportWorldBook = (id: number) => {
    exportWorldBook(id);
    toast.success(t('ok'));
  };

  const handleChangeWorldBookName = (id: number) => {
    setAction(id)
    setIsNameModalShow(true)
  };
  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('name')}</TableHead>
            <TableHead className="text-right">{t('action')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {lists?.map((list) => (
            <TableRow key={list.id} onClick={() => handleActionCharacterBook(list.id)}>
              <TableCell className="font-medium">{list.name}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="link">
                      <EllipsisVerticalIcon />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleActionCharacterBook(list.id)}>
                      {t('edit')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => copyWorldBook(list.id)}>
                      {t('copy')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExportWorldBook(list.id)}>
                      {t('export')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleChangeWorldBookName(list.id)}>
                      Change Name
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDeleteCharacterBook(list.id)}
                      className="text-red-600 focus:text-red-600"
                    >
                      {t('delete')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <DeleteCharacterBookModal
        isopen={isDeleteCharacterBookModal}
        id={deleteCharacterBookId as number}
        setIsOpen={setIsDeleteCharacterBookModal}
      />
    </>
  );
}

function NewCharacterBookModal() {
  const t = useTranslations();
  const [isOpen, setIsOpen] = useAtom(newWorldBookModalAtom);
  const [inputValue, setInputValue] = useState('');
  const addCharacterBook = useAddCharacterBook()
  const handleNewCharacterBook = async () => {
    await addCharacterBook(inputValue);
    setIsOpen(false);
    toast.success(t('ais') + inputValue);
  };
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('give_name')}</DialogTitle>
        </DialogHeader>
        <Input value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
        <DialogFooter className="justify-end">
          <DialogClose asChild>
            <Button onClick={() => setIsOpen(false)} type="button" variant="secondary">
              {t('cancel')}
            </Button>
          </DialogClose>
          <Button onClick={handleNewCharacterBook}>{t('new')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DeleteCharacterBookModal({
  isopen,
  setIsOpen,
  id,
}: {
  isopen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  id: number;
}) {
  const t = useTranslations();
  const deleteCharacterBook = useDeleteCharacterBook()
  const handleDeleteCharacter = async () => {
    deleteCharacterBook(id);
    setIsOpen(false);
    toast.success(t('success'));
  };
  return (
    <AlertDialog open={isopen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('ays')}</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setIsOpen(false)}>{t('cancel')}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteCharacter}
            className={buttonVariants({ variant: 'destructive' })}
          >
            {t('delete')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

const DeleteDuplicateWorldBook = () => {
  const t = useTranslations();
  const [isOpen, setIsOpen] = useState(false);
  const deleteDuplicateWorldBook = useDeleteDuplicateWorldBook()
  const handleDeleteDuplicate = () => {
    const result = deleteDuplicateWorldBook();
  };
  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger onClick={() => setIsOpen(true)} asChild>
        <Button variant="outline" size="icon">
          <CopyXIcon />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('ays')}</AlertDialogTitle>
          <AlertDialogDescription>
            本操作将会删除重复的内容 <Badge>Beta</Badge>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setIsOpen(false)}>{t('cancel')}</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => handleDeleteDuplicate()}
            className={buttonVariants({ variant: 'destructive' })}
          >
            {t('delete')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

function ChangeNameModel() {
  const [isShow, setIsShow] = useAtom(changeNameModalAtom);
  const [action, setAction] = useAtom(actionAtom);
  const [name, setName] = useState("");
  const t = useTranslations();
  const worldbook = useLiveCharacterBook(action);
  const updateCharacterBookName = useUpdateCharacterBookName()

  React.useEffect(() => {
    if (worldbook?.name) {
      setName(worldbook.name);
    }
  }, [worldbook]);

  const handleChangeName = async () => {
    if (!action) return;
    try {
      await updateCharacterBookName(action, name);
      setIsShow(false);
      toast.success(t("success"));
    } catch (error) {
      toast.error(t("error.unknown"));
    }
  };

  return (
    <AlertDialog open={isShow} onOpenChange={setIsShow}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('Character.change_cover')}</AlertDialogTitle>
          <AlertDialogDescription>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setIsShow(false)}>
            {t('cancel')}
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleChangeName}>
            {t('ok')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}