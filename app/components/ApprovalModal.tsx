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
import { CheckCircle2 } from "lucide-react";

interface ApprovalModalProps {
	open: boolean;
	onClose: () => void;
	onConfirm: (comment?: string) => void;
	applicationId: string | number;
	applicantName: string;
}

export function ApprovalModal({
	open,
	onClose,
	onConfirm,
	applicationId,
	applicantName,
}: ApprovalModalProps) {
	const [comment, setComment] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleConfirm = async () => {
		setIsSubmitting(true);
		try {
			await onConfirm(comment.trim() || undefined);
			setComment("");
			onClose();
		} catch (error) {
			console.error("承認エラー:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleClose = () => {
		if (!isSubmitting) {
			setComment("");
			onClose();
		}
	};

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<div className="flex items-center gap-2">
						<CheckCircle2 className="h-6 w-6 text-green-600" />
						<DialogTitle>申請を承認</DialogTitle>
					</div>
					<DialogDescription>
						{applicantName}さんの在宅勤務申請を承認しますか？
					</DialogDescription>
				</DialogHeader>

				<div className="grid gap-4 py-4">
					<div className="grid gap-2">
						<Label htmlFor="approval-comment">
							コメント <span className="text-muted-foreground">(任意)</span>
						</Label>
						<Textarea
							id="approval-comment"
							placeholder="承認コメントを入力してください（任意）"
							value={comment}
							onChange={(e) => setComment(e.target.value)}
							rows={4}
							disabled={isSubmitting}
							className="resize-none"
						/>
						<p className="text-xs text-muted-foreground">
							コメントは任意です。必要に応じて承認理由や注意事項を記入できます。
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
						disabled={isSubmitting}
						className="bg-green-600 hover:bg-green-700"
					>
						{isSubmitting ? "承認中..." : "承認する"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
