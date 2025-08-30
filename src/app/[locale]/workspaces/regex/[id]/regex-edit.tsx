'use client';

import { useCharacterEditorStore } from '@/components/store';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { RegexScriptsTable } from '@/db/schema';
import {
  useUpdateFindRegex,
  useUpdateIsEnable,
  useUpdateRegexItem,
  useUpdateReplaceString,
  useUpdateScriptName,
} from '@/lib/regex';
import { pull } from 'es-toolkit';
import { atom, useAtom } from 'jotai';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

const regexAtom = atom<RegexScriptsTable>();

export default function RegexEdit() {
  const [regex, setRegex] = useAtom(regexAtom);
  const t = useTranslations();
  const parmas = useParams();
  const regexScripts = useCharacterEditorStore(s => s.regexScripts)
  const item = regexScripts.find(r => r.id === Number(parmas.id))
  if (item){
    setRegex(item)
  }
  // const db = useDB()
  // useLiveQuery(() => {
  //   db.regexScripts.get(Number(parmas.id)).then((item) => {
  //     if (!item) return;
  //     setRegex(item);
  //   });
  // });

  return (
    <Tabs defaultValue="profile" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="profile">{t('profile')}</TabsTrigger>
        <TabsTrigger value="content">{t('content')}</TabsTrigger>
      </TabsList>
      <TabsContent value="profile">
        <Profile />
      </TabsContent>
      <TabsContent value="content">
        <RegexEditor />
      </TabsContent>
    </Tabs>
  );
}

function Profile() {
  const t = useTranslations();
  const [regex, setRegex] = useAtom(regexAtom);

  return (
    <>
      {regex ? (
        <div className="grid grid-cols-1 gap-y-4">
          <ScriptSwitch />
          <ScriptName />
          <Placement />
          <MinDepth />
          <MaxDepth />
          <RunOnEdit />
          <SubstituteRegex />
          <MarkdownOnly />
          <PromptOnly />
        </div>
      ) : (
        <div></div>
      )}
    </>
  );
}

function ScriptSwitch() {
  const t = useTranslations();
  const [regex, setRegex] = useAtom(regexAtom);
  const updateIsEnable = useUpdateIsEnable()
  const handleSwitch = async () => {
    if (!regex) return;
    updateIsEnable(regex.id);
  };
  return (
    <>
      <Label>{t('Regex.switch')}</Label>
      <Switch onClick={handleSwitch} checked={!regex?.disabled} />
    </>
  );
}

function ScriptName() {
  const t = useTranslations();
  const [regex, setRegex] = useAtom(regexAtom);
  const updateScriptName = useUpdateScriptName()
  const handleChangeScriptName = async (value: string) => {
    if (!regex) return;
    updateScriptName(regex.id, value);
  };
  return (
    <>
      <Label>{t('Regex.script_name')}</Label>
      <Input value={regex?.scriptName} onChange={(e) => handleChangeScriptName(e.target.value)} />
    </>
  );
}

function Placement() {
  const t = useTranslations();
  const [regex, setRegex] = useAtom(regexAtom);
  const parmas = useParams();
  const updateRegexItem = useUpdateRegexItem()
  const handleUpdate = (value: number) => {
    const placement = regex?.placement || [];
    if (placement.includes(value)) {
      pull(placement, [value]);
      updateRegexItem(Number(parmas.id), 'placement', placement);
    } else {
      placement.push(value);
      updateRegexItem(Number(parmas.id), 'placement', placement);
    }
  };
  return (
    <>
      <div className="flex items-center gap-4">
        <Checkbox onCheckedChange={() => handleUpdate(1)} checked={regex?.placement.includes(1)} />
        <Label>{t('Regex.user-input')}</Label>
      </div>
      <div className="flex items-center gap-4">
        <Checkbox onCheckedChange={() => handleUpdate(2)} checked={regex?.placement.includes(2)} />
        <Label>{t('Regex.ai-output')}</Label>
      </div>
      <div className="flex items-center gap-4">
        <Checkbox onCheckedChange={() => handleUpdate(3)} checked={regex?.placement.includes(3)} />
        <Label>{t('Regex.shortcut-command')}</Label>
      </div>
      <div className="flex items-center gap-4">
        <Checkbox onCheckedChange={() => handleUpdate(5)} checked={regex?.placement.includes(5)} />
        <Label>{t('Regex.world-information')}</Label>
      </div>
    </>
  );
}

function MinDepth() {
  const t = useTranslations();
  const [regex, setRegex] = useAtom(regexAtom);
  const parmas = useParams();
  const updateRegexItem = useUpdateRegexItem()
  const handleUpdateItem = (value: string) => {
    updateRegexItem(Number(parmas.id), 'minDepth', Number(value));
  };
  return (
    <div className="max-w-[80px]">
      <Label>{t('Regex.minDepth')}</Label>
      <Input
        onChange={(e) => handleUpdateItem(e.target.value)}
        value={regex?.minDepth || 0}
        min={0}
        max={1000}
        step={1}
      />
    </div>
  );
}

function MaxDepth() {
  const t = useTranslations();
  const [regex, setRegex] = useAtom(regexAtom);
  const parmas = useParams();
  const updateRegexItem = useUpdateRegexItem()
  const handleUpdateItem = (value: string) => {
    updateRegexItem(Number(parmas.id), 'maxDepth', Number(value));
  };
  return (
    <div className="max-w-[80px]">
      <Label>{t('Regex.maxDepth')}</Label>
      <Input
        onChange={(e) => handleUpdateItem(e.target.value)}
        value={regex?.minDepth || 0}
        min={0}
        max={1000}
        step={1}
      />
    </div>
  );
}

function RunOnEdit() {
  const t = useTranslations();
  const [regex, setRegex] = useAtom(regexAtom);
  const parmas = useParams();
  const updateRegexItem = useUpdateRegexItem()
  const handleUpdate = (value: boolean) => {
    updateRegexItem(Number(parmas.id), 'placement', value);
  };
  return (
    <div className="flex items-center gap-x-4">
      <Checkbox onCheckedChange={() => handleUpdate} value={Number(regex?.runOnEdit)} />
      <Label>{t('Regex.runOnEdit')}</Label>
    </div>
  );
}

function SubstituteRegex() {
  const t = useTranslations();
  const [regex, setRegex] = useAtom(regexAtom);
  const parmas = useParams();
  const updateRegexItem = useUpdateRegexItem()
  const handleUpdate = (value: boolean) => {
    updateRegexItem(Number(parmas.id), 'substituteRegex', value);
  };
  return (
    <div className="flex items-center gap-x-4">
      <Checkbox onCheckedChange={() => handleUpdate} value={Number(regex?.substituteRegex)} />
      <Label>{t('Regex.substituteRegex')}</Label>
    </div>
  );
}

function MarkdownOnly() {
  const t = useTranslations();
  const [regex, setRegex] = useAtom(regexAtom);
  const parmas = useParams();
  const updateRegexItem = useUpdateRegexItem()
  const handleUpdate = (value: boolean) => {
    updateRegexItem(Number(parmas.id), 'markdownOnly', value);
  };
  return (
    <div className="flex items-center gap-x-4">
      <Checkbox onCheckedChange={() => handleUpdate} value={Number(regex?.markdownOnly)} />
      <Label>{t('Regex.markdownOnly')}</Label>
    </div>
  );
}

function PromptOnly() {
  const t = useTranslations();
  const [regex, setRegex] = useAtom(regexAtom);
  const parmas = useParams();
  const updateRegexItem = useUpdateRegexItem()
  const handleUpdate = (value: boolean) => {
    updateRegexItem(Number(parmas.id), 'promptOnly', value);
  };
  return (
    <div className="flex items-center gap-x-4">
      <Checkbox onCheckedChange={() => handleUpdate} value={Number(regex?.promptOnly)} />
      <Label>{t('Regex.promptOnly')}</Label>
    </div>
  );
}

function RegexEditor() {
  const t = useTranslations();
  const parmas = useParams();
  const [regex, setRegex] = useAtom(regexAtom);
  const [before, setBefore] = useState('');
  const [after, setAfter] = useState('');
  const [findRegex, setFindRegex] = useState('');
  const [replaceWith, setReplaceWith] = useState('');
  const updateFindRegex = useUpdateFindRegex()
  const handleChangeFindRegex = async (value: string) => {
    if (!regex) return;
    updateFindRegex(regex.id, value);
  };
  const updateReplaceString = useUpdateReplaceString()
  const handleChangeReplaceString = async (value: string) => {
    if (!regex) return;
    updateReplaceString(regex.id, value);
  };
  useEffect(() => {
    try {
      let replaced = before;

      if (findRegex.trim()) {
        let pattern = findRegex;
        let flags = 'g';
        const regexMatch = findRegex.match(/^\/(.*)\/([gim]*)$/);
        if (regexMatch) {
          pattern = regexMatch[1];
          flags = regexMatch[2] || '';
        } else {
          flags = 'g';
        }

        const regex = new RegExp(pattern, flags);
        replaced = before.replace(regex, replaceWith);
      }

      setAfter(replaced);
    } catch (error: any) {
      setAfter(`Error: ${error.message}`);
    }
  }, [before, findRegex, replaceWith]);

  return (
    <div>
      <div className="xs:grid-col-1 grid-col-2 grid gap-y-2">
        <div className="grid grid-cols-1 gap-x-2 md:grid-cols-2">
          <div>
            <Label>{t('Regex.playground')}</Label>
            <Textarea value={before} onChange={(e) => setBefore(e.target.value)} />
          </div>
          <div>
            <Label>
              {t('preview')} <Badge variant="outline">{t('beta')}</Badge>
            </Label>
            <Textarea value={after} disabled />
          </div>
        </div>
        <div>
          <Label>{t('Regex.find_regex')}</Label>
          <Textarea
            value={regex?.findRegex}
            onChange={(e) => handleChangeFindRegex(e.target.value)}
          />
        </div>
        <div>
          <Label>{t('Regex.replace_with')}</Label>
          <Textarea
            value={regex?.replaceString}
            onChange={(e) => handleChangeReplaceString(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
