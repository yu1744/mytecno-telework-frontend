"use client";

import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User } from "../types/user";
import { UpdateUserParams } from "../lib/api";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
	DialogClose,
	DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z
	.object({
		password: z.string().min(6, "パスワードは6文字以上で入力してください。"),
		password_confirmation: z.string().min(1, "確認用パスワードを入力してください。"),
	})
	.refine((data) => data.password === data.password_confirmation, {
		message: "パスワードが一致しません。",
		path: ["password_confirmation"],
	});

type FormData = z.infer<typeof schema>;

interface Props {
	open: boolean;
	onClose: () => void;
	user: User | null;
	onUpdate: (user: UpdateUserParams) => void;
}

const EditProfileModal: React.FC<Props> = ({
	open,
	onClose,
	user,
	onUpdate,
}) => {
	const {
		control,
		handleSubmit,
		formState: { errors },
		reset,
	} = useForm<FormData>({
		resolver: zodResolver(schema),
		defaultValues: {
			password: "",
			password_confirmation: "",
		},
	});

	useEffect(() => {
		if (open) {
			reset({
				password: "",
				password_confirmation: "",
			});
		}
	}, [open, reset]);

	const handleClose = () => {
		reset();
		onClose();
	};

	const onSubmit = (data: FormData) => {
		if (!user) return;
		const updateData: Omit<UpdateUserParams, "id"> = {
			password: data.password,
			password_confirmation: data.password_confirmation,
		};
		onUpdate({ ...updateData, id: user.id });
		handleClose();
	};

	return (
		<Dialog
			open={open}
			onOpenChange={(isOpen: boolean) => !isOpen && handleClose()}
		>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>パスワード変更</DialogTitle>
					<DialogDescription>
						新しいパスワードを入力してください。
					</DialogDescription>
				</DialogHeader>

				{/* 読み取り専用のユーザー情報 */}
				<div className="py-4 border-b mb-4">
					<p className="text-sm text-muted-foreground mb-2">アカウント情報</p>
					<div className="grid grid-cols-4 gap-2 text-sm">
						<span className="text-muted-foreground">名前:</span>
						<span className="col-span-3">{user?.name}</span>
						<span className="text-muted-foreground">メール:</span>
						<span className="col-span-3">{user?.email}</span>
						<span className="text-muted-foreground">部署:</span>
						<span className="col-span-3">{user?.department?.name || "-"}</span>
					</div>
				</div>

				<form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
					<div className="grid grid-cols-4 items-center gap-4">
						<Label htmlFor="password" className="text-right whitespace-nowrap">
							新しいパスワード
						</Label>
						<Controller
							name="password"
							control={control}
							render={({ field }) => (
								<Input
									id="password"
									type="password"
									{...field}
									className="col-span-3"
									placeholder="6文字以上で入力"
								/>
							)}
						/>
						{errors.password && (
							<p className="col-span-4 text-red-500 text-sm text-right">
								{errors.password.message}
							</p>
						)}
					</div>
					<div className="grid grid-cols-4 items-center gap-4">
						<Label
							htmlFor="password_confirmation"
							className="text-right whitespace-nowrap"
						>
							パスワード(確認)
						</Label>
						<Controller
							name="password_confirmation"
							control={control}
							render={({ field }) => (
								<Input
									id="password_confirmation"
									type="password"
									{...field}
									className="col-span-3"
									placeholder="もう一度入力"
								/>
							)}
						/>
						{errors.password_confirmation && (
							<p className="col-span-4 text-red-500 text-sm text-right">
								{errors.password_confirmation.message}
							</p>
						)}
					</div>
					<DialogFooter>
						<DialogClose asChild>
							<Button type="button" variant="secondary">
								キャンセル
							</Button>
						</DialogClose>
						<Button type="submit">パスワードを変更</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};

export default EditProfileModal;
