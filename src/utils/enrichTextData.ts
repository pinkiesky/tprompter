export function getFilePathsFromLine(data: string): string[] {
  data = data.trim();

  if (!data || data.startsWith('//')) {
    return [];
  }

  const startsLikePath = data.startsWith('/') || data.startsWith("'/") || data.startsWith('"/');
  if (!startsLikePath) {
    return [];
  }

  const chars = data.trim().split('');

  let currentFilePath = '';

  let isInsideQuotes = false;
  let isInsideQuotesChar = '';

  const filepaths = [];

  for (let i = 0; i < chars.length; i++) {
    const char = chars[i];

    if (char === ' ' && !isInsideQuotes) {
      if (currentFilePath) {
        filepaths.push(currentFilePath);
        currentFilePath = '';
      }
    } else if (char === "'" || char === '"') {
      if (!isInsideQuotes) {
        isInsideQuotes = true;
        isInsideQuotesChar = char;
      } else if (isInsideQuotesChar === char) {
        isInsideQuotes = false;
        isInsideQuotesChar = '';
      }
    } else if (char === '\\') {
      currentFilePath += chars[++i];
    } else {
      currentFilePath += char;
    }
  }

  if (currentFilePath) {
    filepaths.push(currentFilePath);
  }

  return filepaths;
}

/**
 * This finction finds all the filepaths in the given text data and replaces them with the file content.
 */
export async function enrichTextData(
  data: string,
  fileResolver: (path: string) => Promise<string>,
): Promise<string> {
  const lines = data.split('\n');
  const result = [];

  for (const line of lines) {
    const paths = getFilePathsFromLine(line);

    if (paths.length) {
      for (const path of paths) {
        const content = await fileResolver(path);
        result.push(content);
      }
    } else {
      result.push(line);
    }
  }

  return result.join('\n');
}
