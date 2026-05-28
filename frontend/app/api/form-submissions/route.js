import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/mongodb';

const formSubmissionSchema = new mongoose.Schema(
  {
    name:          { type: String, required: true, trim: true, maxlength: 200 },
    email:         { type: String, required: true, trim: true, maxlength: 320 },
    contact:       { type: String, trim: true, maxlength: 20 },
    handle:        { type: String, trim: true, maxlength: 100 },
    offersConsent: { type: Boolean, default: false },
    termsConsent:  { type: Boolean, default: false },
    message:       { type: String, trim: true, maxlength: 5000 },
  },
  { timestamps: true }
);

// Avoid model recompilation on hot reloads in development
const FormSubmission =
  mongoose.models.FormSubmission ||
  mongoose.model('FormSubmission', formSubmissionSchema);

export async function POST(request) {
  try {
    const body = await request.json();
    const { token, name, email, contact, handle, offersConsent, termsConsent, message } = body;
    const FORM_TOKEN = process.env.FORM_TOKEN;

    if (!FORM_TOKEN || token !== FORM_TOKEN) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 403 });
    }

    if (!name?.trim() || !email?.trim() || !contact?.trim()) {
      return NextResponse.json({ error: 'Name, email, and contact number are required' }, { status: 400 });
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    await connectToDatabase();

    await FormSubmission.create({
      name:          name.trim(),
      email:         email.trim(),
      contact:       contact.trim(),
      handle:        handle.trim(),
      offersConsent: Boolean(offersConsent),
      termsConsent:  Boolean(termsConsent),
      message:       message?.trim() || '',
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Form submission error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
