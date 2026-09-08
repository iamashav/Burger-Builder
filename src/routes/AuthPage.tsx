import { useState, type FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '../components/Button/Button';
import { Input } from '../components/Input/Input';
import { Spinner } from '../components/Spinner/Spinner';
import { checkValidity, type ValidationRules } from '../lib/validation';
import { formatAuthError, useSignInMutation, useSignUpMutation } from '../store/authApi';
import { credentialsReceived, selectIsAuthenticated, selectRedirectPath } from '../store/authSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';

const EMAIL_RULES: ValidationRules = { required: true, isEmail: true };
const PASSWORD_RULES: ValidationRules = { required: true, minLength: 6 };

export function AuthPage() {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const redirectPath = useAppSelector(selectRedirectPath);

  const [isSignup, setIsSignup] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState(false);

  const [signUp, signUpState] = useSignUpMutation();
  const [signIn, signInState] = useSignInMutation();
  const { isLoading, error } = isSignup ? signUpState : signInState;

  const emailValid = checkValidity(email, EMAIL_RULES);
  const passwordValid = checkValidity(password, PASSWORD_RULES);
  const formValid = emailValid && passwordValid;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setTouched(true);
    if (!formValid) return;

    const request = { email: email.trim(), password };
    const result = await (isSignup ? signUp(request) : signIn(request));
    if (!('data' in result) || !result.data) return;

    dispatch(
      credentialsReceived({
        token: result.data.idToken,
        userId: result.data.localId,
        expiresAt: Date.now() + Number(result.data.expiresIn) * 1000,
      }),
    );
  };

  if (isAuthenticated) return <Navigate to={redirectPath} replace />;

  const errorMessage = formatAuthError(error && 'status' in error ? error : undefined);

  return (
    <div className="mx-auto max-w-md bg-ash p-6 ring-1 ring-smoke/15 sm:p-8">
      <h1 className="font-display text-2xl tracking-wide">
        {isSignup ? 'Create an account' : 'Welcome back'}
      </h1>
      <p className="section-label mt-1 mb-6">
        {isSignup ? 'You need one to place an order' : 'Sign in to see your orders'}
      </p>

      {errorMessage && (
        <p role="alert" className="mb-4 border border-danger/40 px-3 py-2 text-sm text-danger">
          {errorMessage}
        </p>
      )}

      {isLoading ? (
        <Spinner label={isSignup ? 'Creating account' : 'Signing in'} />
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="ada@example.com"
            value={email}
            onChange={setEmail}
            invalid={!emailValid}
            touched={touched}
            errorMessage="Enter a valid email address."
          />
          <Input
            label="Password"
            type="password"
            autoComplete={isSignup ? 'new-password' : 'current-password'}
            placeholder="At least 6 characters"
            value={password}
            onChange={setPassword}
            invalid={!passwordValid}
            touched={touched}
            errorMessage="Passwords must be at least 6 characters."
          />

          <Button type="submit" className="mt-2 w-full py-3">
            {isSignup ? 'Sign up' : 'Sign in'}
          </Button>
        </form>
      )}

      <Button
        variant="ghost"
        className="mt-4 w-full"
        onClick={() => {
          setIsSignup((signup) => !signup);
          setTouched(false);
        }}
      >
        {isSignup ? 'I already have an account' : 'I need an account'}
      </Button>
    </div>
  );
}
