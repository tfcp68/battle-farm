import {targetFormat} from "../assetBuilderTypes";
import {UICardSize, UIClassSize} from "../assetSIzes";

export const GetPresetsDefinePlugin = (
    sizes: typeof UIClassSize | typeof UICardSize,
    assetType: 'Classes' | 'Cards'
) => {
    const preset: any = {};
    const keys = Object.values(sizes).filter((v) => isNaN(Number(v)));
    for (const ext of targetFormat) {
        for (const size of keys) {
            const key = ext + size + assetType;
            const e = ext + size + assetType;
            preset[key] = JSON.stringify(e);
        }
    }

    return preset;
};