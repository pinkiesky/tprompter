export const AppConfigDataKeys = ['openAIApiKey', 'quiet', 'verbose'] as const;
export type AppConfigDataKeys = (typeof AppConfigDataKeys)[number];

export class AppConfigData implements Partial<Record<AppConfigDataKeys, string | boolean>> {
  public openAIApiKey?: string;
  public quiet?: boolean;
  public verbose?: boolean;
  public maxAskTokens?: number;
  public askModel?: string;

  static getAvailableKeys(): string[] {
    return [...AppConfigDataKeys];
  }

  constructor(data: Partial<AppConfigData> = {}) {
    Object.assign(this, data);
  }

  merge(data: Partial<AppConfigData>): AppConfigData {
    return new AppConfigData({ ...this, ...data });
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
