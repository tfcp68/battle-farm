export const unifyObjectKey = <KeyType = number>(key: string | number): KeyType =>
	parseInt(String(key)) as unknown as KeyType;