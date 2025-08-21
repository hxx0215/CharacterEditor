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
  useAddRegexScript,
  useDeleteDuplicateRegex,
  useExportRegex,
  useGetAllRegexScriptLists,
  useImportRegex,
  useDeleteRegexScript,
} from '@/lib/regex';
import { atom, useAtom } from 'jotai';
import { CopyXIcon, EllipsisVerticalIcon, ImportIcon, PlusIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'sonner';

export const runtime = 'edge';

const addRegexScriptModalAtom = atom(false);

function page() {
  return (
    <>
      <Header />
      <RegexList />
      <AddRegexScriptModal />
    </>
  );
}

export default page;

function Header() {
  const t = useTranslations();
  const [, setIsShowAddRegexScriptModal] = useAtom(addRegexScriptModalAtom);
  const importRegex = useImportRegex()
  return (
    <div className="flex justify-between">
      <div>{t('regex_scripts')}🚧</div>
      <div className="flex gap-x-2">
        <DeleteDuplicateRegex />
        <Button onClick={() => setIsShowAddRegexScriptModal(true)} variant="outline" size="icon">
          <PlusIcon />
        </Button>
        <Button onClick={importRegex} variant="outline" size="icon">
          <ImportIcon />
        </Button>
      </div>
    </div>
  );
}

function RegexList() {
  const t = useTranslations();
  const getAllRegexScriptLists = useGetAllRegexScriptLists()
  const lists = getAllRegexScriptLists();
  const router = useRouter();
  const deleteRegexScript = useDeleteRegexScript()
  const exportRegex = useExportRegex()
  const handleDeleteRegexScript = (id: number) => {
    deleteRegexScript(id);
    toast.success(t('dis'));
  };
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t('name')}</TableHead>
          <TableHead className="text-right">{t('action')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {lists?.map((list, index) => (
          <TableRow key={list.id}>
            <TableCell>{list.scriptName}</TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Button variant="link" size="icon">
                    <EllipsisVerticalIcon />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => router.push(`/workspaces/regex/${list.id}`)}>
                    {t('edit')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => exportRegex(list.id)}>
                    {t('export')}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-600 focus:text-red-500"
                    onClick={() => handleDeleteRegexScript(list.id)}
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
  );
}

function AddRegexScriptModal() {
  const t = useTranslations();
  const [isShowModal, setIsShowModal] = useAtom(addRegexScriptModalAtom);
  const [scriptName, setScriptName] = useState('');
  const addRegexScript = useAddRegexScript()
  const handleAddRegexScript = () => {
    addRegexScript(scriptName);
    setScriptName('');
    setIsShowModal(false);
    toast.success(t('ais'));
  };
  return (
    <AlertDialog open={isShowModal}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('give_name')}</AlertDialogTitle>
          <AlertDialogDescription>
            <Input value={scriptName} onChange={(e) => setScriptName(e.target.value)} />
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setIsShowModal(false)}>{t('cancel')}</AlertDialogCancel>
          <AlertDialogAction onClick={handleAddRegexScript}>{t('new')}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

const DeleteDuplicateRegex = () => {
  const t = useTranslations();
  const [isOpen, setIsOpen] = useState(false);
  const deleteDuplicateRegex = useDeleteDuplicateRegex()
  const handleDeleteDuplicate = () => {
    const result = deleteDuplicateRegex();
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
