export function longestCommonPrefix(strs: string[]): string {
  if (strs.length === 0) {
    return '';
  }

  let prefix = strs[0];
  for (let i = 1; i < strs.length; i++) {
    const str = strs[i];
    let j = 0;
    while (j < prefix.length && j < str.length && prefix[j] === str[j]) {
      j++;
    }

    prefix = prefix.slice(0, j);
    if (prefix === '') {
      break;
    }
  }

  return prefix;
}
