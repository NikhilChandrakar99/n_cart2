/**
 * File Storage Utility
 * Safe, atomic, local JSON persistence with path traversal protection.
 */

const fs = require('fs');
const path = require('path');
const config = require('../config');
const logger = require('./logger');

// Whitelisted collection file names to strictly avoid path traversal
const ALLOWED_COLLECTIONS = new Set([
  'products.json',
  'categories.json',
  'cart.json',
  'wishlist.json',
  'orders.json',
  'contacts.json'
]);

/**
 * Validates and resolves a safe absolute path for a data collection file.
 * Prevents directory traversal attacks by ensuring the file name is an allowed
 * collection and resides strictly inside config.dataDir.
 * @param {string} filename - Collection filename (e.g. 'products.json')
 * @returns {string} Safe absolute file path
 */
function getSafeFilePath(filename) {
  if (!filename || typeof filename !== 'string') {
    throw new Error('Invalid file name provided to storage.');
  }

  const baseName = path.basename(filename);
  if (!ALLOWED_COLLECTIONS.has(baseName)) {
    throw new Error(`Unauthorized or unwhitelisted storage collection: ${baseName}`);
  }

  const resolvedPath = path.resolve(config.dataDir, baseName);
  const dataDirResolved = path.resolve(config.dataDir);

  if (!resolvedPath.startsWith(dataDirResolved)) {
    throw new Error('Security violation: Path traversal detected.');
  }

  return resolvedPath;
}

/**
 * Ensures data directory exists
 */
function ensureDataDir() {
  if (!fs.existsSync(config.dataDir)) {
    fs.mkdirSync(config.dataDir, { recursive: true });
  }
}

/**
 * Reads and parses a JSON data file safely.
 * @param {string} filename - Name of file in data directory
 * @param {*} defaultValue - Fallback default if file does not exist or is empty
 * @returns {any} Parsed JSON data
 */
function readJsonFile(filename, defaultValue = []) {
  ensureDataDir();
  const filePath = getSafeFilePath(filename);

  if (!fs.existsSync(filePath)) {
    // If file does not exist, initialize it with defaultValue
    writeJsonFile(filename, defaultValue);
    return defaultValue;
  }

  try {
    const rawData = fs.readFileSync(filePath, 'utf-8');
    if (!rawData.trim()) {
      return defaultValue;
    }
    return JSON.parse(rawData);
  } catch (err) {
    logger.error(`Error reading JSON file [${filename}]: ${err.message}`);
    // If file is corrupted, return default value to avoid app crash
    return defaultValue;
  }
}

/**
 * Writes data to a JSON file atomically to prevent data corruption.
 * Writes to a temporary file first, then renames it over the target file.
 * @param {string} filename - Target filename
 * @param {any} data - Data to serialize
 */
function writeJsonFile(filename, data) {
  ensureDataDir();
  const filePath = getSafeFilePath(filename);
  const tempPath = `${filePath}.tmp.${Date.now()}.${Math.random().toString(36).substring(2, 8)}`;

  try {
    const serialized = JSON.stringify(data, null, 2);
    fs.writeFileSync(tempPath, serialized, 'utf-8');
    fs.renameSync(tempPath, filePath);
    return true;
  } catch (err) {
    logger.error(`Error writing JSON file [${filename}]: ${err.message}`);
    // Clean up temp file if rename failed
    if (fs.existsSync(tempPath)) {
      try {
        fs.unlinkSync(tempPath);
      } catch (cleanErr) {
        logger.warn(`Failed to cleanup temp file ${tempPath}: ${cleanErr.message}`);
      }
    }
    throw new Error(`Failed to persist data to ${filename}`);
  }
}

module.exports = {
  getSafeFilePath,
  readJsonFile,
  writeJsonFile,
  ALLOWED_COLLECTIONS
};
