import { Service } from 'typedi';

@Service()
export class StdinDataReader {
  readData(placeholder = 'Input required'): Promise<string> {
    throw new Error('Only for testing purposes');
  }
}
