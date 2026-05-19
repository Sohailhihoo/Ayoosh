import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/mongodb';

const FORM_TOKEN = process.env.FORM_TOKEN;

const formSubmissionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 200 },
    email: { type: String, required: true, trim: true, maxlength: 320 },
    message: { type: String, required: true, trim: true, maxlength: 5000 },
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
    const { token, name, email, message } = body;

    if (!FORM_TOKEN || token !== FORM_TOKEN) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 403 });
    }

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    await connectToDatabase();

    await FormSubmission.create({
      name: name.trim(),
      email: email.trim(),
      message: message.trim(),
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Form submission error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
