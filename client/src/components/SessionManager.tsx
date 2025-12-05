import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Clock } from "lucide-react";

const SESSION_DURATION = 35 * 60 * 1000; // 35 minutes
const WARNING_TIME = 5 * 60 * 1000; // 5 minutes before expiry - a dialog apperas withha counter

export function SessionManager() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!user) return;

    // Get login time from localStorage or set it now
    const loginTime = localStorage.getItem("loginTime");
    const currentLoginTime = loginTime ? parseInt(loginTime) : Date.now();
    
    if (!loginTime) {
      localStorage.setItem("loginTime", currentLoginTime.toString());
    }

    // Calculate time until warning and expiry
    const warningTimeout = setTimeout(() => {
      setShowWarning(true);
      setTimeLeft(5 * 60); // 5 minutes in seconds
    }, SESSION_DURATION - WARNING_TIME);

    const expiryTimeout = setTimeout(() => {
      handleSessionExpiry();
    }, SESSION_DURATION);

    // Countdown timer for warning dialog
    let countdownInterval: NodeJS.Timeout;
    if (showWarning) {
      countdownInterval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      clearTimeout(warningTimeout);
      clearTimeout(expiryTimeout);
      if (countdownInterval) clearInterval(countdownInterval);
    };
  }, [user, showWarning]);

  const handleSessionExpiry = () => {
    localStorage.removeItem("loginTime");
    logout();
    toast({
      title: "Session Expired",
      description: "Your session has expired. Please login again.",
      variant: "destructive",
    });
  };

  const handleContinueSession = () => {
    // Reset session timer
    localStorage.setItem("loginTime", Date.now().toString());
    setShowWarning(false);
    setTimeLeft(0);
    
    toast({
      title: "Session Extended",
      description: "Your session has been extended for another 35 minutes.",
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!user) return null;

  return (
    <AlertDialog open={showWarning} onOpenChange={setShowWarning}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-amber-100 dark:bg-amber-900/20 p-3 rounded-full">
              <Clock className="h-6 w-6 text-amber-600 dark:text-amber-500" />
            </div>
            <AlertDialogTitle className="text-xl">Session Expiring Soon</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-base pt-2">
            Your session will expire in <span className="font-bold text-foreground">{formatTime(timeLeft)}</span> due to inactivity.
            <br /><br />
            Would you like to continue your session?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogAction
            onClick={() => {
              setShowWarning(false);
              handleSessionExpiry();
            }}
            variant="outline"
            className="sm:w-auto"
          >
            Logout
          </AlertDialogAction>
          <AlertDialogAction
            onClick={handleContinueSession}
            className="sm:w-auto"
          >
            Continue Session
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}