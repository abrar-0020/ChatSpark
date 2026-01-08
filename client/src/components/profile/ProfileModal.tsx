import { useState, useRef } from 'react';
import { X, Camera, Save, User as UserIcon } from 'lucide-react';
import { useAuthStore } from '../../store';

interface ProfileModalProps {
  onClose: () => void;
}

const ProfileModal = ({ onClose }: ProfileModalProps) => {
  const { user, updateProfile } = useAuthStore();
  const [username, setUsername] = useState(user?.username || '');
  const [aboutMe, setAboutMe] = useState(user?.aboutMe || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [customStatus, setCustomStatus] = useState(user?.customStatus || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setError('Image size should be less than 2MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
        setError('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!username.trim()) {
      setError('Username is required');
      return;
    }

    if (username.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      await updateProfile({
        username: username.trim(),
        avatar: avatar || null,
        aboutMe: aboutMe.trim(),
        customStatus: customStatus.trim()
      });
      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999]">
      <div className="bg-neutral-900 rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-850">
          <h2 className="text-xl font-bold text-white">Edit Profile</h2>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full bg-neutral-800 flex items-center justify-center overflow-hidden border-4 border-neutral-850">
                {avatar ? (
                  <img
                    src={avatar}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserIcon size={48} className="text-neutral-400" />
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 w-24 h-24 rounded-full bg-black/50 flex items-center justify-center
                         opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <Camera size={24} className="text-white" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
            <p className="text-neutral-400 text-sm mt-2">
              Click to upload avatar
            </p>
            {avatar && (
              <button
                onClick={() => setAvatar('')}
                className="text-danger text-sm hover:underline mt-1"
              >
                Remove Avatar
              </button>
            )}
          </div>

          {/* Username */}
          <div>
            <label className="block text-xs font-semibold text-neutral-400 uppercase mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              maxLength={32}
              className="w-full bg-neutral-950 text-white px-4 py-2 rounded-md
                       border border-neutral-850 focus:border-primary focus:outline-none"
              placeholder="Enter your username"
            />
            <p className="text-neutral-400 text-xs mt-1">
              {username.length}/32 characters
            </p>
          </div>

          {/* Custom Status */}
          <div>
            <label className="block text-xs font-semibold text-neutral-400 uppercase mb-2">
              Custom Status
            </label>
            <input
              type="text"
              value={customStatus}
              onChange={(e) => setCustomStatus(e.target.value)}
              maxLength={128}
              className="w-full bg-neutral-950 text-white px-4 py-2 rounded-md
                       border border-neutral-850 focus:border-primary focus:outline-none"
              placeholder="What's on your mind?"
            />
            <p className="text-neutral-400 text-xs mt-1">
              {customStatus.length}/128 characters
            </p>
          </div>

          {/* About Me */}
          <div>
            <label className="block text-xs font-semibold text-neutral-400 uppercase mb-2">
              About Me
            </label>
            <textarea
              value={aboutMe}
              onChange={(e) => setAboutMe(e.target.value)}
              maxLength={500}
              rows={4}
              className="w-full bg-neutral-950 text-white px-4 py-3 rounded-md
                       border border-neutral-850 focus:border-primary focus:outline-none
                       resize-none"
              placeholder="Tell others about yourself..."
            />
            <p className="text-neutral-400 text-xs mt-1">
              {aboutMe.length}/500 characters
            </p>
          </div>

          {/* Preview Card */}
          <div>
            <label className="block text-xs font-semibold text-neutral-400 uppercase mb-2">
              Preview
            </label>
            <div className="bg-neutral-900 rounded-lg overflow-hidden">
              {/* Banner */}
              <div className="h-16 bg-primary" />
              
              {/* Profile Info */}
              <div className="relative px-4 pb-4">
                <div className="absolute -top-8 left-4">
                  <div className="w-16 h-16 rounded-full bg-neutral-800 border-4 border-neutral-900 flex items-center justify-center overflow-hidden">
                    {avatar ? (
                      <img
                        src={avatar}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white text-xl font-semibold">
                        {username?.[0]?.toUpperCase() || 'U'}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="pt-10">
                  <h3 className="text-white font-bold text-lg">{username || 'Username'}</h3>
                  {customStatus && (
                    <p className="text-neutral-400 text-sm">{customStatus}</p>
                  )}
                  
                  {aboutMe && (
                    <div className="mt-3 pt-3 border-t border-neutral-850">
                      <p className="text-xs font-semibold text-neutral-400 uppercase mb-1">
                        About Me
                      </p>
                      <p className="text-white text-sm whitespace-pre-wrap">{aboutMe}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-danger/20 border border-danger rounded-md p-3">
              <p className="text-danger text-sm">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="bg-success/20 border border-success rounded-md p-3">
              <p className="text-success text-sm">{successMessage}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-4 border-t border-neutral-850 bg-neutral-900">
          <button
            onClick={onClose}
            className="px-4 py-2 text-white hover:underline transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-2 bg-primary hover:bg-primary/80 
                     text-white rounded-md font-medium transition-colors disabled:opacity-50"
          >
            <Save size={18} />
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
