import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { User, Calendar, Weight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Profile {
  nom: string;
  date_naissance: string;
  poids?: number;
}

interface UserProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: Profile | null;
  onProfileUpdate: (profile: Profile) => void;
}

export const UserProfileDialog = ({ 
  open, 
  onOpenChange, 
  profile, 
  onProfileUpdate 
}: UserProfileDialogProps) => {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<Profile>({
    nom: profile?.nom || "",
    date_naissance: profile?.date_naissance || "",
    poids: profile?.poids || undefined,
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('profiles')
        .update({
          nom: formData.nom,
          date_naissance: formData.date_naissance,
          poids: formData.poids || null,
        })
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

      if (error) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de sauvegarder le profil.",
        });
        return;
      }

      onProfileUpdate(formData);
      setEditing(false);
      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été sauvegardées.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur inattendue s'est produite.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      nom: profile?.nom || "",
      date_naissance: profile?.date_naissance || "",
      poids: profile?.poids || undefined,
    });
    setEditing(false);
  };

  if (!profile) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Profil utilisateur</DialogTitle>
          </DialogHeader>
          <div className="text-center py-4">
            <p className="text-muted-foreground">Chargement du profil...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Mon Profil</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {!editing ? (
            <>
              <Card className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <User size={20} className="text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Nom</p>
                    <p className="font-medium">{profile.nom}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Calendar size={20} className="text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Âge</p>
                    <p className="font-medium">{calculateAge(profile.date_naissance)} ans</p>
                    <p className="text-xs text-muted-foreground">
                      Né le {new Date(profile.date_naissance).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
                
                {profile.poids && (
                  <div className="flex items-center gap-3">
                    <Weight size={20} className="text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Poids</p>
                      <p className="font-medium">{profile.poids} kg</p>
                    </div>
                  </div>
                )}
              </Card>
              
              <Button onClick={() => setEditing(true)} className="w-full">
                Modifier le profil
              </Button>
            </>
          ) : (
            <>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="nom">Nom</Label>
                  <Input
                    id="nom"
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="date_naissance">Date de naissance</Label>
                  <Input
                    id="date_naissance"
                    type="date"
                    value={formData.date_naissance}
                    onChange={(e) => setFormData({ ...formData, date_naissance: e.target.value })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="poids">Poids (kg) - Optionnel</Label>
                  <Input
                    id="poids"
                    type="number"
                    step="0.1"
                    value={formData.poids || ""}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      poids: e.target.value ? parseFloat(e.target.value) : undefined 
                    })}
                    placeholder="Ex: 70.5"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={handleCancel}
                  className="flex-1"
                  disabled={loading}
                >
                  Annuler
                </Button>
                <Button 
                  onClick={handleSave}
                  className="flex-1"
                  disabled={loading}
                >
                  {loading ? "Sauvegarde..." : "Sauvegarder"}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};