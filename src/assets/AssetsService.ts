import { Service } from 'typedi';
import { IO } from '../utils/IO.js';
import path from 'node:path';

@Service()
export class AssetsService {
  private assetsFolder: string | undefined = undefined;
  private availableAssets = [
    { name: 'fish', path: 'tprompter.fish' },
    { name: 'chatgptloader', path: 'chatGPTRemotePromptLoader.js' },
  ];

  constructor(private io: IO) {}

  getAssetsFolder(): string {
    if (!this.assetsFolder) {
      const pathname = decodeURI(new URL(import.meta.url).pathname);
      const dname = path.dirname(pathname);

      this.assetsFolder = path.resolve(dname, 'data');
    }

    return this.assetsFolder;
  }

  getAssetPath(assetName: string): string {
    return path.join(this.getAssetsFolder(), assetName);
  }

  async getAsset(assetName: string): Promise<string | null> {
    const assetObj = this.availableAssets.find((asset) => asset.name === assetName);
    if (!assetObj) {
      return null;
    }

    return this.io.readFile(this.getAssetPath(assetObj.path));
  }

  async listAvailableAssets(): Promise<string[]> {
    return this.availableAssets.map((asset) => asset.name);
  }
}
