import { useState, useEffect } from "react";
import { EmployerSidebar } from "@/components/EmployerSidebar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Bell,
  CheckCircle,
  XCircle,
  Trash2,
  CheckCheck,
  BellOff,
  Clock
} from "lucide-react";
import { commonAPI } from "@/lib/api";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  relatedId?: string;
  relatedModel?: string;
  actionUrl?: string;
}

export default function Messages() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const params = filter === "unread" ? { read: "false" } : {};
      const response = await commonAPI.getNotifications(params) as any;

      if (response.success) {
        setNotifications(response.notifications || []);
        setUnreadCount(response.unreadCount || 0);
      }
    } catch (error: any) {
      console.error("Error fetching notifications:", error);
      toast.error(error.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      const response = await commonAPI.markNotificationRead(id) as any;
      if (response.success) {
        toast.success("Notification marked as read");
        fetchNotifications();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to mark as read");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const response = await commonAPI.markAllNotificationsRead() as any;
      if (response.success) {
        toast.success(response.message || "All notifications marked as read");
        fetchNotifications();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to mark all as read");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await commonAPI.deleteNotification(id) as any;
      if (response.success) {
        toast.success("Notification deleted");
        fetchNotifications();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to delete notification");
    }
  };

  const handleDeleteRead = async () => {
    try {
      const response = await commonAPI.deleteReadNotifications() as any;
      if (response.success) {
        toast.success(response.message || "Read notifications deleted");
        fetchNotifications();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to delete notifications");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  const getNotificationIcon = (notification: Notification) => {
    if (notification.title.toLowerCase().includes("accepted")) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
    if (notification.title.toLowerCase().includes("rejected")) {
      return <XCircle className="h-5 w-5 text-red-500" />;
    }
    return <Bell className="h-5 w-5 text-blue-500" />;
  };

  const getNotificationBadgeColor = (notification: Notification) => {
    if (notification.title.toLowerCase().includes("accepted")) {
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    }
    if (notification.title.toLowerCase().includes("rejected")) {
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    }
    return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
  };

  return (
    <div className="flex min-h-screen bg-background">
      <EmployerSidebar />

      <main className="flex-1 md:ml-64">
        <div className="container mx-auto p-4 md:p-8">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">Notifications</h1>
                <p className="text-muted-foreground">
                  Stay updated on worker responses and important updates
                </p>
              </div>
              {unreadCount > 0 && (
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  {unreadCount} unread
                </Badge>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={filter === "all" ? "default" : "outline"}
                onClick={() => setFilter("all")}
                size="sm"
              >
                All
              </Button>
              <Button
                variant={filter === "unread" ? "default" : "outline"}
                onClick={() => setFilter("unread")}
                size="sm"
              >
                Unread
              </Button>
              <Separator orientation="vertical" className="h-8" />
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  onClick={handleMarkAllAsRead}
                  size="sm"
                >
                  <CheckCheck className="h-4 w-4 mr-2" />
                  Mark All Read
                </Button>
              )}
              <Button
                variant="outline"
                onClick={handleDeleteRead}
                size="sm"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Read
              </Button>
            </div>
          </div>

          {/* Notifications List */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-lg bg-muted/20">
              <BellOff className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">
                {filter === "unread" ? "No Unread Notifications" : "No Notifications Yet"}
              </h3>
              <p className="text-muted-foreground">
                {filter === "unread"
                  ? "You're all caught up! Check back later for updates."
                  : "When workers respond to your hiring requests, you'll see notifications here."}
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[calc(100vh-280px)]">
              <div className="space-y-3">
                {notifications.map((notification, index) => (
                  <motion.div
                    key={notification._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Card
                      className={`shadow-card hover:shadow-elevated transition-all duration-200 ${!notification.read ? "border-l-4 border-l-primary" : ""
                        }`}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start gap-3">
                          <div className="mt-1">{getNotificationIcon(notification)}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h3 className="font-semibold text-base leading-tight">
                                {notification.title}
                              </h3>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  {formatDate(notification.createdAt)}
                                </div>
                                {!notification.read && (
                                  <div className="h-2 w-2 rounded-full bg-primary" />
                                )}
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {notification.message}
                            </p>
                            <Badge
                              variant="secondary"
                              className={`text-xs ${getNotificationBadgeColor(notification)}`}
                            >
                              {notification.type}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex gap-2">
                          {!notification.read && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleMarkAsRead(notification._id)}
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Mark Read
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(notification._id)}
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </main>
    </div>
  );
}
