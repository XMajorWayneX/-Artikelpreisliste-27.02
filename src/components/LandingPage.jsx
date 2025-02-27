import React, { useState } from 'react';
import { auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, sendEmailVerification } from '../firebase';

function LandingPage({ onSignIn }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(userCredential.user);
      setVerificationSent(true);
      setError('');
    } catch (error) {
      setError(error.message);
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      onSignIn();
    } catch (error) {
      setError(error.message);
    }
  };

  const handleResetPassword = async () => {
    try {
      await sendPasswordResetEmail(auth, email);
      alert('Passwort-Reset-E-Mail gesendet!');
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="landing-container">
      <h1>Kalkulationsliste</h1>
      <div className="auth-container">
        <h2>{isSignUp ? 'Registrieren' : 'Anmelden'}</h2>

        {verificationSent ? (
          <p>Bitte bestätigen Sie Ihre E-Mail-Adresse, um Ihr Konto zu aktivieren.</p>
        ) : (
          <>
            <form onSubmit={isSignUp ? handleSignUp : handleSignIn}>
              <input
                type="email"
                placeholder="E-Mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                type="password"
                placeholder="Passwort"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button type="submit">{isSignUp ? 'Registrieren' : 'Anmelden'}</button>
            </form>

            {!isSignUp && (
              <>
                <button onClick={handleResetPassword}>Passwort vergessen?</button>
                <p>
                  Noch kein Konto? <button onClick={() => setIsSignUp(true)}>Registrieren</button>
                </p>
              </>
            )}

            {isSignUp && (
              <p>
                Hast du schon ein Konto? <button onClick={() => setIsSignUp(false)}>Anmelden</button>
              </p>
            )}
          </>
        )}

        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
}

export default LandingPage;
