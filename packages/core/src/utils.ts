export class Utils {
    public static mergeMaps<K, V>(...maps: Map<K, V[]>[]) {
        const combinedMap: Map<K, V[]> = new Map();
        const allKeys = new Set<K>();

        // Collect all unique keys from all maps
        for (const map of maps) {
            for (const key of map.keys()) {
                allKeys.add(key);
            }
        }

        for (const key of allKeys) {
            let combinedValues: V[] = [];
            for (const map of maps) {
                const value = map.get(key);
                if (value) {
                    combinedValues = [...combinedValues, ...value];
                }
            }
            if (combinedValues.length > 0) {
                combinedMap.set(key, combinedValues);
            }
        }

        return combinedMap;
    }
}