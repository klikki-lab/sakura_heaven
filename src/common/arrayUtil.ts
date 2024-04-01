export module ArrayUtil {

    export const extractRandomOnes = (array: number[][], count: number, random: g.RandomGenerator) => {
        const result = [];
        const flattened = flattenArray(array).map((value, index) => ({ value, index }));

        const ones = flattened.filter(item => item.value === 1);
        for (let i = 0; i < count; i++) {
            const randomIndex = Math.floor(random.generate() * ones.length);
            result.push(ones[randomIndex].index);
            ones.splice(randomIndex, 1);
        }
        return result;
    };

    const flattenArray = (arr: (number | number[])[]): number[] => {
        let flattened: number[] = [];
        for (let i = 0; i < arr.length; i++) {
            if (Array.isArray(arr[i])) {
                flattened = flattened.concat(flattenArray(arr[i] as number[]));
            } else {
                flattened.push(arr[i] as number);
            }
        }
        return flattened;
    };

    export const extractOneCount = (arr: number[][]): number => {
        let count = 0;
        arr.forEach(arr => {
            arr.forEach(num => {
                if (num === 1) count++;
            });
        });
        return count;
    };
}