import { Service } from 'typedi';

@Service()
export class EnvironmentInfo {
  get platform(): string {
    return process.platform;
  }

  get machine(): string {
    return process.arch;
  }

  get shell(): string {
    // FIXME it returns default shell for the platform, not the current shell
    return process.env.SHELL || '';
  }
}
