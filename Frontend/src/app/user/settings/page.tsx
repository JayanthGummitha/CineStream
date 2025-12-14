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
import { useProfiles } from '@/contexts/ProfileContext';
import { PinModal } from '@/components/parental/PinModal';

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
  twoFactorMethod?: 'email' | 'phone' | 'authenticator';
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

// Helper function to detect device from User-Agent
const detectDevice = (): string => {
  if (typeof window === 'undefined') return 'Unknown Device';
  
  const ua = navigator.userAgent;
  let browser = 'Unknown Browser';
  let os = 'Unknown OS';
  
  // Detect browser
  if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Edg')) browser = 'Edge';
  else if (ua.includes('Chrome')) browser = 'Chrome';
  else if (ua.includes('Safari')) browser = 'Safari';
  else if (ua.includes('Opera') || ua.includes('OPR')) browser = 'Opera';
  
  // Detect OS
  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Mac OS')) os = 'MacOS';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
  
  return `${browser} on ${os}`;
};

// Initial mock sessions (will be updated with real current session)
const initialMockSessions: ActiveSession[] = [
  { id: '1', device: 'Loading...', location: 'Detecting...', lastActive: 'Now', current: true },
];



export default function SettingsPage() {
  const [settings, setSettings] = useState<PlaybackSettings>(defaultSettings);
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>(defaultSecuritySettings);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(defaultNotificationSettings);
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>(defaultPrivacySettings);
  const [sessions, setSessions] = useState<ActiveSession[]>(initialMockSessions);
  const [saved, setSaved] = useState(false);

  // Detect real device and location for current session
  useEffect(() => {
    const detectCurrentSession = async () => {
      // Detect device
      const device = detectDevice();
      
      // Detect location using IP geolocation API (with city, state, country)
      let location = 'Unknown Location';
      try {
        const response = await fetch('https://ipapi.co/json/');
        if (response.ok) {
          const data = await response.json();
          const city = data.city || 'Unknown';
          const region = data.region || ''; // State/Province
          const country = data.country_name || data.country_code || 'Unknown';
          location = region ? `${city}, ${region}, ${country}` : `${city}, ${country}`;
        }
      } catch (error) {
        console.warn('Could not detect location:', error);
        // Try alternative API
        try {
          const response = await fetch('https://ip-api.com/json/');
          if (response.ok) {
            const data = await response.json();
            const city = data.city || 'Unknown';
            const region = data.regionName || ''; // State/Province
            const country = data.country || data.countryCode || 'Unknown';
            location = region ? `${city}, ${region}, ${country}` : `${city}, ${country}`;
          }
        } catch {
          location = 'Location unavailable';
        }
      }
      
      // Update current session with real data
      setSessions(prev => prev.map(session => 
        session.current 
          ? { ...session, device, location }
          : session
      ));
    };
    
    detectCurrentSession();
  }, []);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [deleteConfirm, setDeleteConfirm] = useState('');
  
  // Parental Controls state
  const { accountProfiles, setMasterPin, verifyMasterPin } = useProfiles();
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinModalMode, setPinModalMode] = useState<'set' | 'change' | 'verify'>('set');
  const hasMasterPin = !!accountProfiles?.masterPin;

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
        <Card className='border-2 '>
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
        <Card className='border-2 '>
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
            <div className="grid space-y-5 ">
              <Label className="text-sm font-medium">Change Password </Label>
              <div className="grid mt-5 space-y-3">
                <div className="relative">
                  <Input
                    className='focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white'
                    type={showPassword ? "text" : "password"}
                    placeholder="Current password"
                    value={passwordForm.current}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, current: e.target.value }))}
                  />
                </div>
                <div className="relative">
                  <Input
                                      className='focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white'

                    type={showPassword ? "text" : "password"}
                    placeholder="New password"
                    value={passwordForm.new}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, new: e.target.value }))}
                  />
                </div>
                <div className="relative">
                  <Input
                                      className='focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white'

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
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm">Two-Factor Authentication</Label>
                  <p className="text-xs text-muted-foreground">Add an extra layer of security to your account</p>
                </div>
                <Switch
                  checked={securitySettings.twoFactorEnabled}
                  onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, twoFactorEnabled: checked, twoFactorMethod: checked ? (prev.twoFactorMethod || 'email') : undefined }))}
                />
              </div>
              
              {securitySettings.twoFactorEnabled && (
                <div className="grid space-y-3 pl-4 border-l-2 border-muted">
                  <Label className="text-sm">Verification Method</Label>
                  <div className="space-y-2">
                    <div 
                      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${securitySettings.twoFactorMethod === 'email' ? ' ' : 'bg-muted/50 hover:bg-muted'}`}
                      onClick={() => setSecuritySettings(prev => ({ ...prev, twoFactorMethod: 'email' }))}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${securitySettings.twoFactorMethod === 'email' ? 'border-green-500' : 'border-muted-foreground'}`}>
                          {securitySettings.twoFactorMethod === 'email' && <div className="w-2 h-2 rounded-full bg-green-500" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium">Email</p>
                          <p className="text-xs text-muted-foreground">Receive verification code via email</p>
                        </div>
                      </div>
                    </div>
                    <div 
                      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${securitySettings.twoFactorMethod === 'phone' ? '' : 'bg-muted/50 hover:bg-muted'}`}
                      onClick={() => setSecuritySettings(prev => ({ ...prev, twoFactorMethod: 'phone' }))}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${securitySettings.twoFactorMethod === 'phone' ? 'border-green-500' : 'border-muted-foreground'}`}>
                          {securitySettings.twoFactorMethod === 'phone' && <div className="w-2 h-2 rounded-full bg-green-500" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium">Phone (SMS)</p>
                          <p className="text-xs text-muted-foreground">Receive verification code via SMS</p>
                        </div>
                      </div>
                    </div>
                    
                  </div>
                </div>
              )}
            </div>

            <div className="h-px bg-border" />

            {/* Active Sessions */}
            {/* <div className="space-y-4">
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
                    {session.current && (
                      <Button variant="ghost" size="sm" onClick={() => handleLogoutSession(session.id)} className="text-red-500 hover:text-red-600 hover:bg-red-500/10">
                        Logout
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div> */}

            <div className="h-px bg-border" />

            {/* Registered Devices - Link to separate page */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <IconHistory className="h-4 w-4 text-muted-foreground" />
                <Label className="text-sm font-medium">Registered Devices</Label>
              </div>
              <p className="text-xs text-muted-foreground">
                Manage and monitor all devices connected to your account
              </p>
              <Link href="/user/register-devices">
                <Button variant="outline" size="sm" className="w-full">
                  <IconDevices className="h-4 w-4 mr-2" />
                  Manage Devices
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Notification Preferences */}
        <Card className='border-2 '>
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
        <Card className='border-2 '>
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

        {/* Parental Controls */}
        <Card className='border-2'>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconLock className="h-5 w-5" />
              Parental Controls
            </CardTitle>
            <CardDescription>
              Set up PIN protection for content restrictions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Master PIN */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Master PIN</Label>
                  <p className="text-xs text-muted-foreground">
                    {hasMasterPin 
                      ? 'PIN is set. Use it to unlock restricted content or manage profiles.'
                      : 'Set a 4-digit PIN to protect restricted content and manage parental controls.'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {hasMasterPin && (
                    <span className="text-xs bg-green-500/20 text-green-500 px-2 py-1 rounded">
                      Active
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex gap-2">
                {hasMasterPin ? (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setPinModalMode('change');
                      setShowPinModal(true);
                    }}
                  >
                    Change PIN
                  </Button>
                ) : (
                  <Button 
                    size="sm"
                    className="bg-red-600 hover:bg-red-700"
                    onClick={() => {
                      setPinModalMode('set');
                      setShowPinModal(true);
                    }}
                  >
                    Set Up PIN
                  </Button>
                )}
              </div>
            </div>

            <div className="h-px bg-border" />

            {/* Manage Profiles Link */}
            <div className="space-y-3">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Profile Restrictions</Label>
                <p className="text-xs text-muted-foreground">
                  Configure content restrictions and PIN requirements for each profile.
                </p>
              </div>
              <Link href="/profiles">
                <Button variant="outline" size="sm" className="w-full">
                  Manage Profiles
                </Button>
              </Link>
            </div>

            {hasMasterPin && (
              <>
                <div className="h-px bg-border" />
                
                {/* Content Rating Info */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Content Ratings Guide</Label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 bg-muted/50 rounded">
                      <span className="font-medium text-green-400">TV-Y, G</span>
                      <p className="text-muted-foreground">All ages</p>
                    </div>
                    <div className="p-2 bg-muted/50 rounded">
                      <span className="font-medium text-blue-400">TV-Y7, PG</span>
                      <p className="text-muted-foreground">7+ years</p>
                    </div>
                    <div className="p-2 bg-muted/50 rounded">
                      <span className="font-medium text-yellow-400">TV-PG, PG-13</span>
                      <p className="text-muted-foreground">Parental guidance</p>
                    </div>
                    <div className="p-2 bg-muted/50 rounded">
                      <span className="font-medium text-red-400">TV-MA, R, NC-17</span>
                      <p className="text-muted-foreground">Adults only</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* PIN Modal */}
        <PinModal
          open={showPinModal}
          onOpenChange={setShowPinModal}
          onVerified={() => {
            setShowPinModal(false);
          }}
          mode={pinModalMode}
          title={pinModalMode === 'set' ? 'Set Master PIN' : 'Change Master PIN'}
          description={pinModalMode === 'set' 
            ? 'Create a 4-digit PIN to protect parental controls.'
            : 'Enter a new 4-digit PIN.'}
        />

        <Card className='border-2 '>
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
