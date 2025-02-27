const booleanParser = (raw: unknown): boolean => (typeof raw === 'boolean' ? raw : raw === 'true');
const stringParser = (raw: unknown): string => `${raw}`;
const numberParser = (raw: unknown): number => (typeof raw === 'string' ? parseInt(raw, 10) : 0);

export interface AppConfigDataValues {
  openAIApiKey?: string;
  quiet?: boolean;
  verbose?: boolean;
  askMaxTokens?: number;
  askDefaultModel?: string;
}
export const AppConfigDataValuesTransformers: Record<
  keyof AppConfigDataValues,
  (raw: unknown) => any
> = {
  openAIApiKey: stringParser,
  quiet: booleanParser,
  verbose: booleanParser,
  askMaxTokens: numberParser,
  askDefaultModel: stringParser,
};

export const AppConfigDataKeys = Object.keys(AppConfigDataValuesTransformers);

export class AppConfigData implements AppConfigDataValues {
  public openAIApiKey?: string;
  public quiet?: boolean;
  public verbose?: boolean;
  public askMaxTokens?: number;
  public askDefaultModel?: string;

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
