import { trytesToAscii } from '@iota/converter';



/**
 * Convert an object from Trytes.
 * @param trytes The trytes to decode.
 * @returns The decoded object.
 */

const decodeNonASCII = (value: any) => {
    return value ? value.replace(/\\u([\d\w]{4})/gi, (match: any, grp: any) => String.fromCharCode(parseInt(grp, 16))) : undefined;
};

export const fromTrytes = (trytes:any ) => {
    // Trim trailing 9s
    let trimmed = trytes.replace(/\9+$/, '');

    // And make sure it is even length (2 trytes per ascii char)
    if (trimmed.length % 2 === 1) {
        trimmed += '9';
    }

    const ascii = trytesToAscii(trimmed);
    return decodeNonASCII(ascii);
    // return json ? JSON.parse(json) : undefined;
};
