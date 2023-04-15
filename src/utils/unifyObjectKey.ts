export const unifyObjectKey = <EventType = number>(key: string | number): EventType =>
	parseInt(String(key)) as unknown as EventType;

export default unifyObjectKey;
