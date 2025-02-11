import { Container } from 'typedi';
import { WriteUnitTestsPrompt } from './WriteUnitTestsPrompt.js';
import { StdinDataReader } from '../utils/StdinDataReader.js';
import { IO } from '../utils/IO.js';
import * as enrichTextDataUtils from '../utils/enrichTextData.js';

describe(WriteUnitTestsPrompt.name, () => {
  let prompt: WriteUnitTestsPrompt;
  let mockStdinReader: jest.Mocked<StdinDataReader>;
  let mockIO: jest.Mocked<IO>;

  beforeEach(() => {
    // Create mock instances
    mockStdinReader = {
      readData: jest.fn(),
    } as jest.Mocked<StdinDataReader>;

    mockIO = {
      readFile: jest.fn(),
    } as unknown as jest.Mocked<IO>;

    // Set up Container
    Container.set(StdinDataReader, mockStdinReader);
    Container.set(IO, mockIO);

    prompt = new WriteUnitTestsPrompt(mockStdinReader, mockIO);
  });

  afterEach(() => {
    jest.resetAllMocks();
    Container.reset();
  });

  describe('constructor', () => {
    it('should create an instance with the correct name', () => {
      expect(prompt.name).toBe('write_unit_tests');
    });
  });

  describe('generate', () => {
    beforeEach(() => {
      jest.spyOn(enrichTextDataUtils, 'enrichTextData');
    });

    it('should generate the expected prompt with enriched data', async () => {
      // Arrange
      const mockInputCode = 'class Example {}';
      const mockInputExamples = 'describe("test", () => {});';
      const mockEnrichedCode = 'enriched:class Example {}';
      const mockEnrichedExamples = 'enriched:describe("test", () => {});';

      mockStdinReader.readData
        .mockResolvedValueOnce(mockInputCode)
        .mockResolvedValueOnce(mockInputExamples);

      (enrichTextDataUtils.enrichTextData as jest.Mock)
        .mockResolvedValueOnce(mockEnrichedCode)
        .mockResolvedValueOnce(mockEnrichedExamples);

      // Act
      const result = await prompt.generate();

      // Assert
      expect(mockStdinReader.readData).toHaveBeenCalledTimes(2);
      expect(mockStdinReader.readData).toHaveBeenNthCalledWith(
        1,
        'Enter the TypeScript + NestJS code:',
      );
      expect(mockStdinReader.readData).toHaveBeenNthCalledWith(
        2,
        'Enter the Jest unit test examples:',
      );

      expect(enrichTextDataUtils.enrichTextData).toHaveBeenCalledTimes(2);
      expect(enrichTextDataUtils.enrichTextData).toHaveBeenNthCalledWith(
        1,
        mockInputCode,
        mockIO.readFile,
      );
      expect(enrichTextDataUtils.enrichTextData).toHaveBeenNthCalledWith(
        2,
        mockInputExamples,
        mockIO.readFile,
      );

      // Verify the generated prompt structure
      expect(result).toContain('I have the following TypeScript code:');
      expect(result).toContain('```typescript\n' + mockEnrichedCode + '\n```');
      expect(result).toContain('I also have some Jest unit test examples for reference:');
      expect(result).toContain('```typescript\n' + mockEnrichedExamples + '\n```');
      expect(result).toContain('Your task is to:');
      expect(result).toContain('The output should include:');
    });

    it('should handle errors during stdin reading', async () => {
      // Arrange
      const error = new Error('Failed to read input');
      mockStdinReader.readData.mockRejectedValue(error);

      // Act & Assert
      await expect(prompt.generate()).rejects.toThrow(error);
      expect(mockStdinReader.readData).toHaveBeenCalledTimes(1);
    });

    it('should handle errors during text enrichment', async () => {
      // Arrange
      const mockInputCode = 'class Example {}';
      mockStdinReader.readData.mockResolvedValue(mockInputCode);
      const error = new Error('Failed to enrich text');
      (enrichTextDataUtils.enrichTextData as jest.Mock).mockRejectedValue(error);

      // Act & Assert
      await expect(prompt.generate()).rejects.toThrow(error);
      expect(enrichTextDataUtils.enrichTextData).toHaveBeenCalledTimes(1);
    });

    it('should maintain consistent indentation in the generated prompt', async () => {
      // Arrange
      mockStdinReader.readData.mockResolvedValueOnce('code').mockResolvedValueOnce('example');
      (enrichTextDataUtils.enrichTextData as jest.Mock)
        .mockResolvedValueOnce('enriched:code')
        .mockResolvedValueOnce('enriched:example');

      // Act
      const result = await prompt.generate();

      // Assert
      const lines = result.split('\n');
      const taskLines = lines.filter((line) => line.includes('      '));
      expect(taskLines.every((line) => line.startsWith('        '))).toBe(true);
    });
  });
});
