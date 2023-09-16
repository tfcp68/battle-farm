export const UIClassSize = {
	SMALL: 300,
	LARGE: 600,
};

export const UICardSize = {
	SMALL: 160,
	MEDIUM: 550,
	LARGE: 750,
};

export type TUICardSizeKeys = keyof typeof UICardSize;
export type TUIClassSizeKeys = keyof typeof UIClassSize;
export type TUIAllSizes = typeof UIClassSize | typeof UICardSize;

export const isUIClassSizeKeys = (s: any): s is TUIClassSizeKeys => {
	return Object.keys(UIClassSize).includes(s);
};

export const isUICardSizeKeys = (s: any): s is TUICardSizeKeys => {
	return Object.keys(UICardSize).includes(s);
};
