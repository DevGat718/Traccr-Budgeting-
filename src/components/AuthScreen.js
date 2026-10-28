import React, { useState, useRef } from 'react';
import {
  registerTraccrUser,
  signInTraccrUser,
  signInDemoUser,
} from '../utils/firebaseAuth.js';
import { processProfileImageFile } from '../utils/dataStorage.js';
import { ExecutiveSedanGraphic } from './Summary.js';

/**
 * AuthScreen Component
 * Displays the DMG Official TRACCR Login & Sign-Up gateway.
 * Sign-Up collects First Name, Last Name, Email Address, Phone Number, Password,
 * and optional Profile Picture upload.
 */
export default function AuthScreen({ onAuthenticated }) {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef(null);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await processProfileImageFile(file);
      setPhotoURL(dataUrl);
    } catch (err) {
      setError('Could not load image file.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'signup') {
        const user = await registerTraccrUser({
          firstName,
          lastName,
          email,
          phone,
          password,
          photoURL,
        });
        onAuthenticated(user);
      } else {
        const user = await signInTraccrUser({ email, password });
        onAuthenticated(user);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = () => {
    const user = signInDemoUser();
    onAuthenticated(user);
  };

  return (
    <div className="dmg-auth-page">
      <div className="dmg-auth-showcase-col">
        <div className="dmg-auth-brand-block">
          <div className="dmg-crown-wrap">
            <svg
              className="dmg-crown-svg dmg-auth-crown"
              viewBox="0 0 44 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4 20L8 6L16 14L22 2L28 14L36 6L40 20H4Z"
                fill="#22c55e"
              />
              <rect x="5" y="21.5" width="34" height="2" rx="1" fill="#22c55e" />
            </svg>
          </div>
          <h1 className="dmg-auth-wordmark">TRACCR</h1>
          <div className="dmg-auth-byline">BY DMG OFFICIAL</div>
          <div className="dmg-auth-pillars">
            INCOME &nbsp;|&nbsp; EXPENSES &nbsp;|&nbsp; MILEAGE &nbsp;|&nbsp; INSIGHTS &nbsp;|&nbsp; CONTROL
          </div>
        </div>

        <div className="dmg-auth-car-showcase">
          <ExecutiveSedanGraphic className="dmg-auth-sedan-svg" />
          <div className="dmg-auth-slogan">
            <span>TRACK TODAY.</span>
            <span>BUILD TOMORROW.</span>
          </div>
        </div>

        <div className="dmg-auth-feature-list">
          <div className="dmg-auth-feat">
            <div className="dmg-auth-feat-icon">$</div>
            <div>
              <strong>Track Income &amp; Expenses</strong>
              <p>All your 2026 income streams and categorized spending in one place.</p>
            </div>
          </div>

          <div className="dmg-auth-feat">
            <div className="dmg-auth-feat-icon">🚗</div>
            <div>
              <strong>Multi-Vehicle Mileage &amp; MPG</strong>
              <p>Log work or personal miles across all your vehicles with auto MPG calculation.</p>
            </div>
          </div>

          <div className="dmg-auth-feat">
            <div className="dmg-auth-feat-icon">☁️</div>
            <div>
              <strong>Firebase Account Sync</strong>
              <p>Securely sign up with your email &amp; phone number to access anywhere.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="dmg-auth-form-col">
        <div className="dmg-auth-card">
          <div className="dmg-auth-card-head">
            <h2>{mode === 'login' ? 'Welcome Back to TRACCR' : 'Create Your TRACCR Account'}</h2>
            <p>
              {mode === 'login'
                ? 'Log in to access your 2026 financial & mileage dashboard.'
                : 'Sign up with your name, email address, and phone number to get started.'}
            </p>
          </div>

          <div className="dmg-toggle-Segmented" style={{ marginBottom: '20px' }}>
            <button
              type="button"
              className={`dmg-seg-btn ${mode === 'login' ? 'active' : ''}`}
              onClick={() => {
                setMode('login');
                setError('');
              }}
            >
              Log In
            </button>
            <button
              type="button"
              className={`dmg-seg-btn ${mode === 'signup' ? 'active' : ''}`}
              onClick={() => {
                setMode('signup');
                setError('');
              }}
            >
              Sign Up
            </button>
          </div>

          {error && <div className="dmg-form-error">{error}</div>}

          <form onSubmit={handleSubmit} className="dmg-form-body">
            {mode === 'signup' && (
              <>
                {/* Optional Profile Picture Upload on Sign-Up */}
                <div className="dmg-signup-photo-row">
                  <div
                    className="dmg-signup-avatar-preview"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {photoURL ? (
                      <img src={photoURL} alt="Profile preview" />
                    ) : (
                      <span>📷</span>
                    )}
                  </div>
                  <div className="dmg-signup-photo-text">
                    <strong>Profile Picture (Optional)</strong>
                    <button
                      type="button"
                      className="dmg-upload-Trigger-link"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {photoURL ? 'Change Picture' : 'Upload Photo'}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handlePhotoUpload}
                    />
                  </div>
                </div>

                <div className="dmg-field-row">
                  <div className="dmg-field">
                    <label>First Name</label>
                    <input
                      type="text"
                      className="dmg-input"
                      placeholder="Devin"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>
                  <div className="dmg-field">
                    <label>Last Name *</label>
                    <input
                      type="text"
                      className="dmg-input"
                      placeholder="Gatling"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="dmg-field">
                  <label>Phone Number *</label>
                  <input
                    type="tel"
                    className="dmg-input"
                    placeholder="(718) 555-0199"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
              </>
            )}

            <div className="dmg-field">
              <label>Email Address *</label>
              <input
                type="email"
                className="dmg-input"
                placeholder="devin@dmgofficial.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="dmg-field">
              <label>Password *</label>
              <input
                type="password"
                className="dmg-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="dmg-submit-green" disabled={loading}>
              {loading
                ? 'Processing...'
                : mode === 'login'
                ? 'Log In to TRACCR'
                : 'Create TRACCR Account'}
            </button>
          </form>

          <div className="dmg-auth-divider">
            <span>OR</span>
          </div>

          <button
            type="button"
            className="dmg-demo-login-btn"
            onClick={handleQuickDemo}
          >
            <span>👑</span> Enter as Devin Gatling (DMG Official 2026 Demo)
          </button>
        </div>
      </div>
    </div>
  );
}
