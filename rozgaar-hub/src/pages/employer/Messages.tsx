import { EmployerSidebar } from "@/components/EmployerSidebar";
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
    name: "Ramesh Patel",
    lastMessage: "I can start tomorrow",
    time: "5m ago",
    unread: 1,
    photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ramesh",
  },
  {
    id: "2",
    name: "Priya Singh",
    lastMessage: "Thank you for the opportunity",
    time: "2h ago",
    unread: 0,
    photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya",
  },
];

const messages = [
  {
    id: "1",
    sender: "worker",
    text: "Hello! I saw your construction project posting.",
    time: "10:30 AM",
  },
  {
    id: "2",
    sender: "me",
    text: "Great! Are you available to start tomorrow?",
    time: "10:32 AM",
  },
  {
    id: "3",
    sender: "worker",
    text: "Yes, I can start tomorrow. What time should I arrive?",
    time: "10:35 AM",
  },
];

export default function Messages() {
  const [selectedChat, setSelectedChat] = useState("1");
  const [message, setMessage] = useState("");

  return (
    <div className="flex min-h-screen bg-background">
      <EmployerSidebar />
      
      <main className="flex-1 md:ml-64">
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
                <AvatarFallback>RP</AvatarFallback>
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
                <Button className="gradient-hero text-white">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
