import React from "react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

type ButtonVariant = "link" | "default" | "destructive" | "outline" | "secondary" | "ghost" | null | undefined;

interface Props {
	open: boolean;
	onClose: () => void;
	title: string;
	content: React.ReactNode;
	actions: {
		text: string;
		onClick: () => void;
		variant?: ButtonVariant;
	}[];
}

const ReusableModal: React.FC<Props> = ({ open, onClose, title, content, actions }) => {
	if (!open) return null;

	return (
		<AlertDialog open={open} onOpenChange={onClose}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>{title}</AlertDialogTitle>
					<AlertDialogDescription>
						<div>{content}</div>
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					{actions.map((action, index) => {
						const isCancel = action.variant === "ghost" || action.text === "キャンセル";
						if (isCancel) {
							return (
								<AlertDialogCancel key={index} onClick={action.onClick} asChild>
									<Button variant={action.variant}>{action.text}</Button>
								</AlertDialogCancel>
							);
						}
						return (
							<AlertDialogAction key={index} onClick={action.onClick} asChild>
								<Button variant={action.variant}>{action.text}</Button>
							</AlertDialogAction>
						);
					})}
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};

export default ReusableModal;