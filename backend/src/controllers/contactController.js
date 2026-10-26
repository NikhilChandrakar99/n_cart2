/**
 * Contact Controller
 */

const ContactService = require('../services/contactService');
const ApiResponse = require('../utils/apiResponse');

class ContactController {
  static async getSubmissions(req, res, next) {
    try {
      const submissions = await ContactService.getSubmissions();
      return ApiResponse.success(res, submissions, 'Contact submissions retrieved');
    } catch (err) {
      next(err);
    }
  }

  static async submitContactForm(req, res, next) {
    try {
      const submission = await ContactService.createSubmission(req.body);
      return ApiResponse.created(
        res,
        { id: submission.id, name: submission.name, email: submission.email },
        'Thank you! Your message has been received. Our team will contact you shortly.'
      );
    } catch (err) {
      next(err);
    }
  }
}

module.exports = ContactController;
