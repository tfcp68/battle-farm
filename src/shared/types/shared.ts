import { TPlayerClass } from '~/shared/types/serializables/players';

export type TPlayerRecord<K> = Partial<Record<TPlayerClass, K>>;
