import React, { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Brain,
  Send,
  Loader2,
  Bot,
  Image as ImageIcon,
  X,
  Paperclip,
} from "lucide-react";

interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
  image?: string;
}

interface AIChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const defaultMessages: Message[] = [
  {
    id: "1",
    content:
      "Welcome to Agrevanna AI Assistant! I'm here to help you manage your livestock farm more efficiently. How can I assist you today?",
    sender: "ai",
    timestamp: new Date(Date.now() - 50000),
  },
  {
    id: "2",
    content:
      "Can you help me analyze this image of my cattle for any health issues?",
    sender: "user",
    timestamp: new Date(Date.now() - 40000),
    image:
      "https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=500&h=300&fit=crop",
  },
  {
    id: "3",
    content: `I've analyzed the image of your cattle. The animals appear to be in good health with normal posture and coat condition. However, I notice slight signs of heat stress in a few animals. I recommend:

1. Increasing shade coverage in the pasture
2. Ensuring fresh water is readily available
3. Monitoring their behavior during peak heat hours

Would you like me to create a task for implementing these recommendations?`,
    sender: "ai",
    timestamp: new Date(Date.now() - 30000),
  },
  {
    id: "4",
    content:
      "Yes, please create a task for that. Also, what's the optimal time for their next health check?",
    sender: "user",
    timestamp: new Date(Date.now() - 20000),
  },
];

const AIChatDialog = ({ open, onOpenChange }: AIChatDialogProps) => {
  const [messages, setMessages] = useState<Message[]>(defaultMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() && !selectedImage) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: "user",
      timestamp: new Date(),
      image: imagePreview || undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setSelectedImage(null);
    setImagePreview(null);
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content:
          "Based on your query, I recommend scheduling the next health check within 7 days. I've created a task for implementing the heat stress prevention measures, and I'll monitor the situation closely. Is there anything specific you'd like me to focus on during the health check?",
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] h-[90vh] sm:h-[80vh] flex flex-col p-0">
        <div className="p-4 border-b flex items-center gap-2 flex-shrink-0">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Brain className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold">Farm AI Assistant</h2>
            <p className="text-sm text-muted-foreground">
              Ask me anything about your farm
            </p>
          </div>
        </div>

        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-3 ${message.sender === "user" ? "flex-row-reverse" : ""}`}
              >
                <Avatar className="h-8 w-8">
                  {message.sender === "ai" ? (
                    <>
                      <AvatarImage src="https://api.dicebear.com/7.x/bottts/svg?seed=farm-ai" />
                      <AvatarFallback>
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </>
                  ) : (
                    <>
                      <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=farm-manager" />
                      <AvatarFallback>U</AvatarFallback>
                    </>
                  )}
                </Avatar>
                <div className={`space-y-2 max-w-[85%]`}>
                  {message.image && (
                    <div className="relative w-full max-w-[240px] rounded-lg overflow-hidden">
                      <img
                        src={message.image}
                        alt="Uploaded content"
                        className="w-full h-auto rounded-lg"
                      />
                    </div>
                  )}
                  <div
                    className={`rounded-lg p-3 ${message.sender === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                  >
                    <p className="text-sm whitespace-pre-wrap">
                      {message.content}
                    </p>
                    <span className="text-xs opacity-70 mt-1 block">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">AI is typing...</span>
              </div>
            )}
          </div>
        </ScrollArea>

        {imagePreview && (
          <div className="p-2 border-t">
            <div className="relative w-20 h-20">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-full object-cover rounded-md"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-foreground/10 hover:bg-foreground/20"
                onClick={removeImage}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        <div className="p-4 border-t">
          <div className="flex gap-2">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              ref={fileInputRef}
            />
            <Button
              variant="ghost"
              size="icon"
              className="flex-shrink-0"
              onClick={() => fileInputRef.current?.click()}
            >
              <ImageIcon className="h-5 w-5" />
            </Button>
            <Input
              placeholder="Ask a question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button
              onClick={handleSend}
              disabled={(!input.trim() && !selectedImage) || isTyping}
              size="icon"
              className="flex-shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Press Enter to send, Shift + Enter for new line
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AIChatDialog;
