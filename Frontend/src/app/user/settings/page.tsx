'use client';

import { useState, useEffect } from 'react';
import { IconSettings, IconPlayerPlay, IconTextCaption, IconVideo, IconLock, IconBell, IconShield, IconDevices, IconHistory, IconTrash, IconDownload, IconEye, IconEyeOff } from "@tabler/icons-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import Link from 'next/link';

interface PlaybackSettings {
  videoQuality: string;
  subtitlesEnabled: boolean;
  subtitleLanguage: string;
  autoplayEnabled: boolean;
  autoplayNextEpisode: boolean;
  autoplayPreviews: boolean;
}

interface SecuritySettings {
  twoFactorEnabled: boolean;
}

interface NotificationSettings {
  emailNewReleases: boolean;
  emailRecommendations: boolean;
  pushNotifications: boolean;
  marketingEmails: boolean;
  weeklyDigest: boolean;
}

interface PrivacySettings {
  watchHistoryVisible: boolean;
  kidsProfileMonitoring: boolean;
  profileVisible: boolean;
  dataSharing: boolean;
}

interface ActiveSession {
  id: string;
  device: string;
  location: string;
  lastActive: string;
  current: boolean;
}

const defaultSettings: PlaybackSettings = {
  videoQuality: '1080p',
  subtitlesEnabled: false,
  subtitleLanguage: 'English',
  autoplayEnabled: true,
  autoplayNextEpisode: true,
  autoplayPreviews: false,
};

const defaultSecuritySettings: SecuritySettings = {
  twoFactorEnabled: false,
};

const defaultNotificationSettings: NotificationSettings = {
  emailNewReleases: true,
  emailRecommendations: true,
  pushNotifications: true,
  marketingEmails: false,
  weeklyDigest: true,
};

const defaultPrivacySettings: PrivacySettings = {
  watchHistoryVisible: false,
  kidsProfileMonitoring: true,
  profileVisible: true,
  dataSharing: false,
};

const mockSessions: ActiveSession[] = [
  { id: '1', device: 'Chrome on Windows', location: 'New York, US', lastActive: 'Now', current: true },
  { id: '2', device: 'Safari on iPhone', location: 'New York, US', lastActive: '2 hours ago', current: false },
  { id: '3', device: 'Firefox on MacOS', location: 'Los Angeles, US', lastActive: '1 day ago', current: false },
];

export default function SettingsPage() {
  const [settings, setSettings] = useState<PlaybackSettings>(defaultSettings);
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>(defaultSecuritySettings);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(defaultNotificationSettings);
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>(defaultPrivacySettings);
  const [sessions, setSessions] = useState<ActiveSession[]>(mockSessions);
  const [saved, setSaved] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [deleteConfirm, setDeleteConfirm] = useState('');

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedPlayback = localStorage.getItem('cinestream_playback_settings');
    const savedSecurity = localStorage.getItem('cinestream_security_settings');
    const savedNotifications = localStorage.getItem('cinestream_notification_settings');
    const savedPrivacy = localStorage.getItem('cinestream_privacy_settings');
    
    if (savedPlayback) setSettings(JSON.parse(savedPlayback));
    if (savedSecurity) setSecuritySettings(JSON.parse(savedSecurity));
    if (savedNotifications) setNotificationSettings(JSON.parse(savedNotifications));
    if (savedPrivacy) setPrivacySettings(JSON.parse(savedPrivacy));
  }, []);

  // Save all settings to localStorage
  const saveAllSettings = () => {
    localStorage.setItem('cinestream_playback_settings', JSON.stringify(settings));
    localStorage.setItem('cinestream_security_settings', JSON.stringify(securitySettings));
    localStorage.setItem('cinestream_notification_settings', JSON.stringify(notificationSettings));
    localStorage.setItem('cinestream_privacy_settings', JSON.stringify(privacySettings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const updateSetting = <K extends keyof PlaybackSettings>(key: K, value: PlaybackSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const updateNotification = <K extends keyof NotificationSettings>(key: K, value: NotificationSettings[K]) => {
    setNotificationSettings(prev => ({ ...prev, [key]: value }));
  };

  const updatePrivacy = <K extends keyof PrivacySettings>(key: K, value: PrivacySettings[K]) => {
    setPrivacySettings(prev => ({ ...prev, [key]: value }));
  };

  const handleLogoutSession = (sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
  };

  const handleChangePassword = () => {
    if (passwordForm.new !== passwordForm.confirm) {
      alert('Passwords do not match');
      return;
    }
    // In real app, call API here
    alert('Password changed successfully');
    setPasswordForm({ current: '', new: '', confirm: '' });
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-lg bg-gray-500/20">
          <IconSettings className="h-6 w-6 text-gray-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account preferences
          </p>
        </div>
      </div>

      <div className="grid gap-4 max-w-2xl">
        {/* Profile Information - Link to separate page */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconSettings className="h-5 w-5" />
              Profile Information
            </CardTitle>
            <CardDescription>
              Manage your profile details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/user/profile">
              <Button variant="outline" className="w-full">
                Go to Profile Settings
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Password & Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconLock className="h-5 w-5" />
              Password & Security
            </CardTitle>
            <CardDescription>
              Manage your password and security settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Change Password */}
            <div className="space-y-4">
              <Label className="text-sm font-medium">Change Password</Label>
              <div className="space-y-3">
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Current password"
                    value={passwordForm.current}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, current: e.target.value }))}
                  />
                </div>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="New password"
                    value={passwordForm.new}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, new: e.target.value }))}
                  />
                </div>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={passwordForm.confirm}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, confirm: e.target.value }))}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <IconEyeOff className="h-4 w-4" /> : <IconEye className="h-4 w-4" />}
                  </button>
                </div>
                <Button onClick={handleChangePassword} size="sm" className="bg-red-600 hover:bg-red-700">
                  Update Password
                </Button>
              </div>
            </div>

            <div className="h-px bg-border" />

            {/* Two-Factor Authentication */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm">Two-Factor Authentication</Label>
                <p className="text-xs text-muted-foreground">Add an extra layer of security to your account</p>
              </div>
              <Switch
                checked={securitySettings.twoFactorEnabled}
                onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, twoFactorEnabled: checked }))}
              />
            </div>

            <div className="h-px bg-border" />

            {/* Active Sessions */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <IconDevices className="h-4 w-4 text-muted-foreground" />
                <Label className="text-sm font-medium">Active Sessions</Label>
              </div>
              <div className="space-y-3">
                {sessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="space-y-1">
                      <p className="text-sm font-medium flex items-center gap-2">
                        {session.device}
                        {session.current && <span className="text-xs bg-green-500/20 text-green-500 px-2 py-0.5 rounded">Current</span>}
                      </p>
                      <p className="text-xs text-muted-foreground">{session.location} • {session.lastActive}</p>
                    </div>
                    {!session.current && (
                      <Button variant="ghost" size="sm" onClick={() => handleLogoutSession(session.id)} className="text-red-500 hover:text-red-600 hover:bg-red-500/10">
                        Logout
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="h-px bg-border" />

            {/* Login History */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <IconHistory className="h-4 w-4 text-muted-foreground" />
                <Label className="text-sm font-medium">Login History</Label>
              </div>
              <div className="text-xs text-muted-foreground space-y-2 p-3 rounded-lg bg-muted/50">
                <p>• Today, 10:30 AM - Chrome on Windows (New York, US)</p>
                <p>• Yesterday, 8:15 PM - Safari on iPhone (New York, US)</p>
                <p>• Dec 25, 2024, 3:00 PM - Firefox on MacOS (Los Angeles, US)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconBell className="h-5 w-5" />
              Notification Preferences
            </CardTitle>
            <CardDescription>
              Choose what notifications you receive
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm">New Releases</Label>
                <p className="text-xs text-muted-foreground">Get notified about new movies and shows</p>
              </div>
              <Switch
                checked={notificationSettings.emailNewReleases}
                onCheckedChange={(checked) => updateNotification('emailNewReleases', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm">Recommendations</Label>
                <p className="text-xs text-muted-foreground">Personalized content suggestions</p>
              </div>
              <Switch
                checked={notificationSettings.emailRecommendations}
                onCheckedChange={(checked) => updateNotification('emailRecommendations', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm">Push Notifications</Label>
                <p className="text-xs text-muted-foreground">Receive notifications on your device</p>
              </div>
              <Switch
                checked={notificationSettings.pushNotifications}
                onCheckedChange={(checked) => updateNotification('pushNotifications', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm">Marketing Emails</Label>
                <p className="text-xs text-muted-foreground">Promotions and special offers</p>
              </div>
              <Switch
                checked={notificationSettings.marketingEmails}
                onCheckedChange={(checked) => updateNotification('marketingEmails', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm">Weekly Digest</Label>
                <p className="text-xs text-muted-foreground">Weekly summary of new content</p>
              </div>
              <Switch
                checked={notificationSettings.weeklyDigest}
                onCheckedChange={(checked) => updateNotification('weeklyDigest', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconShield className="h-5 w-5" />
              Privacy Settings
            </CardTitle>
            <CardDescription>
              Control your privacy and data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm">Watch History Visibility</Label>
                <p className="text-xs text-muted-foreground">Allow others to see your watch history</p>
              </div>
              <Switch
                checked={privacySettings.watchHistoryVisible}
                onCheckedChange={(checked) => updatePrivacy('watchHistoryVisible', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm">Kids Profile Monitoring</Label>
                <p className="text-xs text-muted-foreground">Monitor activity on kids profiles</p>
              </div>
              <Switch
                checked={privacySettings.kidsProfileMonitoring}
                onCheckedChange={(checked) => updatePrivacy('kidsProfileMonitoring', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm">Profile Visibility</Label>
                <p className="text-xs text-muted-foreground">Make your profile visible to others</p>
              </div>
              <Switch
                checked={privacySettings.profileVisible}
                onCheckedChange={(checked) => updatePrivacy('profileVisible', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm">Data Sharing</Label>
                <p className="text-xs text-muted-foreground">Share usage data to improve recommendations</p>
              </div>
              <Switch
                checked={privacySettings.dataSharing}
                onCheckedChange={(checked) => updatePrivacy('dataSharing', checked)}
              />
            </div>

            <div className="h-px bg-border" />

            {/* Download Personal Data */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm flex items-center gap-2">
                  <IconDownload className="h-4 w-4" />
                  Download Personal Data
                </Label>
                <p className="text-xs text-muted-foreground">Get a copy of all your data</p>
              </div>
              <Button variant="outline" size="sm">
                Request Download
              </Button>
            </div>

            <div className="h-px bg-border" />

            {/* Delete Account */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-red-500">
                <IconTrash className="h-4 w-4" />
                <Label className="text-sm font-medium text-red-500">Delete Account</Label>
              </div>
              <p className="text-xs text-muted-foreground">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    Delete Account
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Are you sure you want to delete your account?</DialogTitle>
                    <DialogDescription>
                      This action cannot be undone. All your data, watch history, and preferences will be permanently deleted.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-2">
                    <Label className="text-sm">Type &quot;DELETE&quot; to confirm</Label>
                    <Input
                      value={deleteConfirm}
                      onChange={(e) => setDeleteConfirm(e.target.value)}
                      placeholder="DELETE"
                    />
                  </div>
                  <DialogFooter>
                    <Button variant="outline">Cancel</Button>
                    <Button variant="destructive" disabled={deleteConfirm !== 'DELETE'}>
                      Delete Account
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Playback Settings</CardTitle>
            <CardDescription>
              Customize your viewing experience
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Video Quality */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <IconVideo className="h-4 w-4 text-muted-foreground" />
                <Label className="text-sm font-medium">Video Quality</Label>
              </div>
              <Select
                value={settings.videoQuality}
                onValueChange={(value) => updateSetting('videoQuality', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select quality" />
                </SelectTrigger>
                <SelectContent position="popper" sideOffset={4}>
                  <SelectItem value="auto">Auto (Recommended)</SelectItem>
                  <SelectItem value="4k">4K Ultra HD</SelectItem>
                  <SelectItem value="1080p">1080p Full HD</SelectItem>
                  <SelectItem value="720p">720p HD</SelectItem>
                  <SelectItem value="480p">480p SD</SelectItem>
                  <SelectItem value="360p">360p (Data Saver)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Higher quality uses more data. Auto adjusts based on your connection.
              </p>
            </div>

            <div className="h-px bg-border" />

            {/* Subtitles & Captions */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <IconTextCaption className="h-4 w-4 text-muted-foreground" />
                <Label className="text-sm font-medium">Subtitles & Captions</Label>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="subtitles-toggle" className="text-sm">Enable Subtitles</Label>
                  <p className="text-xs text-muted-foreground">Show subtitles when available</p>
                </div>
                <Switch
                  id="subtitles-toggle"
                  checked={settings.subtitlesEnabled}
                  onCheckedChange={(checked) => updateSetting('subtitlesEnabled', checked)}
                />
              </div>

              {settings.subtitlesEnabled && (
                <div className="space-y-2 pl-4 border-l-2 border-muted">
                  <Label className="text-sm">Preferred Language</Label>
                  <Select
                    value={settings.subtitleLanguage}
                    onValueChange={(value) => updateSetting('subtitleLanguage', value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent position="popper" sideOffset={4}>
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="Spanish">Spanish</SelectItem>
                      <SelectItem value="French">French</SelectItem>
                      <SelectItem value="German">German</SelectItem>
                      <SelectItem value="Japanese">Japanese</SelectItem>
                      <SelectItem value="Korean">Korean</SelectItem>
                      <SelectItem value="Chinese">Chinese</SelectItem>
                      <SelectItem value="Hindi">Hindi</SelectItem>
                      <SelectItem value="Arabic">Arabic</SelectItem>
                      <SelectItem value="Portuguese">Portuguese</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="h-px bg-border" />

            {/* Autoplay Settings */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <IconPlayerPlay className="h-4 w-4 text-muted-foreground" />
                <Label className="text-sm font-medium">Autoplay Settings</Label>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="autoplay-toggle" className="text-sm">Autoplay Videos</Label>
                  <p className="text-xs text-muted-foreground">Automatically start playing videos</p>
                </div>
                <Switch
                  id="autoplay-toggle"
                  checked={settings.autoplayEnabled}
                  onCheckedChange={(checked) => updateSetting('autoplayEnabled', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="autoplay-next-toggle" className="text-sm">Autoplay Next Episode</Label>
                  <p className="text-xs text-muted-foreground">Automatically play the next episode in a series</p>
                </div>
                <Switch
                  id="autoplay-next-toggle"
                  checked={settings.autoplayNextEpisode}
                  onCheckedChange={(checked) => updateSetting('autoplayNextEpisode', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="autoplay-previews-toggle" className="text-sm">Autoplay Previews</Label>
                  <p className="text-xs text-muted-foreground">Play previews while browsing</p>
                </div>
                <Switch
                  id="autoplay-previews-toggle"
                  checked={settings.autoplayPreviews}
                  onCheckedChange={(checked) => updateSetting('autoplayPreviews', checked)}
                />
              </div>
            </div>

            <div className="h-px bg-border" />

            {/* Save Button */}
            <Button 
              onClick={saveAllSettings} 
              className="w-full bg-red-600 hover:bg-red-700"
            >
              {saved ? '✓ Settings Saved!' : 'Save Settings'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
