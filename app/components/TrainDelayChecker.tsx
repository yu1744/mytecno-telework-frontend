"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Train, AlertTriangle, CheckCircle2 } from "lucide-react";
import { toast } from "react-hot-toast";
import api from "@/app/lib/api";

interface DelayInfo {
  is_delayed: boolean;
  status: string;
  delay_minutes: number | null;
  cause: string | null;
  railway_name: string | null;
}

interface RouteDelay {
  route_id: number;
  route_name: string;
  api_identifier: string;
  delay_info: DelayInfo;
}

interface TrainDelayResponse {
  checked_at: string;
  routes: RouteDelay[];
  has_delay: boolean;
  message?: string;
}

interface TrainDelayCheckerProps {
  onDelayDetected?: (delayInfo: TrainDelayResponse) => void;
  onReasonUpdate?: (reason: string) => void;
}

const TrainDelayChecker: React.FC<TrainDelayCheckerProps> = ({
  onDelayDetected,
  onReasonUpdate,
}) => {
  const [loading, setLoading] = useState(false);
  const [delayInfo, setDelayInfo] = useState<TrainDelayResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkDelays = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get<TrainDelayResponse>("/train_delays");
      const data = response.data;

      // ODPT APIから取得したデータをコンソールにログ出力
      console.group("🚃 ODPT API Response");
      console.log("Raw data:", data);
      console.log("Checked at:", data.checked_at);
      console.log("Has delay:", data.has_delay);
      console.log("Routes:", data.routes);
      if (data.routes && data.routes.length > 0) {
        console.table(data.routes.map(r => ({
          route_name: r.route_name,
          api_identifier: r.api_identifier,
          is_delayed: r.delay_info.is_delayed,
          status: r.delay_info.status,
          delay_minutes: r.delay_info.delay_minutes,
          cause: r.delay_info.cause
        })));
      }
      console.groupEnd();

      setDelayInfo(data);

      if (onDelayDetected) {
        onDelayDetected(data);
      }

      // 遅延がある場合、申請理由を自動生成
      if (data.has_delay && onReasonUpdate) {
        const delayedRoutes = data.routes.filter(
          (r) => r.delay_info.is_delayed
        );
        const reasonText = delayedRoutes
          .map((r) => {
            const minutes = r.delay_info.delay_minutes
              ? `約${r.delay_info.delay_minutes}分`
              : "";
            return `${r.route_name}で遅延が発生${minutes ? `（${minutes}）` : ""}`;
          })
          .join("、");
        onReasonUpdate(`電車遅延のため在宅勤務を申請します。${reasonText}`);
        toast.success("遅延情報を申請理由に反映しました");
      } else if (!data.has_delay) {
        toast("現在、登録された経路に遅延はありません", {
          icon: "✅",
        });
      }
    } catch (err: unknown) {
      let errorMessage = "遅延情報の取得に失敗しました";
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      if (typeof err === "object" && err !== null) {
        const axiosError = err as { response?: { data?: { error?: string; message?: string } } };
        if (axiosError.response?.data?.error) {
          errorMessage = axiosError.response.data.error;
        } else if (axiosError.response?.data?.message) {
          errorMessage = axiosError.response.data.message;
        }
      }
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (isDelayed: boolean) => {
    return isDelayed
      ? "border-destructive bg-destructive/10"
      : "border-green-500 bg-green-50";
  };

  const getStatusIcon = (isDelayed: boolean) => {
    return isDelayed ? (
      <AlertTriangle className="h-4 w-4 text-destructive" />
    ) : (
      <CheckCircle2 className="h-4 w-4 text-green-600" />
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={checkDelays}
          disabled={loading}
          className="flex items-center gap-2"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Train className="h-4 w-4" />
          )}
          遅延情報を確認
        </Button>
        {delayInfo && (
          <span className="text-xs text-muted-foreground">
            最終確認:{" "}
            {new Date(delayInfo.checked_at).toLocaleTimeString("ja-JP")}
          </span>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>エラー</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {delayInfo && delayInfo.routes.length > 0 && (
        <div className="space-y-2">
          {delayInfo.has_delay && (
            <Alert className="border-destructive bg-destructive/10">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <AlertTitle className="text-destructive">
                遅延が発生しています
              </AlertTitle>
              <AlertDescription>
                登録された通勤経路に遅延が発生しています。申請理由に遅延情報を自動入力しました。
              </AlertDescription>
            </Alert>
          )}

          <div className="grid gap-2">
            {delayInfo.routes.map((route) => (
              <div
                key={route.route_id}
                className={`p-3 rounded-md border ${getStatusColor(route.delay_info.is_delayed)}`}
              >
                <div className="flex items-center gap-2">
                  {getStatusIcon(route.delay_info.is_delayed)}
                  <span className="font-medium">{route.route_name}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {route.delay_info.status}
                  {route.delay_info.delay_minutes && (
                    <span className="ml-2 font-medium text-destructive">
                      約{route.delay_info.delay_minutes}分遅延
                    </span>
                  )}
                </p>
                {route.delay_info.cause && (
                  <p className="text-xs text-muted-foreground mt-1">
                    原因: {route.delay_info.cause}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {delayInfo && delayInfo.routes.length === 0 && (
        <Alert>
          <Train className="h-4 w-4" />
          <AlertTitle>経路未登録</AlertTitle>
          <AlertDescription>
            {delayInfo.message ||
              "通勤経路が登録されていないか、API識別子が設定されていません。プロフィール設定から経路を登録してください。"}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default TrainDelayChecker;

