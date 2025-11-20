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
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z
	.object({
		name: z.string().min(1, "名前は必須です。"),
		email: z.string().email("有効なメールアドレスを入力してください。"),
		address: z.string().optional(),
		phone_number: z.string().optional(),
		password: z.string().optional(),
		password_confirmation: z.string().optional(),
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
			name: "",
			email: "",
			address: "",
			phone_number: "",
			password: "",
			password_confirmation: "",
		},
	});

	useEffect(() => {
		if (user) {
			reset({
				name: user.name,
				email: user.email,
				address: user.address || "",
				phone_number: user.phone_number || "",
			});
		}
	}, [user, reset]);

	const handleClose = () => {
		reset();
		onClose();
	};

	const onSubmit = (data: FormData) => {
		if (!user) return;
		const { name, email, address, phone_number, password, password_confirmation } = data;
		const updateData: Omit<UpdateUserParams, "id"> = {
			name,
			email,
			address,
			phone_number,
		};
		if (password) {
			updateData.password = password;
			updateData.password_confirmation = password_confirmation;
		}
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
					<DialogTitle>プロフィール編集</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
					<div className="grid grid-cols-4 items-center gap-4">
						<Label htmlFor="name" className="text-right">
							名前
						</Label>
						<Controller
							name="name"
							control={control}
							render={({ field }) => (
								<Input id="name" {...field} className="col-span-3" />
							)}
						/>
						{errors.name && (
							<p className="col-span-4 text-red-500 text-sm text-right">
								{errors.name.message}
							</p>
						)}
					</div>
					<div className="grid grid-cols-4 items-center gap-4">
						<Label htmlFor="email" className="text-right">
							メールアドレス
						</Label>
						<Controller
							name="email"
							control={control}
							render={({ field }) => (
								<Input id="email" {...field} className="col-span-3" />
							)}
						/>
						{errors.email && (
							<p className="col-span-4 text-red-500 text-sm text-right">
								{errors.email.message}
							</p>
						)}
					</div>
					<div className="grid grid-cols-4 items-center gap-4">
						<Label htmlFor="address" className="text-right">
							住所
						</Label>
						<Controller
							name="address"
							control={control}
							render={({ field }) => (
								<Input id="address" {...field} className="col-span-3" />
							)}
						/>
					</div>
					<div className="grid grid-cols-4 items-center gap-4">
						<Label htmlFor="phone_number" className="text-right">
							電話番号
						</Label>
						<Controller
							name="phone_number"
							control={control}
							render={({ field }) => (
								<Input id="phone_number" {...field} className="col-span-3" />
							)}
						/>
					</div>
					<div className="grid grid-cols-4 items-center gap-4">
						<Label htmlFor="password" className="text-right whitespace-nowrap">
							パスワード
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
									placeholder="変更する場合のみ入力"
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
									placeholder="変更する場合のみ入力"
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
						<Button type="submit">更新</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};

export default EditProfileModal;