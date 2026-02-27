import { useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Message {
  id: number;
  text: string;
  isBot: boolean;
}

const FAQ: Record<string, string> = {
  "shipping": "We offer free shipping on orders over $15. Standard delivery takes 7-15 business days.",
  "return": "You can return items within 30 days of delivery. Items must be in original condition.",
  "payment": "We accept credit cards, debit cards, and PayPal. All payments are secure.",
  "track": "Go to My Orders in your profile to track your order status and tracking number.",
  "account": "You can manage your account from the Profile page. Update your name, email, and password there.",
  "seller": "To become a seller, create an account and select 'Sell' during signup. You can list products immediately.",
  "refund": "Refunds are processed within 5-7 business days after we receive your returned item.",
  "contact": "You can reach us through this chat or via the Messages page in your profile.",
};

const getResponse = (input: string): string => {
  const lower = input.toLowerCase();
  for (const [key, response] of Object.entries(FAQ)) {
    if (lower.includes(key)) return response;
  }
  if (lower.includes("hello") || lower.includes("hi") || lower.includes("hey")) {
    return "Hello! 👋 Welcome to Broken Store support. How can I help you today? You can ask about shipping, returns, payments, tracking, or your account.";
  }
  if (lower.includes("thank")) {
    return "You're welcome! Is there anything else I can help with?";
  }
  return "I'm not sure about that. You can ask me about: shipping, returns, payments, order tracking, account management, becoming a seller, or refunds. For complex issues, please use the Messages page to contact our team.";
};

const CustomerServiceBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: 0, text: "Hi! 👋 I'm Broken Store's support bot. How can I help you today?", isBot: true },
  ]);
  const [input, setInput] = useState("");

  const send = () => {
    if (!input.trim()) return;
    const userMsg: Message = { id: Date.now(), text: input, isBot: false };
    const botMsg: Message = { id: Date.now() + 1, text: getResponse(input), isBot: true };
    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInput("");
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-24 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all",
          "bg-primary text-primary-foreground hover:scale-105 active:scale-95"
        )}
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-40 right-4 z-50 w-80 max-w-[calc(100vw-2rem)] rounded-2xl border border-border bg-card shadow-2xl animate-fade-in">
          {/* Header */}
          <div className="rounded-t-2xl bg-primary px-4 py-3">
            <p className="font-bold text-primary-foreground">Customer Support</p>
            <p className="text-xs text-primary-foreground/80">Broken Store Help Center</p>
          </div>

          {/* Messages */}
          <div className="h-64 overflow-y-auto p-3 space-y-2 scrollbar-hide">
            {messages.map((msg) => (
              <div key={msg.id} className={cn("max-w-[80%] rounded-2xl px-3 py-2 text-sm", msg.isBot ? "bg-muted text-foreground" : "ml-auto bg-primary text-primary-foreground")}>
                {msg.text}
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="flex gap-2 border-t border-border p-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Type a message..."
              className="flex-1 h-9 text-sm"
            />
            <Button size="icon" className="h-9 w-9 shrink-0" onClick={send}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default CustomerServiceBot;
