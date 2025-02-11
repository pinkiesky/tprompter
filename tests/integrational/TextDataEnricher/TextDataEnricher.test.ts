import path from 'path';
import { Container } from 'typedi';
import { TextDataEnricher } from '../../../src/textDataEnricher/TextDataEnricher.js';

describe(TextDataEnricher.name, () => {
  let enricher: TextDataEnricher;
  const assetsFolder = path.join(__dirname, 'assets');
  const replaceAssets = (data: string) => data.replace(/__ASSETS__/g, assetsFolder);

  beforeAll(async () => {
    enricher = Container.get(TextDataEnricher);
  });

  afterAll(() => {});

  test('enrichRawInput (only files)', async () => {
    const data = replaceAssets('__ASSETS__/1f\n__ASSETS__/3f');
    const result = await enricher.enrichRawInput(data);

    expect(result).toBe('1f\n\n3f\n');
  });

  test('enrichRawInput (files + raw text)', async () => {
    const data = replaceAssets('__ASSETS__/1f\n__ASSETS__/3f\ntext123');
    const result = await enricher.enrichRawInput(data);

    expect(result).toBe('1f\n\n3f\n\ntext123');
  });

  test('enrichRawInput (directory with overrided config)', async () => {
    const data = replaceAssets('__ASSETS__/0d');
    const result = await enricher.enrichRawInput(data, { allowedExtensions: [''] });

    const clean = result.split('\n').filter(Boolean).join('\n');
    const expected = new Array(10)
      .fill(0)
      .map((_, i) => `${i}f2`)
      .join('\n');
    expect(clean).toBe(expected);
  });

  test('enrichRawInput (directory recursive)', async () => {
    const data = replaceAssets('__ASSETS__');
    const result = await enricher.enrichRawInput(data);

    const clean = result.split('\n').filter(Boolean).join('\n');
    const expected = `0f2
1f2
2f2
3f2
4f2
5f2
6f2
7f2
8f2
9f2
0f
0f2
1f2
2f2
3f2
4f2
5f2
6f2
7f2
8f2
9f2
1f
0f2
9f2
2f
3f
4f
5f
6f
7f
8f
9f
#!/bin/bash
# This script creates files based on the specified paths.
# Each file's content is set to its file name.
##############################
# 1. Create files: ./[0-9]f #
##############################
# This loop creates files: 0f, 1f, ..., 9f in the current directory.
for digit in {0..9}; do
    filename="./\${digit}f"
    echo "\${digit}f" > "$filename"
done
##########################################
# 2. Create files: ./[0-2]d/[0-9]f2      #
##########################################
# For each directory 0d, 1d, and 2d, create files 0f2, 1f2, ..., 9f2.
for d in {0..2}; do
    dir="./\${d}d"
    mkdir -p "$dir"  # Ensure the directory exists
    for digit in {0..9}; do
        filename="\${dir}/\${digit}f2"
        echo "\${digit}f2" > "$filename"
    done
done
############################################
# 3. Create file: ./rd/rd/rd/f3            #
############################################
# Create nested directories rd/rd/rd and then create the file f3 inside them.
dir="./rd/rd/rd"
mkdir -p "$dir"  # Create the nested directories
filename="\${dir}/f3"
echo "f3" > "$filename"
rec`;
    expect(clean).toBe(expected);
  });
});
