import { WorkerSidebar } from "@/components/WorkerSidebar";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Paperclip } from "lucide-react";
import { useState } from "react";

const conversations = [
  {
    id: "1",
    name: "Suresh Enterprises",
    lastMessage: "Can you start tomorrow?",
    time: "2m ago",
    unread: 2,
    photo: "https://api.dicebear.com/7.x/initials/svg?seed=SE",
  },
  {
    id: "2",
    name: "Mumbai Builders",
    lastMessage: "Payment processed",
    time: "1h ago",
    unread: 0,
    photo: "https://api.dicebear.com/7.x/initials/svg?seed=MB",
  },
];

const messages = [
  {
    id: "1",
    sender: "employer",
    text: "Hello! Are you available for a construction project?",
    time: "10:30 AM",
  },
  {
    id: "2",
    sender: "me",
    text: "Yes, I'm available. What are the project details?",
    time: "10:32 AM",
  },
  {
    id: "3",
    sender: "employer",
    text: "It's a 3-day project in Andheri. ₹500/day. Can you start tomorrow?",
    time: "10:35 AM",
  },
];

export default function Messages() {
  const [selectedChat, setSelectedChat] = useState("1");
  const [message, setMessage] = useState("");

  return (
    <div className="flex min-h-screen bg-background">
      <WorkerSidebar />
      
      <main className="flex-1 md:ml-64 pb-20 md:pb-0">
        <div className="h-screen flex">
          {/* Conversations List */}
          <div className="w-full md:w-80 border-r">
            <div className="p-4 border-b">
              <h2 className="text-xl font-bold">Messages</h2>
            </div>
            <ScrollArea className="h-[calc(100vh-120px)]">
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => setSelectedChat(conv.id)}
                  className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-muted transition-colors ${
                    selectedChat === conv.id ? "bg-muted" : ""
                  }`}
                >
                  <Avatar>
                    <AvatarImage src={conv.photo} />
                    <AvatarFallback>{conv.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold truncate">{conv.name}</h3>
                      <span className="text-xs text-muted-foreground">{conv.time}</span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {conv.lastMessage}
                    </p>
                  </div>
                  {conv.unread > 0 && (
                    <div className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center text-xs">
                      {conv.unread}
                    </div>
                  )}
                </div>
              ))}
            </ScrollArea>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col hidden md:flex">
            <div className="p-4 border-b flex items-center gap-3">
              <Avatar>
                <AvatarImage src={conversations[0].photo} />
                <AvatarFallback>SE</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">{conversations[0].name}</h3>
                <p className="text-sm text-muted-foreground">Active now</p>
              </div>
            </div>

            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-xs md:max-w-md p-3 rounded-lg ${
                        msg.sender === "me"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <p>{msg.text}</p>
                      <p className="text-xs mt-1 opacity-70">{msg.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Button variant="outline" size="icon">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Input
                  placeholder="Type a message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && message.trim()) {
                      setMessage("");
                    }
                  }}
                />
                <Button className="gradient-saffron text-white">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <MobileBottomNav />
    </div>
  );
}
