import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Edit, Save, Camera, RefreshCcw, X, Plus } from "lucide-react";

interface Link {
  name: string;
  url: string;
}

interface ProfileHeaderProps {
  user: {
    name: string;
    title: string;
    email: string;
    location: string;
    bio: string;
    avatarUrl: string;
    links?: {
      linkedin?: string;
      portfolio?: string;
      additionalLinks?: Link[];
    };
  };
  editingProfile: boolean;
  profileForm: {
    name: string;
    title: string;
    email: string;
    location: string;
    bio: string;
    avatarUrl: string;
    linkedin: string;
    portfolio: string;
    additionalLinks: Link[];
  };
  setProfileForm: (form: any) => void;
  setEditingProfile: (editing: boolean) => void;
  handleProfileUpdate: () => void;
  regenerateAvatar: () => void;
  triggerFileInput: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleAvatarUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  saving?: boolean;
}

export const ProfileHeader = ({
  user,
  editingProfile,
  profileForm,
  setProfileForm,
  setEditingProfile,
  handleProfileUpdate,
  regenerateAvatar,
  triggerFileInput,
  fileInputRef,
  handleAvatarUpload,
  saving = false
}: ProfileHeaderProps) => {
  const [newLinkName, setNewLinkName] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");

  const addLink = () => {
    if (newLinkName.trim() && newLinkUrl.trim()) {
      setProfileForm({
        ...profileForm,
        additionalLinks: [
          ...profileForm.additionalLinks,
          { name: newLinkName, url: newLinkUrl }
        ]
      });
      setNewLinkName("");
      setNewLinkUrl("");
    }
  };

  const removeLink = (index: number) => {
    const newLinks = [...profileForm.additionalLinks];
    newLinks.splice(index, 1);
    setProfileForm({
      ...profileForm,
      additionalLinks: newLinks
    });
  };

  return (
    <Card className="mb-8">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Avatar className="h-20 w-20">
              <AvatarImage src={editingProfile ? profileForm.avatarUrl : user.avatarUrl} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            {editingProfile && (
              <div className="absolute -bottom-2 -right-2 flex space-x-1">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8 rounded-full bg-background"
                  onClick={triggerFileInput}
                >
                  <Camera className="h-4 w-4" />
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8 rounded-full bg-background"
                  onClick={regenerateAvatar}
                >
                  <RefreshCcw className="h-4 w-4" />
                </Button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleAvatarUpload}
                />
              </div>
            )}
          </div>
          <div>
            {editingProfile ? (
              <div className="space-y-2">
                <Input 
                  value={profileForm.name} 
                  onChange={e => setProfileForm({...profileForm, name: e.target.value})}
                  className="text-xl font-bold"
                  placeholder="Your Name"
                />
                <Input 
                  value={profileForm.title} 
                  onChange={e => setProfileForm({...profileForm, title: e.target.value})}
                  placeholder="Your Title"
                />
              </div>
            ) : (
              <>
                <h2 className="text-xl font-bold">{user.name}</h2>
                <p className="text-muted-foreground">{user.title}</p>
              </>
            )}
          </div>
        </div>
        <div>
          {editingProfile ? (
            <Button onClick={handleProfileUpdate} disabled={saving}>
              {saving ? (
                <span className="flex items-center">
                  <span className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>
                  Saving...
                </span>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" /> Save
                </>
              )}
            </Button>
          ) : (
            <Button onClick={() => setEditingProfile(true)}>
              <Edit className="h-4 w-4 mr-2" /> Edit Profile
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {editingProfile ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  value={profileForm.email} 
                  onChange={e => setProfileForm({...profileForm, email: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input 
                  id="location" 
                  value={profileForm.location} 
                  onChange={e => setProfileForm({...profileForm, location: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea 
                id="bio" 
                value={profileForm.bio} 
                onChange={e => setProfileForm({...profileForm, bio: e.target.value})}
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkedin">LinkedIn</Label>
              <Input 
                id="linkedin" 
                value={profileForm.linkedin} 
                onChange={e => setProfileForm({...profileForm, linkedin: e.target.value})}
                placeholder="LinkedIn URL"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="portfolio">Portfolio/Website</Label>
              <Input 
                id="portfolio" 
                value={profileForm.portfolio} 
                onChange={e => setProfileForm({...profileForm, portfolio: e.target.value})}
                placeholder="Portfolio URL"
              />
            </div>
            <div className="space-y-2">
              <Label>Additional Links</Label>
              {profileForm.additionalLinks.map((link, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input 
                    value={link.name} 
                    onChange={e => {
                      const newLinks = [...profileForm.additionalLinks];
                      newLinks[index].name = e.target.value;
                      setProfileForm({...profileForm, additionalLinks: newLinks});
                    }}
                    placeholder="Link Name"
                    className="flex-1"
                  />
                  <Input 
                    value={link.url} 
                    onChange={e => {
                      const newLinks = [...profileForm.additionalLinks];
                      newLinks[index].url = e.target.value;
                      setProfileForm({...profileForm, additionalLinks: newLinks});
                    }}
                    placeholder="URL"
                    className="flex-1"
                  />
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => removeLink(index)}
                  >
                    <X size={16} />
                  </Button>
                </div>
              ))}
              <div className="flex gap-2">
                <Input
                  placeholder="Link Name"
                  value={newLinkName}
                  onChange={(e) => setNewLinkName(e.target.value)}
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addLink();
                    }
                  }}
                />
                <Input
                  placeholder="Link URL"
                  value={newLinkUrl}
                  onChange={(e) => setNewLinkUrl(e.target.value)}
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addLink();
                    }
                  }}
                />
                <Button 
                  type="button" 
                  onClick={addLink}
                  disabled={!newLinkName.trim() || !newLinkUrl.trim()}
                >
                  <Plus size={16} />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Location</p>
                <p className="text-sm text-muted-foreground">{user.location}</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium">Bio</p>
              <p className="text-sm text-muted-foreground">{user.bio}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {user.links?.linkedin && (
                <a 
                  href={user.links.linkedin} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline"
                >
                  LinkedIn
                </a>
              )}
              {user.links?.portfolio && (
                <a 
                  href={user.links.portfolio} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline"
                >
                  Portfolio
                </a>
              )}
              {user.links?.additionalLinks?.map((link, index) => (
                <a 
                  key={index}
                  href={link.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline"
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 