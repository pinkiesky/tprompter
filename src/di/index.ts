import { Container } from 'typedi';
import { StdinDataReader } from '../utils/StdinDataReader.js';
import { StdinDataReaderImpl } from '../utils/StdinDataReader.impl.js';
import envPaths, { Paths } from 'env-paths';
import { PathsToken } from './tokens.js';

export async function setupContainer(): Promise<void> {
  Container.set<Paths>(PathsToken, envPaths('pprompter'));
  Container.set(StdinDataReader, new StdinDataReaderImpl());
}
