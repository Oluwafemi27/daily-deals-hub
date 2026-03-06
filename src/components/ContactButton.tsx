import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { MessageCircle, Loader } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

interface ContactButtonProps {
  targetUserId: string;
  targetUserName?: string;
  variant?: "default" | "outline" | "secondary" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  initialMessage?: string;
  className?: string;
  label?: string;
}

export const ContactButton = ({
  targetUserId,
  targetUserName = "this user",
  variant = "default",
  size = "default",
  initialMessage,
  className,
  label = "Contact",
}: ContactButtonProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const handleContact = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to send messages",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    if (user.id === targetUserId) {
      toast({
        title: "Cannot message yourself",
        description: "You cannot send messages to yourself",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);

      // Send initial message if provided
      if (initialMessage) {
        const { error } = await supabase.from("messages").insert({
          sender_id: user.id,
          receiver_id: targetUserId,
          content: initialMessage,
        });

        if (error) throw error;

        toast({
          title: "Message sent",
          description: `Your message to ${targetUserName} has been sent`,
        });
      }

      // Invalidate conversations to refresh
      queryClient.invalidateQueries({ queryKey: ["conversations"] });

      // Navigate to messages page
      navigate("/messages");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleContact}
      disabled={isLoading}
      variant={variant}
      size={size}
      className={cn("gap-2", className)}
    >
      {isLoading ? (
        <Loader className="h-4 w-4 animate-spin" />
      ) : (
        <MessageCircle className="h-4 w-4" />
      )}
      {label}
    </Button>
  );
};
