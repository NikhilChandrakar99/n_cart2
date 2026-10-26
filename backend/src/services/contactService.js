/**
 * Contact Service
 * Manages customer inquiries and contact message submissions.
 */

const { readJsonFile, writeJsonFile } = require('../utils/fileStorage');

const CONTACTS_FILE = 'contacts.json';

class ContactService {
  /**
   * Retrieves all contact submissions
   */
  static async getSubmissions() {
    const list = readJsonFile(CONTACTS_FILE, []);
    return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  /**
   * Saves a new contact submission
   */
  static async createSubmission(data) {
    const submissions = readJsonFile(CONTACTS_FILE, []);
    const newEntry = {
      id: `msg-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      subject: data.subject.trim(),
      message: data.message.trim(),
      status: 'new',
      createdAt: new Date().toISOString()
    };

    submissions.push(newEntry);
    writeJsonFile(CONTACTS_FILE, submissions);
    return newEntry;
  }
}

module.exports = ContactService;
