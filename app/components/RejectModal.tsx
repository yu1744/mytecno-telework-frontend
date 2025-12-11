"use client";

import { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { XCircle } from "lucide-react";

interface RejectModalProps {
	open: boolean;
	onClose: () => void;
	onConfirm: (comment: string) => void;
	applicationId: string | number;
	applicantName: string;
}

export function RejectModal({
	open,
	onClose,
	onConfirm,
	applicationId,
	applicantName,
}: RejectModalProps) {
	const [comment, setComment] = useState("");
	const [error, setError] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleConfirm = async () => {
		// コメントが空の場合はエラーを表示
		if (!comment.trim()) {
			setError("却下理由は必須です。申請者への説明を入力してください。");
			return;
		}

		if (comment.trim().length < 10) {
			setError("却下理由は10文字以上で入力してください。");
			return;
		}

		setError("");
		setIsSubmitting(true);

		try {
			await onConfirm(comment.trim());
			setComment("");
			onClose();
		} catch (error) {
			console.error("却下エラー:", error);
			setError("却下処理に失敗しました。もう一度お試しください。");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleClose = () => {
		if (!isSubmitting) {
			setComment("");
			setError("");
			onClose();
		}
	};

	const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		setComment(e.target.value);
		if (error) {
			setError("");
		}
	};

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<div className="flex items-center gap-2">
						<XCircle className="h-6 w-6 text-red-600" />
						<DialogTitle>申請を却下</DialogTitle>
					</div>
					<DialogDescription>
						{applicantName}さんの在宅勤務申請を却下しますか？
					</DialogDescription>
				</DialogHeader>

				<div className="grid gap-4 py-4">
					<div className="grid gap-2">
						<Label htmlFor="reject-comment" className="text-red-600">
							却下理由 <span className="text-red-600">*必須</span>
						</Label>
						<Textarea
							id="reject-comment"
							placeholder="却下理由を詳しく入力してください（必須）"
							value={comment}
							onChange={handleCommentChange}
							rows={5}
							disabled={isSubmitting}
							className={`resize-none ${error ? "border-red-500" : ""}`}
							required
						/>
						{error && (
							<p className="text-sm text-red-600 flex items-center gap-1">
								<XCircle className="h-4 w-4" />
								{error}
							</p>
						)}
						<p className="text-xs text-muted-foreground">
							申請者が理解できるよう、却下の理由を具体的に記入してください。
						</p>
					</div>

					<div className="rounded-md bg-yellow-50 dark:bg-yellow-900/20 p-3 border border-yellow-200 dark:border-yellow-800">
						<p className="text-sm text-yellow-800 dark:text-yellow-200">
							⚠️
							却下すると申請者に通知が送信されます。却下理由は申請者に表示されます。
						</p>
					</div>
				</div>

				<DialogFooter>
					<Button
						type="button"
						variant="outline"
						onClick={handleClose}
						disabled={isSubmitting}
					>
						キャンセル
					</Button>
					<Button
						type="button"
						onClick={handleConfirm}
						disabled={isSubmitting || !comment.trim()}
						className="bg-red-600 hover:bg-red-700"
					>
						{isSubmitting ? "却下中..." : "却下する"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
