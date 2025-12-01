"use client";

import { useNotifications } from "../hooks/useNotifications";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Bell, BellOff, CheckCircle2, XCircle } from "lucide-react";

export function NotificationSettings() {
  const {
    isSupported,
    permission,
    isSubscribed,
    requestPermission,
    subscribe,
    unsubscribe,
  } = useNotifications();

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-destructive" />
            通知が利用できません
          </CardTitle>
          <CardDescription>
            お使いのブラウザはプッシュ通知をサポートしていません。
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          プッシュ通知設定
        </CardTitle>
        <CardDescription>
          申請や承認の状況をリアルタイムで通知します
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 通知許可状態 */}
        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
          <div>
            <p className="font-medium text-sm">通知許可</p>
            <p className="text-xs text-muted-foreground mt-1">
              {permission === "granted"
                ? "許可されています"
                : permission === "denied"
                ? "拒否されています"
                : "未設定です"}
            </p>
          </div>
          {permission === "granted" ? (
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          ) : (
            <XCircle className="h-5 w-5 text-destructive" />
          )}
        </div>

        {/* 購読状態 */}
        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
          <div>
            <p className="font-medium text-sm">通知購読</p>
            <p className="text-xs text-muted-foreground mt-1">
              {isSubscribed ? "購読中です" : "購読していません"}
            </p>
          </div>
          {isSubscribed ? (
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          ) : (
            <BellOff className="h-5 w-5 text-muted-foreground" />
          )}
        </div>

        {/* 通知の種類 */}
        <div className="space-y-2">
          <p className="text-sm font-medium">通知されるイベント</p>
          <ul className="text-xs text-muted-foreground space-y-1 ml-4 list-disc">
            <li>新しい申請が作成されたとき（承認者・管理者）</li>
            <li>申請が承認されたとき（申請者）</li>
            <li>申請が却下されたとき（申請者）</li>
            <li>在宅勤務日の前日リマインダー（申請者）</li>
          </ul>
        </div>

        {/* アクションボタン */}
        <div className="flex gap-2 pt-4">
          {permission !== "granted" && (
            <Button
              onClick={requestPermission}
              className="flex-1"
            >
              <Bell className="h-4 w-4 mr-2" />
              通知を許可
            </Button>
          )}

          {permission === "granted" && !isSubscribed && (
            <Button
              onClick={subscribe}
              className="flex-1"
            >
              <Bell className="h-4 w-4 mr-2" />
              通知を購読
            </Button>
          )}

          {isSubscribed && (
            <Button
              onClick={unsubscribe}
              variant="outline"
              className="flex-1"
            >
              <BellOff className="h-4 w-4 mr-2" />
              購読を解除
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
