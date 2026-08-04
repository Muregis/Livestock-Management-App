import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import {
  Camera,
  Loader2,
  Mail,
  Phone,
  MapPin,
  Building2,
  Shield,
  Calendar,
  ChevronLeft,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  role: string;
  location: string;
  farmName: string;
  avatar: string;
  joinDate: string;
}

const defaultProfile: UserProfile = {
  name: "John Anderson",
  email: "john.anderson@agrevanna.com",
  phone: "+1 (555) 123-4567",
  role: "Farm Administrator",
  location: "Central Valley Farm",
  farmName: "Agrivanna Livestock Farm",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=farm-manager",
  joinDate: "2023-01-15",
};

const UserProfilePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPhotoDialogOpen, setIsPhotoDialogOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoUpload = async () => {
    if (!selectedPhoto) return;

    setIsSaving(true);
    // Simulate upload delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Update profile with new photo
    setProfile((prev) => ({
      ...prev,
      avatar: photoPreview || prev.avatar,
    }));

    setIsSaving(false);
    setIsPhotoDialogOpen(false);
    setSelectedPhoto(null);
    setPhotoPreview(null);

    toast({
      title: "Profile photo updated",
      description: "Your profile photo has been updated successfully.",
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    setIsEditing(false);
    toast({
      title: "Profile updated",
      description: "Your profile changes have been saved successfully.",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Mobile Header */}
      <div className="sticky top-0 z-50 bg-background border-b sm:hidden">
        <div className="flex h-14 items-center gap-4 px-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-semibold">Profile Settings</h1>
        </div>
      </div>

      <div className="container max-w-4xl mx-auto p-4 sm:py-6 space-y-6">
        {/* Desktop Header */}
        <div className="hidden sm:flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Profile Settings</h1>
            <p className="text-muted-foreground">Manage your account details</p>
          </div>
        </div>

        <Card className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profile.avatar} />
                  <AvatarFallback>JA</AvatarFallback>
                </Avatar>
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
                  onClick={() => setIsPhotoDialogOpen(true)}
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-center">
                <h2 className="font-semibold">{profile.name}</h2>
                <p className="text-sm text-muted-foreground">{profile.role}</p>
              </div>
            </div>

            <Separator orientation="vertical" className="hidden sm:block" />
            <Separator className="sm:hidden" />

            <div className="flex-1 space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input
                    value={profile.name}
                    readOnly={!isEditing}
                    onChange={(e) =>
                      setProfile({ ...profile, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={profile.email}
                    readOnly={!isEditing}
                    onChange={(e) =>
                      setProfile({ ...profile, email: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    type="tel"
                    value={profile.phone}
                    readOnly={!isEditing}
                    onChange={(e) =>
                      setProfile({ ...profile, phone: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input
                    value={profile.location}
                    readOnly={!isEditing}
                    onChange={(e) =>
                      setProfile({ ...profile, location: e.target.value })
                    }
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-medium">Account Information</h3>
                <div className="grid gap-4">
                  <div className="flex items-center gap-3 text-sm">
                    <Shield className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">Role:</span>
                    <span className="text-muted-foreground">
                      {profile.role}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Building2 className="h-4 w-4 text-green-500" />
                    <span className="font-medium">Farm:</span>
                    <span className="text-muted-foreground">
                      {profile.farmName}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="h-4 w-4 text-purple-500" />
                    <span className="font-medium">Joined:</span>
                    <span className="text-muted-foreground">
                      {new Date(profile.joinDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Fixed bottom buttons on mobile */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t sm:relative sm:bottom-auto sm:left-auto sm:right-auto sm:p-0 sm:bg-transparent sm:border-0 flex flex-col sm:flex-row sm:justify-end gap-2 sm:gap-4">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setProfile(defaultProfile);
                  setIsEditing(false);
                }}
                disabled={isSaving}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full sm:w-auto"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </>
          ) : (
            <Button
              onClick={() => setIsEditing(true)}
              className="w-full sm:w-auto"
            >
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      {/* Photo Upload Dialog */}
      <Dialog open={isPhotoDialogOpen} onOpenChange={setIsPhotoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Profile Photo</DialogTitle>
            <DialogDescription>
              Choose a new photo for your profile
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex justify-center">
              <Avatar className="h-32 w-32">
                <AvatarImage src={photoPreview || profile.avatar} />
                <AvatarFallback>JA</AvatarFallback>
              </Avatar>
            </div>

            <div className="space-y-2">
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoSelect}
                className="hidden"
                ref={fileInputRef}
              />
              <div className="grid gap-2">
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                >
                  <Camera className="mr-2 h-4 w-4" />
                  {selectedPhoto ? "Change Photo" : "Select Photo"}
                </Button>
                {selectedPhoto && (
                  <p className="text-sm text-muted-foreground text-center">
                    {selectedPhoto.name}
                  </p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsPhotoDialogOpen(false);
                setSelectedPhoto(null);
                setPhotoPreview(null);
              }}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePhotoUpload}
              disabled={!selectedPhoto || isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Upload Photo"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserProfilePage;
