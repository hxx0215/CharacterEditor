'use client';

import { TokenCounter } from '@/components/tokenCounter';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCharacterField, useUpdateSpecV1Character, usePageGuard } from '@/lib/character';
import { selectedCharacterIdAtom } from '@/store/action';
import { debounce } from 'es-toolkit';
import { useAtom } from 'jotai';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

export const runtime = 'edge';

function page() {
  usePageGuard();
  return (
    <>
      <Personality />
    </>
  );
}

export default page;

function Personality() {
  const [cid] = useAtom(selectedCharacterIdAtom);
  const [inputValue, setInputValue] = useState<string>('');
  const t = useTranslations();
  const updateSpecV1Character = useUpdateSpecV1Character()
  const handleChangeText = debounce(async (value: string) => {
    await updateSpecV1Character(cid as number, 'personality', value);
  }, 1000);
  const getCharacterField = useCharacterField()

  useEffect(() => {
    const fetchDefaultValue = async () => {
      try {
        const rows = await getCharacterField(cid as number, 'personality');
        if (rows && typeof rows === 'string') {
          setInputValue(rows);
        }
      } catch (error) {
        console.error('Failed to fetch default value:', error);
      }
    };
    fetchDefaultValue();
  }, [cid, getCharacterField]);

  return (
    <>
      {cid ? (
        <div className="flex h-full flex-col overflow-hidden p-0.5">
          <div className="flex flex-row items-center justify-between">
            <Label htmlFor="message">{t('Character.personality')}</Label>
            <TokenCounter text={inputValue} />
          </div>

          <Textarea
            className="mt-4 flex-1 resize-none overflow-auto"
            placeholder={t('type messages')}
            value={inputValue}
            onChange={(e) => {
              const value = e.target.value;
              setInputValue(value);
              handleChangeText(value);
            }}
          />
        </div>
      ) : (
        <div></div>
      )}
    </>
  );
}
