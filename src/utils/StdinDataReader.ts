import { Service } from 'typedi';

export interface ReadOptions {
  onlyPipe?: boolean;
}

@Service()
export class StdinDataReader {
  readData(placeholder = 'Input required', options: ReadOptions = {}): Promise<string> {
    throw new Error('Only for testing purposes');
  }
}
