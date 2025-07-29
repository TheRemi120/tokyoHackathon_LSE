import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { RunCard } from "@/components/RunCard";
import { ReviewDiv } from "@/components/ReviewDiv";
import { ReviewActivityButton } from "@/components/ReviewActivityButton";
import { Card } from "@/components/ui/card";
import { Volume2, TrendingUp, Moon, Heart, AlertCircle, CheckCircle, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { User, Session } from "@supabase/supabase-js";
import { Activity, formatDuration, formatDistance, calculatePace } from "@/types/Activity";

const weeklyStats = [
  { icon: TrendingUp, label: "Steps", value: "8,432", status: "good" },
  { icon: Moon, label: "Sleep", value: "7.2h", status: "warning" },
  { icon: Heart, label: "Recovery", value: "Good", status: "good" }
];

const Home = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (!session?.user) {
          navigate("/auth");
        } else {
          fetchActivities(session.user.id);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session?.user) {
        navigate("/auth");
      } else {
        fetchActivities(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchActivities = async (userId: string) => {
    try {
      setLoadingActivities(true);
      
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger les activités.",
        });
        return;
      }

      setActivities(data || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoadingActivities(false);
    }
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de se déconnecter.",
      });
    } else {
      toast({
        title: "Déconnexion réussie",
        description: "Vous avez été déconnecté.",
      });
      navigate("/auth");
    }
  };

  const handleActivityReviewed = (updatedActivity: Activity) => {
    setActivities(prev => 
      prev.map(activity => 
        activity.id === updatedActivity.id ? updatedActivity : activity
      )
    );
  };

  const handleActivityAdded = (newActivity: Activity) => {
    setActivities(prev => [newActivity, ...prev]);
    toast({
      title: "Nouvelle activité",
      description: "Votre session a été ajoutée avec succès.",
    });
  };


  // Filter activities that need review
  const unreviewed = activities.filter(activity => !activity.reviewed);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 font-sf">
      <Header 
        title="Home" 
        rightIcon={
          <LogOut size={16} onClick={handleSignOut} className="cursor-pointer" />
        } 
      />
      
      <div className="p-4 space-y-6">
        {/* Pending Reviews */}
        {loadingActivities ? (
          <Card className="p-6 text-center">
            <p className="text-muted-foreground">Chargement des activités...</p>
          </Card>
        ) : unreviewed.length > 0 ? (
          <div>
            <h2 className="text-lg font-semibold mb-4 text-foreground">Activités à commenter</h2>
            <div className="space-y-4">
              {unreviewed.map((activity) => (
                <div key={activity.id} className="space-y-3">
                  <Card className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-foreground">Course du {new Date(activity.created_at).toLocaleDateString('fr-FR')}</h3>
                      <span className="text-xs text-muted-foreground">
                        {new Date(activity.created_at).toLocaleTimeString('fr-FR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Distance</p>
                        <p className="font-medium">{formatDistance(activity.distance)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Durée</p>
                        <p className="font-medium">{formatDuration(activity.time)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Allure</p>
                        <p className="font-medium">{calculatePace(activity.time, activity.distance)}</p>
                      </div>
                    </div>
                  </Card>
                  <ReviewDiv 
                    activity={activity} 
                    onReviewSubmitted={handleActivityReviewed}
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <Card className="p-6 text-center">
            <CheckCircle className="mx-auto mb-2 text-green-success" size={24} />
            <p className="text-foreground font-medium">Toutes les activités sont commentées !</p>
            <p className="text-sm text-muted-foreground">Aucune activité en attente de commentaire</p>
          </Card>
        )}

        {/* AI Coach Card */}
        <Card className="p-4 bg-blue-glass">
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-semibold text-primary">AI Coach</h3>
            <Button variant="ghost" size="sm" className="p-1">
              <Volume2 size={16} className="text-primary" />
            </Button>
          </div>
          <p className="text-sm text-foreground leading-relaxed">
            Great job on your consistency this week! Your recovery metrics look good. 
            Consider adding a tempo run to your schedule for next week to build speed endurance.
          </p>
        </Card>

        {/* Review Activity Button */}
        {user && (
          <ReviewActivityButton
            userId={user.id}
            onActivityAdded={handleActivityAdded}
          />
        )}

        {/* This Week's Summary */}
        <div>
          <h2 className="text-lg font-semibold mb-4 text-foreground">This Week's Summary</h2>
          <div className="grid grid-cols-3 gap-3">
            {weeklyStats.map(({ icon: Icon, label, value, status }) => (
              <Card key={label} className="p-3 text-center">
                <div className="flex justify-center mb-2">
                  <Icon 
                    size={20} 
                    className={status === "good" ? "text-green-success" : "text-yellow-warning"} 
                  />
                  {status === "warning" && (
                    <AlertCircle size={12} className="text-yellow-warning ml-1" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground mb-1">{label}</p>
                <p className="text-sm font-semibold text-foreground">{value}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;