'use client';

import RotatingText from '@/components/bootstrapHero';
import { ModeToggle } from '@/components/mode-toggle';
import { Link } from '@/i18n/routing';
import { ActivityIcon, Code, PenIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

export const runtime = 'edge';
export default function Home() {
  const t = useTranslations();
  return (
    <>
      <div className="flex flex-1 justify-end p-4">
        <ModeToggle />
      </div>
      <RotatingText
          texts={[
            '亲爱的欢迎回来',
            '親愛的歡迎回來',
            'Darling, welcome back',
            '親愛なる、お帰りなさい',
            '친애하는, 환영합니다',
            'Дорогой, добро пожаловать обратно',
            'Cher, bienvenue de retour',
            'Lieber, willkommen zurück',
            'Querido, bienvenido de vuelta',
            'Caro, bem-vindo de volta',
            'Caro, bentornato',
            'Beste, welkom terug',
            'Kära, välkommen tillbaka',
            'Kære, velkommen tilbage',
            'Kjære, velkommen tilbake',
            'Hyvä, tervetuloa takaisin',
            'Szerető, üdv újra itt',
            'Drogi, witaj z powrotem',
            'Drahý, vitajte späť',
            'Drahý, vítejte zpět',
            'Dragi, dobrodošli nazad',
            'Αγαπητέ, καλώς ήρθες πίσω',
            'Dragi, dobrodošli nazaj',
          ]}
          mainClassName="px-2 sm:px-2 md:px-3 text-2xl overflow-hidden py-0.5 sm:py-1 md:py-2 justify-center rounded-lg"
          staggerFrom={'last'}
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '-120%' }}
          staggerDuration={0.025}
          splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
          transition={{ type: 'spring', damping: 30, stiffness: 400 }}
          rotationInterval={5000}
        />
      <div className="mx-auto max-w-[85rem] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        
        <div className="grid items-center gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            className="group flex size-full gap-y-6 rounded-lg p-5 hover:bg-yellow-50 focus:bg-yellow-50 focus:outline-none dark:hover:bg-neutral-800 dark:focus:bg-neutral-800"
            href="/workspaces/exhibit/character"
          >
            <svg
              className="me-6 mt-0.5 size-8 shrink-0 text-stone-800 dark:text-neutral-200"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <PenIcon />
            </svg>

            <div>
              <div>
                <h3 className="block font-bold text-stone-800 dark:text-white">
                  {t('edit character')}
                </h3>
              </div>

              <p className="mt-3 inline-flex items-center gap-x-1 text-sm font-semibold text-stone-800 dark:text-neutral-200">
                {t('workspaces')}
                <svg
                  className="size-4 shrink-0 transition ease-in-out group-hover:translate-x-1 group-focus:translate-x-1"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </p>
            </div>
          </Link>
          <Link
            className="group flex size-full gap-y-6 rounded-lg p-5 hover:bg-yellow-50 focus:bg-yellow-50 focus:outline-none dark:hover:bg-neutral-800 dark:focus:bg-neutral-800"
            href="https://github.com/oocmoe/CharacterEditor"
            target="_blanks"
          >
            <svg
              className="me-6 mt-0.5 size-8 shrink-0 text-stone-800 dark:text-neutral-200"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <Code />
            </svg>

            <div>
              <div>
                <h3 className="block font-bold text-stone-800 dark:text-white">{t('code')}</h3>
                <p className="text-stone-600 dark:text-neutral-400"></p>
              </div>

              <p className="mt-3 inline-flex items-center gap-x-1 text-sm font-semibold text-stone-800 dark:text-neutral-200">
                Github
                <svg
                  className="size-4 shrink-0 transition ease-in-out group-hover:translate-x-1 group-focus:translate-x-1"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </p>
            </div>
          </Link>

          <Link
            className="group flex size-full gap-y-6 rounded-lg p-5 hover:bg-yellow-50 focus:bg-yellow-50 focus:outline-none dark:hover:bg-neutral-800 dark:focus:bg-neutral-800"
            href="https://status.ooc.moe"
            target="_blank"
          >
            <svg
              className="me-6 mt-0.5 size-8 shrink-0 text-stone-800 dark:text-neutral-200"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <ActivityIcon />
            </svg>

            <div>
              <div>
                <h3 className="block font-bold text-stone-800 dark:text-white">{t('status')}</h3>
                <p className="text-stone-600 dark:text-neutral-400"></p>
              </div>

              <p className="mt-3 inline-flex items-center gap-x-1 text-sm font-semibold text-stone-800 dark:text-neutral-200">
                Status
                <svg
                  className="size-4 shrink-0 transition ease-in-out group-hover:translate-x-1 group-focus:translate-x-1"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </p>
            </div>
          </Link>
        </div>
      </div>
    </>
  );
}
