import { useState, useEffect } from "react";
import { toast } from "sonner";

const VAPID_PUBLIC_KEY_ENDPOINT = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/push_subscriptions/vapid_public_key`;
const SUBSCRIPTION_ENDPOINT = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/push_subscriptions`;

interface UseNotificationReturn {
  isSupported: boolean;
  permission: NotificationPermission | null;
  isSubscribed: boolean;
  requestPermission: () => Promise<void>;
  subscribe: () => Promise<void>;
  unsubscribe: () => Promise<void>;
}

export function useNotifications(): UseNotificationReturn {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | null>(
    null
  );
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    // ブラウザがPush APIをサポートしているかチェック
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
      checkSubscriptionStatus();
    }
  }, []);

  const checkSubscriptionStatus = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(subscription !== null);
    } catch (error) {
      console.error("Failed to check subscription status:", error);
    }
  };

  const requestPermission = async () => {
    if (!isSupported) {
      toast.error("お使いのブラウザは通知をサポートしていません");
      return;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === "granted") {
        toast.success("通知が許可されました");
        await subscribe();
      } else {
        toast.error("通知が拒否されました");
      }
    } catch (error) {
      console.error("Failed to request permission:", error);
      toast.error("通知の許可リクエストに失敗しました");
    }
  };

  const subscribe = async () => {
    if (permission !== "granted") {
      toast.error("通知の許可が必要です");
      return;
    }

    try {
      // VAPID公開鍵を取得
      const response = await fetch(VAPID_PUBLIC_KEY_ENDPOINT, {
        headers: {
          "access-token": localStorage.getItem("access-token") || "",
          client: localStorage.getItem("client") || "",
          uid: localStorage.getItem("uid") || "",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch VAPID public key");
      }

      const { public_key } = await response.json();

      // Service Workerの登録を取得
      const registration = await navigator.serviceWorker.ready;

      // プッシュマネージャーで購読
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(public_key),
      });

      // サーバーに購読情報を送信
      const subscribeResponse = await fetch(SUBSCRIPTION_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "access-token": localStorage.getItem("access-token") || "",
          client: localStorage.getItem("client") || "",
          uid: localStorage.getItem("uid") || "",
        },
        body: JSON.stringify({
          subscription: {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: arrayBufferToBase64(subscription.getKey("p256dh")),
              auth: arrayBufferToBase64(subscription.getKey("auth")),
            },
          },
        }),
      });

      if (!subscribeResponse.ok) {
        throw new Error("Failed to save subscription");
      }

      setIsSubscribed(true);
      toast.success("通知の購読を開始しました");
    } catch (error) {
      console.error("Failed to subscribe:", error);
      toast.error("通知の購読に失敗しました");
    }
  };

  const unsubscribe = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        // サーバーから購読を削除
        await fetch(SUBSCRIPTION_ENDPOINT, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "access-token": localStorage.getItem("access-token") || "",
            client: localStorage.getItem("client") || "",
            uid: localStorage.getItem("uid") || "",
          },
          body: JSON.stringify({
            endpoint: subscription.endpoint,
          }),
        });

        // ブラウザの購読を解除
        await subscription.unsubscribe();
        setIsSubscribed(false);
        toast.success("通知の購読を解除しました");
      }
    } catch (error) {
      console.error("Failed to unsubscribe:", error);
      toast.error("通知の購読解除に失敗しました");
    }
  };

  return {
    isSupported,
    permission,
    isSubscribed,
    requestPermission,
    subscribe,
    unsubscribe,
  };
}

// ヘルパー関数
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function arrayBufferToBase64(buffer: ArrayBuffer | null): string {
  if (!buffer) return "";

  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}
