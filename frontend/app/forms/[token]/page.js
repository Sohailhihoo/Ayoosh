'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function FormPage() {
    const { token } = useParams();
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        contact: '',
        email: '',
        handle: '',
        offersConsent: false,
        termsConsent: false,
    });
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.termsConsent) {
            toast.error('Please agree to the giveaway terms & conditions.');
            return;
        }
        setLoading(true);
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000/api';
            const res = await fetch(`${API_URL}/form-submissions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, ...formData }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Submission failed');
            setSubmitted(true);
        } catch (error) {
            toast.error(error.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@600;700&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Jost:wght@300;400;500;600&display=swap');

                *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

                .gp-root {
                    min-height: 100vh;
                    background:
                        url('https://res.cloudinary.com/dpdg462fb/image/upload/f_auto,q_auto,w_1280/v1779819788/bg_form_em4cb1.jpg')
                        center center / cover no-repeat fixed;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 3rem 1.25rem;
                    font-family: 'Jost', sans-serif;
                    position: relative;
                }

                .gp-root::before {
                    content: '';
                    position: fixed;
                    inset: 0;
                    background: linear-gradient(
                        160deg,
                        rgba(4,4,4,0.72) 0%,
                        rgba(8,8,8,0.58) 50%,
                        rgba(12,10,6,0.70) 100%
                    );
                    z-index: 0;
                }

                /* ── Card ─────────────────────────────────────────── */
                .gp-card {
                    position: relative;
                    z-index: 1;
                    width: 100%;
                    max-width: 500px;
                    background: rgba(255,255,255,0.045);
                    border: 1px solid rgba(201,168,76,0.18);
                    border-radius: 2px;
                    backdrop-filter: blur(18px) saturate(1.4);
                    -webkit-backdrop-filter: blur(18px) saturate(1.4);
                    box-shadow:
                        0 0 0 1px rgba(201,168,76,0.06) inset,
                        0 32px 80px rgba(0,0,0,0.55),
                        0 0 120px rgba(201,168,76,0.04);
                    animation: cardReveal 0.9s cubic-bezier(0.22,1,0.36,1) both;
                }

                @keyframes cardReveal {
                    from { opacity: 0; transform: translateY(32px) scale(0.98); }
                    to   { opacity: 1; transform: translateY(0) scale(1); }
                }

                /* ── Top logo ─────────────────────────────────────── */
                .gp-logo-btn {
                    background: none;
                    border: none;
                    cursor: pointer;
                    padding: 0;
                    display: block;
                    opacity: 0.88;
                    transition: opacity 0.2s ease;
                }

                .gp-logo-btn:hover { opacity: 1; }

                .gp-logo-img {
                    height: 90px;
                    width: auto;
                    display: block;
                    filter: drop-shadow(0 2px 8px rgba(0,0,0,0.4));
                }

                /* Gold top accent */
                .gp-card::before {
                    content: '';
                    position: absolute;
                    top: 0; left: 0; right: 0;
                    height: 1px;
                    background: linear-gradient(90deg, transparent 0%, #c9a84c 40%, #f0c040 60%, transparent 100%);
                    opacity: 0.9;
                }

                /* ── Header ───────────────────────────────────────── */
                .gp-header {
                    text-align: center;
                    padding: 2.75rem 2.5rem 1.75rem;
                    border-bottom: 1px solid rgba(201,168,76,0.10);
                }

                /* Script main title */
                .gp-title {
                    font-family: 'Dancing Script', cursive;
                    font-size: clamp(2.6rem, 10vw, 3.75rem);
                    font-weight: 700;
                    line-height: 1.05;
                    color: #fff;
                    margin-bottom: 0.85rem;
                    text-shadow: 0 2px 20px rgba(0,0,0,0.4);
                }

                /* Plain subtitle */
                .gp-subtitle {
                    font-family: 'Jost', sans-serif;
                    font-size: 0.88rem;
                    font-weight: 300;
                    color: rgba(255,255,255,0.65);
                    letter-spacing: 0.03em;
                    line-height: 1.6;
                    margin-bottom: 1.4rem;
                }

                .gp-divider {
                    height: 1px;
                    background: linear-gradient(90deg, transparent, rgba(201,168,76,0.45), transparent);
                    margin: 0 auto 1.4rem;
                    max-width: 120px;
                }

                /* Serif section heading */
                .gp-section-title {
                    font-family: 'Cormorant Garamond', serif;
                    font-size: clamp(1.5rem, 5vw, 1.9rem);
                    font-weight: 600;
                    color: #fff;
                    letter-spacing: 0.01em;
                }

                /* ── Form body ────────────────────────────────────── */
                .gp-body {
                    padding: 2rem 2.5rem 2.75rem;
                    display: flex;
                    flex-direction: column;
                    gap: 2rem;
                }

                .gp-field {
                    position: relative;
                }

                .gp-input {
                    width: 100%;
                    background: rgba(255,255,255,0.04);
                    border: none;
                    border-bottom: 1px solid rgba(201,168,76,0.22);
                    color: #f5f0e8;
                    font-family: 'Jost', sans-serif;
                    font-size: 0.92rem;
                    font-weight: 600;
                    padding: 1rem 0 0.75rem;
                    outline: none;
                    transition: border-color 0.3s ease, background 0.3s ease;
                    letter-spacing: 0.06em;
                    border-radius: 0;
                    text-align: center;
                }

                .gp-input::placeholder { color: transparent; }

                .gp-input:focus {
                    border-bottom-color: #c9a84c;
                    background: rgba(201,168,76,0.03);
                }

                .gp-label {
                    position: absolute;
                    top: 1rem;
                    left: 0;
                    right: 0;
                    text-align: center;
                    font-size: 0.6rem;
                    letter-spacing: 0.3em;
                    color: rgba(201,168,76,0.5);
                    text-transform: uppercase;
                    font-weight: 500;
                    pointer-events: none;
                    transition: top 0.22s ease, font-size 0.22s ease, color 0.22s ease, letter-spacing 0.22s ease;
                }

                .gp-input:focus ~ .gp-label,
                .gp-input:not(:placeholder-shown) ~ .gp-label {
                    top: -0.9rem;
                    font-size: 0.52rem;
                    color: #c9a84c;
                    letter-spacing: 0.35em;
                }

                /* Social hint */
                .gp-social-hint {
                    font-size: 0.72rem;
                    color: rgba(255,255,255,0.38);
                    letter-spacing: 0.06em;
                    font-weight: 300;
                    margin-bottom: -0.75rem;
                    text-align: center;
                }

                .gp-social-hint span {
                    color: #c9a84c;
                    font-weight: 500;
                }

                /* Checkboxes */
                .gp-checks {
                    display: flex;
                    flex-direction: column;
                    gap: 0.85rem;
                    margin-top: -0.5rem;
                }

                .gp-check-label {
                    display: flex;
                    align-items: flex-start;
                    gap: 0.75rem;
                    cursor: pointer;
                    font-size: 0.72rem;
                    color: rgba(255,255,255,0.5);
                    font-weight: 300;
                    letter-spacing: 0.02em;
                    line-height: 1.5;
                }

                .gp-check-label input[type="checkbox"] {
                    appearance: none;
                    -webkit-appearance: none;
                    width: 14px;
                    height: 14px;
                    min-width: 14px;
                    border: 1px solid rgba(201,168,76,0.35);
                    background: transparent;
                    cursor: pointer;
                    position: relative;
                    top: 1px;
                    transition: border-color 0.2s ease, background 0.2s ease;
                }

                .gp-check-label input[type="checkbox"]:checked {
                    background: #c9a84c;
                    border-color: #c9a84c;
                }

                .gp-check-label input[type="checkbox"]:checked::after {
                    content: '';
                    position: absolute;
                    left: 3px; top: 1px;
                    width: 5px; height: 8px;
                    border: 1.5px solid #080808;
                    border-top: none;
                    border-left: none;
                    transform: rotate(45deg);
                }

                /* ── Button ───────────────────────────────────────── */
                .gp-btn-wrap {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                    margin-top: 0.25rem;
                }

                .gp-btn {
                    position: relative;
                    width: 100%;
                    overflow: hidden;
                    background: linear-gradient(100deg, #b8932e 0%, #d4a83c 30%, #f0c040 55%, #d4a83c 80%, #b8932e 100%);
                    background-size: 250% 100%;
                    color: #0a0800;
                    font-family: 'Jost', sans-serif;
                    font-size: 0.7rem;
                    font-weight: 700;
                    letter-spacing: 0.38em;
                    text-transform: uppercase;
                    border: none;
                    padding: 1.15rem 2rem;
                    cursor: pointer;
                    transition: background-position 0.5s ease, transform 0.15s ease, box-shadow 0.3s ease;
                    box-shadow: 0 4px 24px rgba(201,168,76,0.22), 0 1px 0 rgba(255,255,255,0.12) inset;
                }

                .gp-btn::after {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(180deg, rgba(255,255,255,0.12) 0%, transparent 60%);
                    pointer-events: none;
                }

                .gp-btn:hover:not(:disabled) {
                    background-position: 100% 0;
                    box-shadow: 0 6px 32px rgba(201,168,76,0.38), 0 1px 0 rgba(255,255,255,0.12) inset;
                    transform: translateY(-1px);
                }

                .gp-btn:active:not(:disabled) { transform: translateY(0) scale(0.99); }
                .gp-btn:disabled { opacity: 0.45; cursor: not-allowed; }

                /* Bonus strip */
                .gp-bonus {
                    border-top: 1px solid rgba(201,168,76,0.10);
                    padding: 1rem 2.5rem 1.5rem;
                }

                .gp-bonus-title {
                    font-size: 0.58rem;
                    letter-spacing: 0.32em;
                    text-transform: uppercase;
                    color: #c9a84c;
                    font-weight: 500;
                    margin-bottom: 0.4rem;
                }

                .gp-bonus-text {
                    font-size: 0.72rem;
                    color: rgba(255,255,255,0.35);
                    font-weight: 300;
                    letter-spacing: 0.04em;
                    line-height: 1.6;
                }

                .gp-bonus-text strong {
                    color: rgba(255,255,255,0.55);
                    font-weight: 400;
                }

                /* ── Success ──────────────────────────────────────── */
                .gp-success {
                    text-align: center;
                    padding: 3.5rem 2.5rem;
                }

                .gp-check-icon {
                    width: 58px;
                    height: 58px;
                    border: 1px solid rgba(201,168,76,0.35);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 2rem;
                    animation: popIn 0.55s cubic-bezier(0.34,1.56,0.64,1) both;
                    box-shadow: 0 0 32px rgba(201,168,76,0.12);
                }

                @keyframes popIn {
                    from { transform: scale(0.5); opacity: 0; }
                    to   { transform: scale(1); opacity: 1; }
                }

                .gp-success-title {
                    font-family: 'Dancing Script', cursive;
                    font-size: clamp(2.5rem, 9vw, 3.5rem);
                    font-weight: 700;
                    color: #fff;
                    line-height: 1.1;
                    margin-bottom: 0.5rem;
                }

                .gp-success-sub {
                    font-size: 0.78rem;
                    color: rgba(255,255,255,0.38);
                    font-weight: 300;
                    letter-spacing: 0.1em;
                    line-height: 1.9;
                    margin-top: 1.25rem;
                }

                @media (max-width: 520px) {
                    .gp-header { padding: 2.25rem 1.75rem 1.5rem; }
                    .gp-body   { padding: 1.75rem 1.75rem 2.25rem; }
                    .gp-bonus  { padding: 0.875rem 1.75rem 1.25rem; }
                    .gp-success { padding: 2.75rem 1.75rem; }
                }
            `}</style>

            <div className="gp-root">
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem', width: '100%', maxWidth: '500px' }}>
                    {/* Logo above card */}
                    <button className="gp-logo-btn" onClick={() => router.push('/home')} aria-label="Go to homepage">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src="https://res.cloudinary.com/dpdg462fb/image/upload/f_auto,q_auto,w_200/v1769783995/White-color-Logo_tre0tf.png"
                            alt="Ayoosh"
                            className="gp-logo-img"
                        />
                    </button>

                <div className="gp-card" style={{ width: '100%' }}>
                    {submitted ? (
                        <div className="gp-success">
                            <div className="gp-check-icon">
                                <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#c9a84c" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h2 className="gp-success-title">You&apos;re In!</h2>
                            <div className="gp-divider" style={{ marginTop: '1.25rem' }} />
                            <p className="gp-success-sub">
                                Your entry has been received.<br />
                                We&apos;ll reach out if you&apos;re selected.<br />
                                Good luck.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="gp-header">
                                <h1 className="gp-title">Enter the Giveaway!</h1>
                                <p className="gp-subtitle">
                                    Win exclusive Ayoosh gifts, experiences &amp; surprises.
                                </p>
                                <div className="gp-divider" />
                                <h2 className="gp-section-title">Join the Ayoosh Circle!</h2>
                            </div>

                            <form onSubmit={handleSubmit} className="gp-body">
                                <div className="gp-field">
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        maxLength={200}
                                        className="gp-input"
                                        placeholder=" "
                                        id="gp-name"
                                    />
                                    <label className="gp-label" htmlFor="gp-name">Enter Your Name</label>
                                </div>

                                <div className="gp-field">
                                    <input
                                        type="tel"
                                        name="contact"
                                        value={formData.contact}
                                        onChange={handleChange}
                                        required
                                        maxLength={20}
                                        className="gp-input"
                                        placeholder=" "
                                        id="gp-contact"
                                    />
                                    <label className="gp-label" htmlFor="gp-contact">Enter Your Contact Number</label>
                                </div>

                                <div className="gp-field">
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        maxLength={320}
                                        className="gp-input"
                                        placeholder=" "
                                        id="gp-email"
                                    />
                                    <label className="gp-label" htmlFor="gp-email">Enter Your Email Address</label>
                                </div>

                                <p className="gp-social-hint">
                                    Follow us on Instagram / TikTok&nbsp;&nbsp;<span>@ayooshglobal</span>
                                </p>

                                <div className="gp-field">
                                    <input
                                        type="text"
                                        name="handle"
                                        value={formData.handle}
                                        onChange={handleChange}
                                        required
                                        maxLength={100}
                                        className="gp-input"
                                        placeholder=" "
                                        id="gp-handle"
                                    />
                                    <label className="gp-label" htmlFor="gp-handle">Drop Your Instagram / TikTok Handle</label>
                                </div>

                                <div className="gp-checks">
                                    <label className="gp-check-label">
                                        <input
                                            type="checkbox"
                                            name="offersConsent"
                                            checked={formData.offersConsent}
                                            onChange={handleChange}
                                        />
                                        I&apos;d like to receive exclusive offers &amp; launch updates
                                    </label>
                                    <label className="gp-check-label">
                                        <input
                                            type="checkbox"
                                            name="termsConsent"
                                            checked={formData.termsConsent}
                                            onChange={handleChange}
                                        />
                                        I agree to the giveaway terms &amp; conditions
                                    </label>
                                </div>

                                <div className="gp-btn-wrap">
                                    <button type="submit" disabled={loading} className="gp-btn">
                                        {loading ? 'Entering\u2026' : 'Enter Giveaway'}
                                    </button>
                                </div>
                            </form>

                            <div className="gp-bonus">
                                <p className="gp-bonus-title">Bonus Entry</p>
                                <p className="gp-bonus-text">
                                    <strong>Post your Ayoosh moment</strong> and tag <strong>@ayooshglobal</strong> for an extra chance to win.
                                </p>
                            </div>
                        </>
                    )}
                </div>
                </div>
            </div>
        </>
    );
}
