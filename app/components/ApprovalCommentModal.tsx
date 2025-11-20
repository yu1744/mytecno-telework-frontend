import React, { useState, useEffect } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
	DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface ApprovalCommentModalProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: (comment: string, status: "approved" | "rejected") => void;
	applicationId: number | null;
	status: "approved" | "rejected" | null;
	isSubmitting: boolean;
}

const ApprovalCommentModal: React.FC<ApprovalCommentModalProps> = ({
	isOpen,
	onClose,
	onConfirm,
	applicationId,
	status,
	isSubmitting,
}) => {
	const [comment, setComment] = useState("");
	const [error, setError] = useState("");

	useEffect(() => {
		if (isOpen) {
			setComment("");
			setError("");
		}
	}, [isOpen]);

	const handleConfirm = () => {
		// 却下時は必ずコメントが必須
		if (status === "rejected" && !comment.trim()) {
			setError("却下する場合はコメントは必須です。");
			return;
		}
		if (applicationId && status) {
			onConfirm(comment, status);
		}
	};

	const title = status === "approved" ? "承認コメント" : "却下コメント";

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
				</DialogHeader>
				<div className="grid gap-4 py-4">
					<Label htmlFor="comment">コメント</Label>
					<Textarea
						id="comment"
						value={comment}
						onChange={(e) => setComment(e.target.value)}
						placeholder="理由を入力してください"
						className="min-h-[100px]"
					/>
					{error && <p className="text-sm text-red-500">{error}</p>}
				</div>
				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline" disabled={isSubmitting}>
							キャンセル
						</Button>
					</DialogClose>
					<Button onClick={handleConfirm} disabled={isSubmitting}>
						{isSubmitting ? "処理中..." : "送信"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default ApprovalCommentModal;
