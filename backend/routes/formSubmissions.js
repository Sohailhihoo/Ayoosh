const express = require('express');
const router = express.Router();
const FormSubmission = require('../models/FormSubmission');
const { protect, authorize } = require('../middleware/auth');

// POST /api/form-submissions — Submit a giveaway entry (public, token-protected)
router.post('/', async (req, res) => {
    try {
        const { token, name, email, contact, handle, offersConsent, termsConsent, message } = req.body;

        const FORM_TOKEN = process.env.FORM_TOKEN;
        if (!FORM_TOKEN || token !== FORM_TOKEN) {
            return res.status(403).json({ error: 'Invalid token' });
        }

        if (!name?.trim() || !email?.trim() || !contact?.trim()) {
            return res.status(400).json({ error: 'Name, email, and contact number are required' });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            return res.status(400).json({ error: 'Invalid email address' });
        }

        await FormSubmission.create({
            name:          name.trim(),
            email:         email.trim(),
            contact:       contact.trim(),
            handle:        handle.trim(),
            offersConsent: Boolean(offersConsent),
            termsConsent:  Boolean(termsConsent),
            message:       message?.trim() || '',
        });

        res.status(201).json({ success: true });
    } catch (error) {
        console.error('Form submission error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/form-submissions — Get all giveaway entries (admin only)
router.get('/', protect, authorize('admin'), async (req, res) => {
    try {
        const { page = 1, limit = 50, search } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const filter = {};
        if (search) {
            const regex = new RegExp(search, 'i');
            filter.$or = [{ name: regex }, { email: regex }, { handle: regex }];
        }

        const [submissions, total] = await Promise.all([
            FormSubmission.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            FormSubmission.countDocuments(filter),
        ]);

        res.json({ success: true, submissions, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
    } catch (error) {
        console.error('Form submissions fetch error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch submissions' });
    }
});

// DELETE /api/form-submissions/:id — Delete a submission (admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const submission = await FormSubmission.findByIdAndDelete(req.params.id);
        if (!submission) return res.status(404).json({ success: false, message: 'Submission not found' });
        res.json({ success: true, message: 'Submission deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete submission' });
    }
});

module.exports = router;
