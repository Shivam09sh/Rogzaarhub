import { useState, useRef, useEffect } from "react";
import { WorkerSidebar } from "@/components/WorkerSidebar";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { MessageSquare, Shield, HelpCircle, Send, User, Bot } from "lucide-react";
import { EmergencyContactManager } from "@/components/EmergencyContactManager";
import { InsuranceCertificate } from "@/components/InsuranceCertificate";
import { HelpFAQ } from "@/components/HelpFAQ";
import { useTranslation } from "react-i18next";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function Help() {
  const { t } = useTranslation();
  const [chatMessage, setChatMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const userMsg = chatMessage;
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setChatMessage("");
    setIsLoading(true);

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: "You are a helpful support assistant for RozgaarHub, a platform connecting workers and employers in India. Answer questions about finding work, payments, insurance, and safety. Use Markdown formatting for your responses. Use bold for key terms, lists for steps, and tables where appropriate. Keep answers concise and helpful." },
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: "user", content: userMsg }
          ]
        })
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error?.code === 'insufficient_quota') {
          throw new Error("API Key quota exceeded. Please check your billing details.");
        }
        throw new Error(data.error?.message || "Failed to get response");
      }

      if (data.choices && data.choices[0]) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.choices[0].message.content }]);
      }
    } catch (error: any) {
      console.error("Chat error:", error);
      const errorMessage = error.message.includes("quota")
        ? "The AI service is currently unavailable due to a quota limit. Please check your API key billing."
        : "Sorry, I'm having trouble connecting right now. Please try again later.";

      setMessages(prev => [...prev, { role: 'assistant', content: errorMessage }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <WorkerSidebar />

      <main className="flex-1 md:ml-64 pb-20 md:pb-0">
        <div className="container mx-auto p-4 md:p-8 max-w-5xl space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{t("help.title", "Help & Support")}</h1>
              <p className="text-muted-foreground">
                {t("help.subtitle", "We're here to help you 24/7")}
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Emergency Contacts Section */}
            <div className="md:col-span-1">
              <EmergencyContactManager />
            </div>

            {/* AI Chat Support Section */}
            <Card className="md:col-span-1 flex flex-col h-full shadow-card">
              <CardHeader className="border-b bg-muted/20">
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  {t("help.aiChat", "AI Chat Support")}
                </CardTitle>
                <CardDescription>Get instant answers to your questions</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-end h-[500px] p-0">
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/5">
                  {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-sm gap-2 opacity-50">
                      <Bot className="h-12 w-12" />
                      <p>Start a conversation to get help...</p>
                    </div>
                  ) : (
                    messages.map((msg, idx) => (
                      <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
                          }`}>
                          {msg.role === 'user' ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
                        </div>
                        <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${msg.role === 'user'
                            ? 'bg-primary text-primary-foreground rounded-tr-none'
                            : 'bg-card border rounded-tl-none'
                          }`}>
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            className={`prose prose-sm max-w-none break-words ${msg.role === 'user' ? 'prose-invert' : 'dark:prose-invert'
                              }`}
                            components={{
                              p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                              ul: ({ node, ...props }) => <ul className="list-disc pl-4 mb-2 last:mb-0" {...props} />,
                              ol: ({ node, ...props }) => <ol className="list-decimal pl-4 mb-2 last:mb-0" {...props} />,
                              li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                              a: ({ node, ...props }) => <a className="underline font-medium" {...props} />,
                              strong: ({ node, ...props }) => <strong className="font-bold" {...props} />,
                            }}
                          >
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                      </div>
                    ))
                  )}
                  {isLoading && (
                    <div className="flex gap-3">
                      <div className="h-8 w-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center flex-shrink-0">
                        <Bot className="h-5 w-5" />
                      </div>
                      <div className="bg-card border rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                          <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                          <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce"></span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
                <div className="p-4 border-t bg-background">
                  <form onSubmit={handleChatSubmit} className="flex gap-2">
                    <Input
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      placeholder="Type your question..."
                      className="flex-1"
                      disabled={isLoading}
                    />
                    <Button type="submit" size="icon" disabled={isLoading}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Insurance Section */}
            <Card className="md:col-span-1 shadow-card hover:shadow-elevated transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-600" />
                  {t("help.insurance", "Insurance")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4 text-sm">
                  You are covered under RozgaarHub's Group Insurance Policy.
                </p>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full" variant="outline">View Certificate</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl">
                    <InsuranceCertificate
                      workerName="Shivam Sharma" // Dynamic data would go here
                      workerId="RH-WK-2025-001"
                      validThru="Dec 31, 2025"
                    />
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            {/* FAQs Section */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-blue-500" />
                  {t("help.faqs", "Frequently Asked Questions")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <HelpFAQ />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <MobileBottomNav />
    </div>
  );
}
