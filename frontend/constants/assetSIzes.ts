export const UIClassSize = {
	SMALL: 300,
	LARGE: 600,
};

export const UICardSize = {
	SMALL: 300,
	MEDIUM: 450,
	LARGE: 600,
};

export type TUICardSizeKeys = keyof typeof UICardSize;
export type TUIClassSizeKeys = keyof typeof UIClassSize;
export type TUIAllSizesKeys = typeof UIClassSize | typeof UICardSize;

export const isUIClassSizeKeys = (s: any): s is TUIClassSizeKeys => {
	return Object.keys(UIClassSize).includes(s);
};
