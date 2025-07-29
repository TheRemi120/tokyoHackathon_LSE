import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { RunCard } from "@/components/RunCard";
import { Card } from "@/components/ui/card";
import { TrendingUp, Clock, Zap, Award, Settings } from "lucide-react";
import { UserProfileDialog } from "@/components/UserProfileDialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Activity, formatDuration, formatDistance, calculatePace } from "@/types/Activity";

interface Profile {
  nom: string;
  date_naissance: string;
  poids?: number;
}

const ActivityLog = () => {
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          toast({
            variant: "destructive",
            title: "Erreur",
            description: "Impossible de charger le profil.",
          });
          return;
        }

        console.log('Profile fetched:', data);
        setUserProfile(data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    const fetchActivities = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('activities')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          toast({
            variant: "destructive",
            title: "Erreur",
            description: "Impossible de charger les activités.",
          });
          return;
        }

        console.log('Activities fetched:', data);
        setActivities(data || []);
      } catch (error) {
        console.error('Error fetching activities:', error);
      } finally {
        setLoadingActivities(false);
      }
    };

    fetchProfile();
    fetchActivities();
  }, [toast]);

  const weekSummary = {
    totalRuns: activities.length,
    totalDistance: `${activities.reduce((sum, activity) => sum + activity.distance, 0).toFixed(1)} km`,
    avgPace: activities.length > 0 ? calculatePace(
      activities.reduce((sum, activity) => sum + activity.time, 0) / activities.length,
      activities.reduce((sum, activity) => sum + activity.distance, 0) / activities.length
    ) : "0:00/km",
    bestSplit: activities.length > 0 ? calculatePace(
      Math.min(...activities.map(activity => activity.time)),
      Math.min(...activities.map(activity => activity.distance))
    ) : "0:00/km"
  };

  // Convertir les activités de la base en format pour RunCard
  const runs = activities.map((activity) => ({
    id: activity.id,
    title: `Session ${new Date(activity.created_at).toLocaleDateString('fr-FR')}`,
    date: new Date(activity.created_at).toLocaleDateString('fr-FR', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    }),
    distance: formatDistance(activity.distance),
    duration: formatDuration(activity.time),
    pace: calculatePace(activity.time, activity.distance),
    isDebriefed: activity.reviewed,
    review: activity.review,
    aiRating: activity.reviewed ? Math.random() * 2 + 7 : undefined // Note aléatoire pour l'affichage
  }));

  const summaryStats = [
    { icon: TrendingUp, label: "Total Runs", value: weekSummary.totalRuns },
    { icon: Clock, label: "Total Distance", value: weekSummary.totalDistance },
    { icon: Zap, label: "Avg Pace", value: weekSummary.avgPace },
    { icon: Award, label: "Best Split", value: weekSummary.bestSplit }
  ];

  const handleProfileUpdate = (updatedProfile: Record<string, unknown>) => {
    setUserProfile(updatedProfile);
  };

  return (
    <div className="min-h-screen bg-background pb-20 font-sf">
      <Header 
        title="Activity Log" 
        rightIcon={
          <Settings 
            size={20} 
            onClick={() => setProfileDialogOpen(true)}
            className="cursor-pointer" 
          />
        }
      />
      
      <div className="p-4 space-y-6">
        {/* This Week's Summary */}
        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-4 text-foreground">This Week's Summary</h2>
          <div className="grid grid-cols-2 gap-4">
            {summaryStats.map(({ icon: Icon, label, value }, i) => (
              <div key={i} className="text-center">
                <Icon size={20} className="text-primary mx-auto mb-2" />
                <p className="text-sm font-semibold text-foreground">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Runs List */}
        <div>
          <h2 className="text-lg font-semibold mb-4 text-foreground">Recent Activities</h2>
          {loadingActivities ? (
            <Card className="p-6 text-center">
              <p className="text-muted-foreground">Chargement des activités...</p>
            </Card>
          ) : runs.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-muted-foreground">Aucune activité enregistrée pour le moment.</p>
              <p className="text-sm text-muted-foreground mt-2">
                Utilisez l'enregistrement vocal sur la page d'accueil pour ajouter votre première session !
              </p>
            </Card>
          ) : (
            <div className="space-y-0">
              {runs.map((run) => (
                <RunCard
                  key={run.id}
                  {...run}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <UserProfileDialog
        open={profileDialogOpen}
        onOpenChange={setProfileDialogOpen}
        profile={userProfile}
        onProfileUpdate={handleProfileUpdate}
      />
    </div>
  );
};

export default ActivityLog;