import fs from 'fs';
import os from 'os';
import path from 'path';
import { ArchiveService } from '../../src/archive/Archive.js';
import { Container } from 'typedi';
import { PathsToken } from '../../src/di/tokens.js';
import { Paths } from 'env-paths';

describe(ArchiveService.name, () => {
  const fixtures = [
    {
      description: '1',
      content: '1',
    },
    {
      description: '2',
      content: '2',
    },
    {
      description: '3',
      content: '3',
    },
  ];

  let tmpFolder: string;
  let archiveService: ArchiveService;

  beforeAll(async () => {
    tmpFolder = fs.mkdtempSync(path.join(os.tmpdir(), 'pprompter-'));

    Container.set<Paths>(PathsToken, {
      data: tmpFolder,
    });
    archiveService = Container.get(ArchiveService);

    for (const fixture of fixtures) {
      await archiveService.save(fixture);
    }
  });

  afterAll(() => {
    if (tmpFolder) {
      fs.rmdirSync(tmpFolder, { recursive: true });
    }
  });

  test('list', async () => {
    const records = await archiveService.list();

    expect(records).toHaveLength(3);
    expect(records[0]).toMatchObject(fixtures[0]);
    expect(records[1]).toMatchObject(fixtures[1]);
    expect(records[2]).toMatchObject(fixtures[2]);
  });

  test('fromTheEnd (0)', async () => {
    const record = await archiveService.fromTheEnd(0);
    expect(record).toMatchObject(fixtures[2]);
  });

  test('fromTheEnd (1)', async () => {
    const record = await archiveService.fromTheEnd(1);
    expect(record).toMatchObject(fixtures[1]);
  });

  test('fromTheEnd (100)', async () => {
    const record = await archiveService.fromTheEnd(100);
    expect(record).toBeNull();
  });
});
