import { TPlayerClass } from '~/src/types/serializables/players';

export type TPlayerRecord<K> = Partial<Record<TPlayerClass, K>>;
