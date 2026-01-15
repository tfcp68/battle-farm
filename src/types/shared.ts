import { TPlayerClass } from '~/types/serializables/players';

export type TPlayerRecord<K> = Partial<Record<TPlayerClass, K>>;
