'use client';

import { useState } from 'react';
import { Header } from '@/components/navigation/header';
import { Footer } from '@/components/navigation/footer';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { Eye, EyeOff, Upload, Trash2 } from 'lucide-react';

export default function SettingsPage() {
  const { isAuthenticated, user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);

  // Profile form state
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    dateOfBirth: '',
    country: '',
  });

  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Preferences state
  const [preferences, setPreferences] = useState({
    language: 'en',
    streamingQuality: 'auto',
    downloadQuality: 'high',
    autoplay: true,
    subtitles: false,
    darkMode: true,
  });

  // Notifications state
  const [notifications, setNotifications] = useState({
    emailUpdates: true,
    pushNotifications: true,
    inAppNotifications: true,
  });

  // Handle profile save
  const handleProfileSave = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Update user data
      updateUser({
        name: profileData.name,
        email: profileData.email,
        phone: profileData.phone,
      });

      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match!');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long!');
      return;
    }

    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      toast.success('Password updated successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      toast.error('Failed to update password. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle preferences save
  const handlePreferencesSave = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      toast.success('Preferences updated successfully!');
    } catch (error) {
      toast.error('Failed to update preferences. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle notifications save
  const handleNotificationsSave = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      toast.success('Notification preferences updated successfully!');
    } catch (error) {
      toast.error('Failed to update notification preferences. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header isAuthenticated={isAuthenticated} user={user || undefined} />

      <main className="flex-1 pt-20 pb-12">
        <div className="container max-w-4xl mx-auto px-4">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
            <p className="text-white/60">
              Manage your account settings and preferences
            </p>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full justify-start overflow-x-auto bg-white/5 border border-white/10 mb-6 flex-nowrap">
              <TabsTrigger value="profile" className="data-[state=active]:bg-white/10">
                Profile
              </TabsTrigger>
              <TabsTrigger value="preferences" className="data-[state=active]:bg-white/10">
                Preferences
              </TabsTrigger>
              <TabsTrigger value="notifications" className="data-[state=active]:bg-white/10">
                Notifications
              </TabsTrigger>
              <TabsTrigger value="privacy" className="data-[state=active]:bg-white/10">
                Privacy
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              <Card className="bg-white/5 border-white/10 p-6">
                <h2 className="text-xl font-semibold text-white mb-6">Personal Information</h2>
                
                {/* Avatar Section */}
                <div className="flex items-center gap-6 mb-6 pb-6 border-b border-white/10">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={user?.avatar} alt={user?.name} />
                    <AvatarFallback className="bg-gradient-to-br from-red-500 to-orange-500 text-white text-2xl">
                      {user?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-white font-medium mb-2">Profile Photo</p>
                    <p className="text-white/60 text-sm mb-3">
                      Upload a new profile photo or remove the current one
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Photo
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Personal Information Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-white">Full Name</Label>
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      className="bg-white/5 border-white/10 text-white"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      className="bg-white/5 border-white/10 text-white"
                      placeholder="Enter your email"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-white">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      className="bg-white/5 border-white/10 text-white"
                      placeholder="Enter your phone number"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dob" className="text-white">Date of Birth</Label>
                    <Input
                      id="dob"
                      type="date"
                      value={profileData.dateOfBirth}
                      onChange={(e) => setProfileData({ ...profileData, dateOfBirth: e.target.value })}
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="country" className="text-white">Country</Label>
                    <Select
                      value={profileData.country}
                      onValueChange={(value) => setProfileData({ ...profileData, country: value })}
                    >
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue placeholder="Select your country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="us">United States</SelectItem>
                        <SelectItem value="uk">United Kingdom</SelectItem>
                        <SelectItem value="ca">Canada</SelectItem>
                        <SelectItem value="au">Australia</SelectItem>
                        <SelectItem value="de">Germany</SelectItem>
                        <SelectItem value="fr">France</SelectItem>
                        <SelectItem value="in">India</SelectItem>
                        <SelectItem value="jp">Japan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  onClick={handleProfileSave}
                  disabled={isSaving}
                  className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </Card>

              {/* Password Change Section */}
              <Card className="bg-white/5 border-white/10 p-6">
                <h2 className="text-xl font-semibold text-white mb-6">Change Password</h2>
                
                <div className="space-y-4 mb-6">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword" className="text-white">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showPasswords.current ? 'text' : 'password'}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        className="bg-white/5 border-white/10 text-white pr-10"
                        placeholder="Enter current password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                      >
                        {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword" className="text-white">New Password</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showPasswords.new ? 'text' : 'password'}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        className="bg-white/5 border-white/10 text-white pr-10"
                        placeholder="Enter new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                      >
                        {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-white">Confirm New Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showPasswords.confirm ? 'text' : 'password'}
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        className="bg-white/5 border-white/10 text-white pr-10"
                        placeholder="Confirm new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                      >
                        {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handlePasswordChange}
                  disabled={isSaving}
                  className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
                >
                  {isSaving ? 'Updating...' : 'Update Password'}
                </Button>
              </Card>
            </TabsContent>

            {/* Preferences Tab */}
            <TabsContent value="preferences" className="space-y-6">
              <Card className="bg-white/5 border-white/10 p-6">
                <h2 className="text-xl font-semibold text-white mb-6">Streaming Preferences</h2>
                
                <div className="space-y-6 mb-6">
                  {/* Language */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="language" className="text-white">Language</Label>
                      <Select
                        value={preferences.language}
                        onValueChange={(value) => setPreferences({ ...preferences, language: value })}
                      >
                        <SelectTrigger className="bg-white/5 border-white/10 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Spanish</SelectItem>
                          <SelectItem value="fr">French</SelectItem>
                          <SelectItem value="de">German</SelectItem>
                          <SelectItem value="ja">Japanese</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-white/60 text-sm">Select your preferred language for the interface</p>
                    </div>

                    {/* Streaming Quality */}
                    <div className="space-y-2">
                      <Label htmlFor="streamingQuality" className="text-white">Streaming Quality</Label>
                      <Select
                        value={preferences.streamingQuality}
                        onValueChange={(value) => setPreferences({ ...preferences, streamingQuality: value })}
                      >
                        <SelectTrigger className="bg-white/5 border-white/10 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="auto">Auto</SelectItem>
                          <SelectItem value="low">Low (480p)</SelectItem>
                          <SelectItem value="medium">Medium (720p)</SelectItem>
                          <SelectItem value="high">High (1080p)</SelectItem>
                          <SelectItem value="ultra">Ultra (4K)</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-white/60 text-sm">Choose video quality for streaming</p>
                    </div>

                    {/* Download Quality */}
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="downloadQuality" className="text-white">Download Quality</Label>
                      <Select
                        value={preferences.downloadQuality}
                        onValueChange={(value) => setPreferences({ ...preferences, downloadQuality: value })}
                      >
                        <SelectTrigger className="bg-white/5 border-white/10 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="medium">Medium (720p)</SelectItem>
                          <SelectItem value="high">High (1080p)</SelectItem>
                          <SelectItem value="ultra">Ultra (4K)</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-white/60 text-sm">Select quality for downloaded content</p>
                    </div>
                  </div>

                  {/* Toggle Switches */}
                  <div className="space-y-4 pt-4 border-t border-white/10">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="autoplay" className="text-white">Autoplay</Label>
                        <p className="text-white/60 text-sm">Automatically play next episode</p>
                      </div>
                      <Switch
                        id="autoplay"
                        checked={preferences.autoplay}
                        onCheckedChange={(checked) => setPreferences({ ...preferences, autoplay: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="subtitles" className="text-white">Subtitles</Label>
                        <p className="text-white/60 text-sm">Show subtitles by default</p>
                      </div>
                      <Switch
                        id="subtitles"
                        checked={preferences.subtitles}
                        onCheckedChange={(checked) => setPreferences({ ...preferences, subtitles: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="darkMode" className="text-white">Dark Mode</Label>
                        <p className="text-white/60 text-sm">Use dark theme for the interface</p>
                      </div>
                      <Switch
                        id="darkMode"
                        checked={preferences.darkMode}
                        onCheckedChange={(checked) => setPreferences({ ...preferences, darkMode: checked })}
                      />
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handlePreferencesSave}
                  disabled={isSaving}
                  className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </Card>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-6">
              <Card className="bg-white/5 border-white/10 p-6">
                <h2 className="text-xl font-semibold text-white mb-6">Notification Preferences</h2>
                
                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="emailUpdates" className="text-white">Email Updates</Label>
                      <p className="text-white/60 text-sm">
                        Receive updates about new content and features via email
                      </p>
                    </div>
                    <Switch
                      id="emailUpdates"
                      checked={notifications.emailUpdates}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, emailUpdates: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="pushNotifications" className="text-white">Push Notifications</Label>
                      <p className="text-white/60 text-sm">
                        Get push notifications for new episodes and recommendations
                      </p>
                    </div>
                    <Switch
                      id="pushNotifications"
                      checked={notifications.pushNotifications}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, pushNotifications: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="inAppNotifications" className="text-white">In-App Notifications</Label>
                      <p className="text-white/60 text-sm">
                        Show notifications within the app for important updates
                      </p>
                    </div>
                    <Switch
                      id="inAppNotifications"
                      checked={notifications.inAppNotifications}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, inAppNotifications: checked })}
                    />
                  </div>
                </div>

                <Button
                  onClick={handleNotificationsSave}
                  disabled={isSaving}
                  className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </Card>
            </TabsContent>

            {/* Privacy Tab */}
            <TabsContent value="privacy" className="space-y-6">
              <Card className="bg-white/5 border-white/10 p-6">
                <h2 className="text-xl font-semibold text-white mb-6">Privacy & Data</h2>
                
                <div className="space-y-6">
                  {/* Viewing History */}
                  <div className="pb-6 border-b border-white/10">
                    <h3 className="text-white font-medium mb-2">Viewing History</h3>
                    <p className="text-white/60 text-sm mb-4">
                      Manage your viewing history and watch data
                    </p>
                    <Button
                      variant="outline"
                      className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                    >
                      Clear Viewing History
                    </Button>
                  </div>

                  {/* Watch Data */}
                  <div className="pb-6 border-b border-white/10">
                    <h3 className="text-white font-medium mb-2">Watch Data</h3>
                    <p className="text-white/60 text-sm mb-4">
                      Download a copy of your watch data and preferences
                    </p>
                    <Button
                      variant="outline"
                      className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                    >
                      Download My Data
                    </Button>
                  </div>

                  {/* Account Deletion */}
                  <div className="pb-6 border-b border-white/10">
                    <h3 className="text-white font-medium mb-2">Delete Account</h3>
                    <p className="text-white/60 text-sm mb-4">
                      Permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                    <Button
                      variant="destructive"
                      className="bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30"
                    >
                      Delete Account
                    </Button>
                  </div>

                  {/* Legal Links */}
                  <div>
                    <h3 className="text-white font-medium mb-3">Legal Information</h3>
                    <div className="space-y-2">
                      <a
                        href="/privacy-policy"
                        className="block text-white/60 hover:text-white text-sm transition-colors"
                      >
                        Privacy Policy
                      </a>
                      <a
                        href="/terms-of-service"
                        className="block text-white/60 hover:text-white text-sm transition-colors"
                      >
                        Terms of Service
                      </a>
                      <a
                        href="/cookie-policy"
                        className="block text-white/60 hover:text-white text-sm transition-colors"
                      >
                        Cookie Policy
                      </a>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
}
