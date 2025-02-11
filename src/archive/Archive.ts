import { Inject, Service } from 'typedi';
import { PathsToken } from '../di/tokens.js';
import { Paths } from 'env-paths';
import { ArchiveRecord } from './index.js';
import { IO } from '../utils/IO.js';
import { join } from 'path';

@Service()
export class ArchiveService {
  private counter = 0;

  constructor(
    @Inject(PathsToken) private paths: Paths,
    private io: IO,
  ) {}

  async getArchiveFolder(): Promise<string> {
    const folder = join(this.paths.data, 'archive');
    await this.io.mkdirRecursive(folder);

    return folder;
  }

  async save(record: Omit<ArchiveRecord, 'createdAt'>): Promise<void> {
    const folder = await this.getArchiveFolder();
    const unixTimestamp = Date.now();

    const path = join(folder, `${unixTimestamp}-${this.counter++}.json`);
    const content = JSON.stringify(
      { ...record, createdAt: new Date().toISOString() },
      undefined,
      2,
    );

    await this.io.writeFile(path, content);
  }

  async list(): Promise<ArchiveRecord[]> {
    const folder = await this.getArchiveFolder();

    const files = await this.io.fileList(folder, '.json');
    files.sort();

    const records: ArchiveRecord[] = [];
    for (const file of files) {
      const content = await this.io.readFile(join(folder, file));
      records.push(JSON.parse(content));
    }

    return records;
  }

  async fromTheEnd(n: number): Promise<ArchiveRecord | null> {
    const records = await this.list();
    return records[records.length - n - 1] || null;
  }
}
