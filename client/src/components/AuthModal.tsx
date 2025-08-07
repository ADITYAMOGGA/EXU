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
  const { signIn, signUp } = useAuth();
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
    } catch (error) {
      // Error handling is done in useAuth
    } finally {
      setLoading(false);
    }
  };

  const onRegisterSubmit = async (data: RegisterForm) => {
    setLoading(true);
    try {
      await signUp(data.email, data.password, data.fullName);
      onClose();
      // Redirect to chat page after successful registration
      setLocation('/chat');
    } catch (error) {
      // Error handling is done in useAuth
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
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
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
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
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
