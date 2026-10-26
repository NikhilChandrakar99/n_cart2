const { getSafeFilePath, readJsonFile, writeJsonFile } = require('../../src/utils/fileStorage');

describe('File Storage and Security Tests', () => {
  it('should resolve safe file path for whitelisted collections', () => {
    const p = getSafeFilePath('products.json');
    expect(p).toContain('products.json');
  });

  it('should block unwhitelisted collection filenames', () => {
    expect(() => getSafeFilePath('passwords.json')).toThrow(/Unauthorized or unwhitelisted storage collection/);
    expect(() => getSafeFilePath('malicious.js')).toThrow(/Unauthorized or unwhitelisted storage collection/);
  });

  it('should reject path traversal attempts', () => {
    expect(() => getSafeFilePath('../../../etc/passwd')).toThrow();
    expect(() => getSafeFilePath('..\\..\\windows\\system32')).toThrow();
  });

  it('should atomically write and read JSON data', () => {
    const testItems = [{ id: 'test-1', label: 'Item 1' }];
    writeJsonFile('contacts.json', testItems);
    const read = readJsonFile('contacts.json');
    expect(read).toEqual(testItems);
  });
});
