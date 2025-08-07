import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  ArrowLeft, 
  User, 
  Settings, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Camera,
  Save,
  Mail,
  Phone,
  Edit3,
  Check,
  X,
  Upload,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';

const profileSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  bio: z.string().max(160, 'Bio must be less than 160 characters').optional(),
  phone: z.string().optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function Profile() {
  const [, setLocation] = useLocation();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Settings states
  const [notifications, setNotifications] = useState({
    messages: true,
    friendRequests: true,
    groupInvites: true,
    emailNotifications: false,
  });
  
  const [privacy, setPrivacy] = useState({
    onlineStatus: true,
    readReceipts: true,
    lastSeen: true,
  });

  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.user_metadata?.full_name || '',
      email: user?.email || '',
      bio: '',
      phone: '',
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        fullName: user.user_metadata?.full_name || '',
        email: user.email || '',
        bio: user.user_metadata?.bio || '',
        phone: user.user_metadata?.phone || '',
      });
    }
  }, [user, form]);

  const getUserInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: ProfileForm) => {
    setSaving(true);
    try {
      // TODO: Implement actual profile update API call
      await new Promise(resolve => setTimeout(resolve, 1000)); // Mock delay
      
      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
      
      setIsEditing(false);
      setAvatarFile(null);
      setAvatarPreview(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const saveSettings = async (settingType: string, settings: any) => {
    try {
      // TODO: Implement actual settings save API call
      await new Promise(resolve => setTimeout(resolve, 500)); // Mock delay
      
      toast({
        title: "Settings Saved",
        description: `${settingType} settings updated successfully!`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation('/chat')}
                className="flex items-center space-x-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                data-testid="button-back-to-chat"
              >
                <ArrowLeft size={16} />
                <span>Back to Chat</span>
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Profile & Settings
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              {isEditing && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center space-x-2"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsEditing(false);
                      setAvatarFile(null);
                      setAvatarPreview(null);
                      form.reset();
                    }}
                    data-testid="button-cancel-edit"
                  >
                    <X size={16} className="mr-1" />
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={form.handleSubmit(onSubmit)}
                    disabled={saving}
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                    data-testid="button-save-profile"
                  >
                    {saving ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      />
                    ) : (
                      <>
                        <Save size={16} className="mr-1" />
                        Save
                      </>
                    )}
                  </Button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <TabsList className="grid w-full grid-cols-4 bg-white dark:bg-gray-900 shadow-sm">
              <TabsTrigger value="profile" className="flex items-center space-x-2">
                <User size={16} />
                <span>Profile</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center space-x-2">
                <Bell size={16} />
                <span>Notifications</span>
              </TabsTrigger>
              <TabsTrigger value="privacy" className="flex items-center space-x-2">
                <Shield size={16} />
                <span>Privacy</span>
              </TabsTrigger>
              <TabsTrigger value="preferences" className="flex items-center space-x-2">
                <Settings size={16} />
                <span>Preferences</span>
              </TabsTrigger>
            </TabsList>
          </motion.div>

          <AnimatePresence mode="wait">
            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              <motion.div
                key="profile"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="bg-white dark:bg-gray-900 shadow-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Profile Information</CardTitle>
                        <CardDescription>
                          Manage your personal information and how others see you
                        </CardDescription>
                      </div>
                      {!isEditing && (
                        <Button
                          onClick={() => setIsEditing(true)}
                          className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                          data-testid="button-edit-profile"
                        >
                          <Edit3 size={16} className="mr-2" />
                          Edit Profile
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Avatar Section */}
                    <div className="flex items-center space-x-6">
                      <div className="relative">
                        <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
                          <AvatarImage src={avatarPreview || user?.user_metadata?.avatar_url} />
                          <AvatarFallback className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-2xl">
                            {user?.user_metadata?.full_name ? getUserInitials(user.user_metadata.full_name) : 'U'}
                          </AvatarFallback>
                        </Avatar>
                        {isEditing && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="absolute -bottom-2 -right-2"
                          >
                            <label htmlFor="avatar-upload" className="cursor-pointer">
                              <div className="w-8 h-8 bg-indigo-500 hover:bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors">
                                <Camera size={16} />
                              </div>
                              <input
                                id="avatar-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarChange}
                                className="hidden"
                              />
                            </label>
                          </motion.div>
                        )}
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                          {user?.user_metadata?.full_name || 'Your Name'}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {user?.email}
                        </p>
                        <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                          Online
                        </Badge>
                      </div>
                    </div>

                    {/* Profile Form */}
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="fullName">Full Name</Label>
                          <Input
                            id="fullName"
                            {...form.register('fullName')}
                            disabled={!isEditing}
                            className={cn(
                              "transition-all duration-200",
                              isEditing ? "bg-white dark:bg-gray-800" : "bg-gray-50 dark:bg-gray-800"
                            )}
                            data-testid="input-fullname"
                          />
                          {form.formState.errors.fullName && (
                            <p className="text-red-500 text-sm">{form.formState.errors.fullName.message}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address</Label>
                          <Input
                            id="email"
                            {...form.register('email')}
                            disabled={!isEditing}
                            className={cn(
                              "transition-all duration-200",
                              isEditing ? "bg-white dark:bg-gray-800" : "bg-gray-50 dark:bg-gray-800"
                            )}
                            data-testid="input-email"
                          />
                          {form.formState.errors.email && (
                            <p className="text-red-500 text-sm">{form.formState.errors.email.message}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Input
                          id="bio"
                          placeholder="Tell us about yourself..."
                          {...form.register('bio')}
                          disabled={!isEditing}
                          className={cn(
                            "transition-all duration-200",
                            isEditing ? "bg-white dark:bg-gray-800" : "bg-gray-50 dark:bg-gray-800"
                          )}
                          data-testid="input-bio"
                        />
                        {form.formState.errors.bio && (
                          <p className="text-red-500 text-sm">{form.formState.errors.bio.message}</p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          placeholder="+1 (555) 123-4567"
                          {...form.register('phone')}
                          disabled={!isEditing}
                          className={cn(
                            "transition-all duration-200",
                            isEditing ? "bg-white dark:bg-gray-800" : "bg-gray-50 dark:bg-gray-800"
                          )}
                          data-testid="input-phone"
                        />
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-6">
              <motion.div
                key="notifications"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="bg-white dark:bg-gray-900 shadow-sm">
                  <CardHeader>
                    <CardTitle>Notification Settings</CardTitle>
                    <CardDescription>
                      Choose what notifications you want to receive
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {Object.entries({
                      messages: 'New Messages',
                      friendRequests: 'Friend Requests',
                      groupInvites: 'Group Invitations',
                      emailNotifications: 'Email Notifications',
                    }).map(([key, label]) => (
                      <div key={key} className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {label}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {key === 'messages' && 'Get notified when you receive new messages'}
                            {key === 'friendRequests' && 'Get notified when someone sends you a friend request'}
                            {key === 'groupInvites' && 'Get notified when you are invited to a group'}
                            {key === 'emailNotifications' && 'Receive notifications via email'}
                          </div>
                        </div>
                        <Switch
                          checked={notifications[key as keyof typeof notifications]}
                          onCheckedChange={(checked) => {
                            const newNotifications = { ...notifications, [key]: checked };
                            setNotifications(newNotifications);
                            saveSettings('Notification', newNotifications);
                          }}
                          data-testid={`switch-${key}`}
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Privacy Tab */}
            <TabsContent value="privacy" className="space-y-6">
              <motion.div
                key="privacy"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="bg-white dark:bg-gray-900 shadow-sm">
                  <CardHeader>
                    <CardTitle>Privacy Settings</CardTitle>
                    <CardDescription>
                      Control who can see your information and activity
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {(Object.entries({
                      onlineStatus: 'Show Online Status',
                      readReceipts: 'Read Receipts',
                      lastSeen: 'Last Seen',
                    }) as Array<[keyof typeof privacy, string]>).map(([key, label]) => (
                      <div key={key} className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {label}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {key === 'onlineStatus' && 'Let others see when you are online'}
                            {key === 'readReceipts' && 'Let others know when you have read their messages'}
                            {key === 'lastSeen' && 'Show when you were last active'}
                          </div>
                        </div>
                        <Switch
                          checked={privacy[key as keyof typeof privacy]}
                          onCheckedChange={(checked) => {
                            const newPrivacy = { ...privacy, [key]: checked };
                            setPrivacy(newPrivacy);
                            saveSettings('Privacy', newPrivacy);
                          }}
                          data-testid={`switch-${key}`}
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Preferences Tab */}
            <TabsContent value="preferences" className="space-y-6">
              <motion.div
                key="preferences"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="bg-white dark:bg-gray-900 shadow-sm">
                  <CardHeader>
                    <CardTitle>App Preferences</CardTitle>
                    <CardDescription>
                      Customize your ChatterLite experience
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Account Actions */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Account Actions</h4>
                      <div className="flex flex-col space-y-3">
                        <Button
                          variant="outline"
                          className="justify-start"
                          onClick={() => {
                            toast({
                              title: "Export Started",
                              description: "Your data export will be ready shortly.",
                            });
                          }}
                          data-testid="button-export-data"
                        >
                          <Upload size={16} className="mr-2" />
                          Export My Data
                        </Button>
                        <Button
                          variant="outline"
                          className="justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                          onClick={() => {
                            if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                              toast({
                                title: "Account Deletion",
                                description: "Please contact support to delete your account.",
                                variant: "destructive",
                              });
                            }
                          }}
                          data-testid="button-delete-account"
                        >
                          <Trash2 size={16} className="mr-2" />
                          Delete Account
                        </Button>
                      </div>
                    </div>

                    <Separator />

                    {/* Sign Out */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Session</h4>
                      <Button
                        variant="outline"
                        className="justify-start"
                        onClick={() => {
                          signOut();
                          setLocation('/');
                        }}
                        data-testid="button-sign-out"
                      >
                        <ArrowLeft size={16} className="mr-2" />
                        Sign Out
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </AnimatePresence>
        </Tabs>
      </div>
    </motion.div>
  );
}