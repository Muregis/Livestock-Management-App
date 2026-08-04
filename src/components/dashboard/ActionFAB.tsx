import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import AIChatDialog from "@/components/ai/AIChatDialog";

const ActionFAB = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <>
      <div className="fixed bottom-20 right-4 z-50 bg-transparent">
        <Button
          className="h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90"
          size="icon"
          onClick={() => setIsChatOpen(true)}
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      </div>

      <AIChatDialog open={isChatOpen} onOpenChange={setIsChatOpen} />
    </>
  );
};

export default ActionFAB;
