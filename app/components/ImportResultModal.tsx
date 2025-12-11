import React from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle } from "lucide-react";

interface ImportResultModalProps {
	open: boolean;
	onClose: () => void;
	result: {
		successCount: number;
		errors: string[];
	} | null;
}

const ImportResultModal: React.FC<ImportResultModalProps> = ({
	open,
	onClose,
	result,
}) => {
	if (!result) return null;

	const hasErrors = result.errors.length > 0;

	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>インポート結果</DialogTitle>
				</DialogHeader>
				<div className="py-4">
					<div className="flex items-center gap-2 mb-4">
						<CheckCircle className="text-green-500 h-6 w-6" />
						<span className="text-lg font-medium">
							{result.successCount}件 登録成功
						</span>
					</div>

					{hasErrors && (
						<div className="mt-4">
							<div className="flex items-center gap-2 mb-2 text-red-600">
								<AlertCircle className="h-5 w-5" />
								<span className="font-medium">エラー ({result.errors.length}件)</span>
							</div>
							<div className="h-[200px] w-full rounded-md border p-4 bg-red-50 overflow-y-auto">
								<ul className="space-y-2">
									{result.errors.map((error, index) => (
										<li key={index} className="text-sm text-red-700">
											{error}
										</li>
									))}
								</ul>
							</div>
						</div>
					)}
				</div>
				<DialogFooter>
					<Button onClick={onClose}>閉じる</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default ImportResultModal;
