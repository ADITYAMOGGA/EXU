import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { AuthModal } from '@/components/AuthModal';
import { 
  MessageSquare, 
  Users, 
  Shield, 
  Zap, 
  Heart,
  Sparkles,
  ArrowRight,
  Github,
  Twitter
} from 'lucide-react';

export default function Landing() {
  const [, setLocation] = useLocation();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleGetStarted = () => {
    setShowAuthModal(true);
  };

  const handleSignIn = () => {
    setShowAuthModal(true);
  };

  const features = [
    {
      icon: MessageSquare,
      title: 'Real-time Messaging',
      description: 'Chat instantly with friends and colleagues with lightning-fast message delivery'
    },
    {
      icon: Users,
      title: 'Group Conversations',
      description: 'Create group chats and collaborate seamlessly with your team'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your conversations are protected with enterprise-grade security'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Built for speed with optimized performance for the best experience'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <motion.nav
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 p-4 md:p-6"
      >
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <motion.div 
            className="flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ChatterLite
            </span>
          </motion.div>
          
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={handleSignIn}
              className="hidden sm:flex hover:bg-blue-50 text-slate-700"
              data-testid="button-signin"
            >
              Sign In
            </Button>
            <Button
              onClick={handleGetStarted}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              data-testid="button-getstarted"
            >
              Get Started
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative px-4 md:px-6 py-12 md:py-20">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-6"
          >
            <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              <span>Real-time chat made simple</span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-slate-900 mb-6"
          >
            Connect with
            <span className="block bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 bg-clip-text text-transparent">
              Everyone
            </span>
          </motion.h1>

          <motion.p
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl text-slate-600 mb-8 max-w-3xl mx-auto leading-relaxed"
          >
            Experience the future of messaging with lightning-fast, secure, and beautiful conversations that bring people together.
          </motion.p>

          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
          >
            <Button
              size="lg"
              onClick={handleGetStarted}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 px-8 py-4 text-lg"
              data-testid="button-getstarted-hero"
            >
              Start Chatting Now
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={handleSignIn}
              className="border-slate-300 hover:bg-slate-50 px-8 py-4 text-lg transition-all duration-300 transform hover:scale-105"
              data-testid="button-signin-hero"
            >
              Sign In
            </Button>
          </motion.div>

          {/* Floating Elements */}
          <div className="relative">
            <motion.div
              animate={{ 
                y: [0, -10, 0],
                rotate: [0, 5, 0]
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute -top-12 left-1/4 w-16 h-16 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full opacity-20 blur-sm"
            />
            <motion.div
              animate={{ 
                y: [0, 15, 0],
                rotate: [0, -5, 0]
              }}
              transition={{ 
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1
              }}
              className="absolute -top-8 right-1/3 w-20 h-20 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full opacity-20 blur-sm"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 md:px-6 py-16 md:py-24">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Why Choose ChatterLite?
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Built with modern technology to provide the smoothest messaging experience
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="group p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200"
                data-testid={`feature-${feature.title.toLowerCase().replace(' ', '-')}`}
              >
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 md:px-6 py-16 md:py-24">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden"
        >
          <div className="relative z-10">
            <Heart className="w-16 h-16 mx-auto mb-6 animate-pulse" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Start Chatting?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of users who are already enjoying seamless conversations
            </p>
            <Button
              size="lg"
              onClick={handleGetStarted}
              className="bg-white text-slate-900 hover:bg-slate-100 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 px-8 py-4 text-lg font-semibold"
              data-testid="button-getstarted-cta"
            >
              Get Started for Free
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>

          {/* Background Animation */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 opacity-20"
          >
            <div className="absolute top-1/4 left-1/4 w-32 h-32 border-4 border-white rounded-full" />
            <div className="absolute bottom-1/4 right-1/4 w-24 h-24 border-4 border-white rounded-full" />
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="px-4 md:px-6 py-8 border-t border-slate-200">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-md flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-slate-900">ChatterLite</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-slate-600">
              Made with ❤️ for seamless conversations
            </span>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
}