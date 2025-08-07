import { useState } from 'react';
import { useLocation } from 'wouter';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { MessageCircle, Eye, EyeOff, UserPlus } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const registerSchema = loginSchema.extend({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showResendConfirmation, setShowResendConfirmation] = useState(false);
  const [resendEmail, setResendEmail] = useState('');
  const { signIn, signUp, resendConfirmation } = useAuth();
  const [, setLocation] = useLocation();

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      fullName: '',
      confirmPassword: '',
    },
  });

  const onLoginSubmit = async (data: LoginForm) => {
    setLoading(true);
    try {
      await signIn(data.email, data.password);
      onClose();
      // Redirect to chat page after successful login
      setLocation('/chat');
    } catch (error: any) {
      console.log('Login error caught in component:', error);
      // Check if it's an email confirmation issue
      if (error?.message?.includes('Email not confirmed') || error?.message?.includes('email_not_confirmed')) {
        setShowResendConfirmation(true);
        setResendEmail(data.email);
      }
    } finally {
      setLoading(false);
    }
  };

  const onRegisterSubmit = async (data: RegisterForm) => {
    setLoading(true);
    try {
      await signUp(data.email, data.password, data.fullName);
      // Don't close modal or redirect after signup - user needs to confirm email first
      setShowResendConfirmation(true);
      setResendEmail(data.email);
    } catch (error: any) {
      console.log('Registration error caught in component:', error);
      // Check if user already exists
      if (error?.message?.includes('User already registered')) {
        // Switch to login mode
        setIsLogin(true);
        loginForm.setValue('email', data.email);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            {isLogin ? (
              <MessageCircle className="text-white text-2xl" size={24} />
            ) : (
              <UserPlus className="text-white text-2xl" size={24} />
            )}
          </div>
          <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {isLogin ? 'Welcome to ChatterLite' : 'Create Account'}
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            {isLogin ? 'Sign in to start chatting' : 'Join ChatterLite today'}
          </DialogDescription>
          
          {/* Debug info for development */}
          {import.meta.env.DEV && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded text-xs text-blue-700 dark:text-blue-300">
              <p>Supabase URL: {import.meta.env.VITE_SUPABASE_URL ? '✓ Set' : '✗ Missing'}</p>
              <p>Supabase Key: {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✓ Set' : '✗ Missing'}</p>
            </div>
          )}
        </DialogHeader>

        {isLogin ? (
          <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                {...loginForm.register('email')}
                className="rounded-xl"
              />
              {loginForm.formState.errors.email && (
                <p className="text-red-500 dark:text-red-400 text-sm mt-1">{loginForm.formState.errors.email.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  {...loginForm.register('password')}
                  className="rounded-xl pr-12"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </Button>
              </div>
              {loginForm.formState.errors.password && (
                <p className="text-red-500 text-sm mt-1">{loginForm.formState.errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 rounded-xl py-3"
              data-testid="button-signin"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
            
            {showResendConfirmation && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-2">
                  Need to confirm your email? We can resend the confirmation link.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    resendConfirmation(resendEmail || loginForm.getValues('email'));
                    setShowResendConfirmation(false);
                  }}
                  className="w-full"
                  data-testid="button-resend-confirmation"
                >
                  Resend Confirmation Email
                </Button>
              </div>
            )}
          </form>
        ) : (
          <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Enter your full name"
                {...registerForm.register('fullName')}
                className="rounded-xl"
              />
              {registerForm.formState.errors.fullName && (
                <p className="text-red-500 text-sm mt-1">{registerForm.formState.errors.fullName.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                {...registerForm.register('email')}
                className="rounded-xl"
              />
              {registerForm.formState.errors.email && (
                <p className="text-red-500 text-sm mt-1">{registerForm.formState.errors.email.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a strong password"
                {...registerForm.register('password')}
                className="rounded-xl"
              />
              {registerForm.formState.errors.password && (
                <p className="text-red-500 text-sm mt-1">{registerForm.formState.errors.password.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                {...registerForm.register('confirmPassword')}
                className="rounded-xl"
              />
              {registerForm.formState.errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">{registerForm.formState.errors.confirmPassword.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 rounded-xl py-3"
              data-testid="button-signup"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
            
            {showResendConfirmation && (
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-sm text-green-800 dark:text-green-200 mb-2">
                  Account created! Please check your email and click the confirmation link before signing in.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    resendConfirmation(resendEmail);
                  }}
                  className="w-full mb-2"
                  data-testid="button-resend-confirmation"
                >
                  Resend Confirmation Email
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsLogin(true);
                    setShowResendConfirmation(false);
                    loginForm.setValue('email', resendEmail);
                  }}
                  className="w-full"
                >
                  Already confirmed? Sign In
                </Button>
              </div>
            )}
          </form>
        )}

        <div className="text-center">
          <p className="text-gray-600">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <Button
              variant="link"
              className="text-indigo-600 font-semibold p-0"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </Button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
