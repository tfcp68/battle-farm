import supabase from '~/db/connect';
import type { SupabaseClient } from '@supabase/supabase-js';


export default class BaseModel {
	protected db: SupabaseClient;

	constructor(db = supabase) {
		this.db = db;
	}

	protected mapRow<T extends Record<string, any>>(row: T): T {
		return row;
	}

}