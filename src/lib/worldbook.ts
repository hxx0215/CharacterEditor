import { CharacterBookTable, db } from '@/db/schema';
import { useLiveQuery } from 'dexie-react-hooks';
import { omit } from 'es-toolkit/compat';
import saveAs from 'file-saver';
import { toast } from 'sonner';

export async function addCharacterBook(name: string) {
  try {
    const rows = await db.characterBook.add({
      name: name || 'ooc.moe',
      description: '',
      scan_depth: 0,
      token_budget: 0,
      recursive_scanning: false,
      extensions: {},
      entries: [],
    });
    return rows;
  } catch (e) {
    throw e;
  }
}

export function getAllCharacterBookLists() {
  const rows = useLiveQuery(() =>
    db.characterBook.toArray().then((row) =>
      row.map(({ id, name }) => ({
        id,
        name,
      })),
    ),
  );
  return rows;
}

export async function getCharacterBook(id: number) {
  try {
    const rows = db.characterBook.get(id).then((row) => {
      if (row) {
        return row;
      }
    });
    return rows;
  } catch (e) {
    throw e;
  }
}

export async function getCharacterBookEntries(bid: number, eid: number) {
  try {
    const rows = await db.characterBook.get(bid).then((item) => {
      if (item) {
        const lists = item.entries;
        const entry = lists.find((list) => list.id === eid);
        return entry;
      }
    });
    if (rows) {
      return rows;
    }
  } catch (e) {
    throw e;
  }
}

export async function updateCharacterBookEntriesEnable(entryId: number, bookId: number) {
  try {
    const entrys = await getCharacterBook(bookId);
    if (!entrys || !entrys.entries) {
      console.log('Entries not found');
      return;
    }
    const index = entrys.entries.findIndex((entry) => entry.id === entryId);
    if (index === -1) {
      console.log('Entry not found');
      return;
    }

    entrys.entries[index].enabled = !entrys.entries[index].enabled;
    await db.characterBook.update(bookId, { entries: entrys.entries });
    console.log('Entry updated successfully');
  } catch (e) {
    console.error('Error updating entry:', e);
    throw e;
  }
}

export async function updateBookEntry(
  bookId: number,
  value: any,
) {
  try {
    const rows = await db.characterBook.update(bookId, {
      [`entries` as any]: value,
    });
    return rows
  } catch (e) {
    console.log(e);
  }
}

export async function updateBookEntryItem(
  bookId: number,
  entryIndex: number,
  field: string,
  value: any,
) {
  try {
    const rows = await db.characterBook.update(bookId, {
      [`entries.${entryIndex}.${field}` as any]: value,
    });
  } catch (e) {
    console.log(e);
  }
}

export async function deleteCharacterBook(id: number) {
  try {
    const rows = await db.characterBook.delete(id);
  } catch (e) {
    throw e;
  }
}

export async function deleteCharacterBookEntries(id: number, index: number) {
  try {
    const entries = await db.characterBook.get(id).then((item) => {
      return item?.entries;
    });
    if (entries) {
      const newEntrie = entries.filter((_, i) => i !== index);
      const rows = await db.characterBook.update(id, { entries: newEntrie });
      return rows;
    }
  } catch (e) {
    throw e;
  }
}

export async function addCharacterBookEntries(id: number) {
  try {
    const entries = await db.characterBook.get(id).then((item) => {
      return item?.entries;
    });
    if (entries) {
      const defaultEntries = {
        keys: [],
        content: '',
        extensions: {},
        enabled: false,
        insertion_order: 0,
        case_sensitive: false,
        name: '',
        priority: 0,
        id: undefined,
        comment: '',
        selective: false,
        secondary_keys: [],
        constant: false,
        position: '',
      };
      const newEntrie = [...entries, defaultEntries];
      const rows = await db.characterBook.update(id, { entries: newEntrie });
      return rows;
    }
  } catch (e) {
    throw e;
  }
}

export async function exportWorldBook(id: number) {
  try {
    const rows: CharacterBookTable | undefined = await db.characterBook.get(id);
    if (!rows) return;

    const formattedData = {
      entries: Object.fromEntries(
        rows.entries.map((entry, index) => [
          String(index),
          {
            uid: index,
            key: entry.keys ?? [],
            keysecondary: entry.secondary_keys ?? [],
            comment: entry.comment ?? "",
            content: entry.content ?? "",
            constant: entry.constant ?? false,
            vectorized: entry.vectorized ??false,
            selective: entry.selective ?? true,
            selectiveLogic: entry.selectiveLogic ?? 0,
            addMemo: entry.addMemo ?? true,
            order: entry.insertion_order ?? 0,
            position: Number(entry.extensions.position) ?? Number(entry.position) == 0 ? 'before_char' : 'after_char',
            disable: !entry.enabled,
            excludeRecursion: entry.excludeRecursion ?? false,
            preventRecursion: entry.preventRecursion ?? false,
            delayUntilRecursion: entry.delayUntilRecursion ?? false,
            probability: entry.probability ?? 100,
            useProbability: entry.useProbability ?? true,
            depth:entry.extensions.depth ?? entry.depth ?? 4,
            group: entry.group ?? "",
            groupOverride: false,
            groupWeight: entry.groupWeight ?? 100,
            scanDepth: entry.scanDepth ?? null,
            caseSensitive: entry.case_sensitive ?? null,
            matchWholeWords: entry.matchWholeWords ?? null,
            useGroupScoring: entry.useGroupScoring ?? null,
            automationId: entry.automationId ?? "",
            role: entry.role ?? null,
            sticky: entry.sticky ?? 0,
            cooldown: entry.cooldown ?? 0,
            delay: entry.delay ?? 0,
            displayIndex: entry.displayIndex ?? index,
            extensions: {
              position: entry.extensions.position ?? 4,
              exclude_recursion: entry.extensions.exclude_recursion ?? false,
              display_index: entry.extensions.display_index ?? index ,
              probability: entry.extensions.probability ?? 100,
              useProbability: entry.extensions.useProbability ?? true,
              depth: entry.extensions.depth ?? 4,
              selectiveLogic: entry.extensions.selectiveLogic ?? 0,
              group: entry.extensions.group ?? "",
              group_override: entry.extensions.group_override ?? false,
              group_weight: entry.extensions.group_weight ?? 100,
              prevent_recursion: entry.extensions.prevent_recursion ?? false,
              delay_until_recursion: entry.extensions.delay_until_recursion ?? false,
              scan_depth: entry.extensions.scan_depth ?? null,
              match_whole_words: entry.extensions.match_whole_words ?? null,
              use_group_scoring: entry.extensions.use_group_scoring ?? false,
              case_sensitive: entry.extensions.case_sensitive ?? null,
              automation_id: entry.extensions.automation_id ?? "",
              role: entry.extensions.role ?? 0,
              vectorized: entry.extensions.vectorized ?? false,
              sticky: entry.extensions.sticky ?? 0,
              cooldown: entry.extensions.cooldown ?? 0,
              delay: entry.extensions.delay ?? 0
            }
          },
        ]),
      ),
    };

    const jsonString = JSON.stringify(formattedData);

    const blob = new Blob([jsonString], { type: 'application/json' });

    const fileName = rows.name ? `${rows.name}.json` : 'worldbook.json';

    saveAs(blob, fileName);
  } catch (e) {
    console.error(e);
  }
}

export async function importCharacterBook() {
  try {
    const handleSelectFile = () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.onchange = async (event: any) => {
        const file = event.target.files?.[0];
        if (!file || !file.type.startsWith('application/json')) {
          console.warn('Invalid file');
          return;
        }
        const fileContent = await file.text();
        let parsedData;
        try {
          parsedData = JSON.parse(fileContent);
        } catch (error) {
          console.error('Invalid JSON format');
          return;
        }
        const characterBook: Omit<CharacterBookTable, 'id'> = {
          name: file.name.replace('.json', ''),
          description: '',
          scan_depth: parsedData.entries?.[0]?.depth ?? 4,
          token_budget: undefined,
          recursive_scanning: undefined,
          extensions: {},
          entries: Object.values(parsedData.entries || {}).map((entry: any, index) => ({
            keys: entry.key || [],
            content: entry.content || '',
            extensions: entry.extensions,
            enabled: !entry.disable,
            insertion_order: entry.order ?? 100,
            case_sensitive: entry.caseSensitive ?? undefined,
            name: undefined,
            priority: entry.order ?? 100,
            id: undefined,
            comment: entry.comment || '',
            selective: entry.selective ?? true,
            secondary_keys: entry.keysecondary || [],
            constant: entry.constant ?? false,
            position: entry.position ?? entry.position == 0 ? 'before_char' : 'after_char',
            displayindex: entry.displayIndex,
            groupWeight: entry.groupWeight,
            scanDepth: entry.scanDepth,
            useGroupScoring: entry.useGroupScoring,
            role:entry.role
          })),
        };
        db.characterBook.add(characterBook);
        toast.success('OK');
      };
      input.click();
    };

    handleSelectFile();
  } catch (e) {
    console.log('Import failed:', e);
  }
}

export async function copyWorldBook(id: number) {
  try {
    const rows = await db.characterBook.get(id);
    if (!rows) return;
    const book = omit(rows, ['id']);
    db.characterBook.add(book);
    toast.success('OK');
  } catch (e) {
    console.log(e);
  }
}

export async function deleteDuplicateWorldBook() {
  try {
    const allEntries = await db.characterBook
      .toArray()
      .then((items) => items.map(({ id, entries }) => ({ id, entries })));
    const entriesMap = new Map();
    allEntries.forEach((item) => {
      const key = JSON.stringify(item.entries);
      if (!entriesMap.has(key)) {
        entriesMap.set(key, []);
      }
      entriesMap.get(key).push(item.id);
    });
    const idsToDelete = [];
    for (const [key, ids] of entriesMap as any) {
      if (ids.length > 1) {
        const sortedIds = [...ids].sort((a, b) => a - b);
        idsToDelete.push(...sortedIds.slice(1));
      }
    }
    if (idsToDelete.length > 0) {
      return db.characterBook.bulkDelete(idsToDelete);
    }
    return Promise.resolve();
  } catch (error) {
    console.log(error);
  }
}
