export interface ArchiveRecord {
  description: string;
  content: string;
  createdAt: string;
  type: 'generate' | 'ask';
}
