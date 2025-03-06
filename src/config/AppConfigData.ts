import { StringParsers } from '../utils/Parsers.js';

export interface AppConfigDataValues {
  openAIApiKey?: string;
  quiet?: boolean;
  verbose?: boolean;
  agentMaxTokens?: number;
  agentDefaultModel?: string;
  appName: string;
}
export const AppConfigDataValuesTransformers: Record<
  keyof AppConfigDataValues,
  (raw: unknown, strict: boolean) => any
> = {
  openAIApiKey: StringParsers.stringParser,
  quiet: StringParsers.booleanParser,
  verbose: StringParsers.booleanParser,
  agentMaxTokens: StringParsers.numberParser,
  agentDefaultModel: StringParsers.stringParser,
  appName: StringParsers.stringParser,
};

export const AppConfigDataKeys = Object.keys(AppConfigDataValuesTransformers);

export class AppConfigData implements AppConfigDataValues {
  public openAIApiKey?: string;
  public quiet?: boolean;
  public verbose?: boolean;
  public agentMaxTokens?: number;
  public agentDefaultModel?: string;
  public appName!: string;

  static getAvailableKeys(): string[] {
    return AppConfigDataKeys;
  }

  constructor(data: Partial<AppConfigData> = {}) {
    Object.assign(this, data);
  }

  merge(data: Partial<AppConfigData>): AppConfigData {
    return new AppConfigData({ ...this, ...data });
  }

  clone(): AppConfigData {
    return new AppConfigData(this);
  }

  serialize(): string {
    return JSON.stringify(this, undefined, 2);
  }

  static deserialize(data: string): AppConfigData {
    return new AppConfigData(JSON.parse(data));
  }

  static empty(): AppConfigData {
    return new AppConfigData();
  }
}
