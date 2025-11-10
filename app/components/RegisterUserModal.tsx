"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Role, Department } from "../types/user";
import { CreateUserParams } from "../lib/api";
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const schema = z
	.object({
		email: z.string().email("有効なメールアドレスを入力してください。"),
		name: z.string().min(1, "名前は必須です。"),
		employee_number: z.string().min(1, "社員番号は必須です。"),
		hired_date: z.string().min(1, "入社日は必須です。"),
		password: z.string().min(8, "パスワードは8文字以上で入力してください。"),
		password_confirmation: z
			.string()
			.min(8, "パスワード（確認）は8文字以上で入力してください。"),
		department_id: z.string().min(1, "所属部署を選択してください。"),
		role_id: z.string().min(1, "権限を選択してください。"),
	})
	.refine((data) => data.password === data.password_confirmation, {
		message: "パスワードが一致しません。",
		path: ["password_confirmation"],
	});

type FormData = z.infer<typeof schema>;

interface Props {
	open: boolean;
	onClose: () => void;
	roles: Role[];
	departments: Department[];
	onRegister: (user: CreateUserParams) => void;
}

const RegisterUserModal: React.FC<Props> = ({
	open,
	onClose,
	roles,
	departments,
	onRegister,
}) => {
	const {
		control,
		handleSubmit,
		formState: { errors },
		reset,
	} = useForm<FormData>({
		resolver: zodResolver(schema),
		defaultValues: {
			email: "",
			name: "",
			employee_number: "",
			hired_date: "",
			password: "",
			password_confirmation: "",
			department_id: "",
			role_id: "",
		},
	});

	const handleClose = () => {
		reset();
		onClose();
	};

	const onSubmit = (data: FormData) => {
		const userData = {
			...data,
			department_id: parseInt(data.department_id, 10),
			role_id: parseInt(data.role_id, 10),
		};
		onRegister(userData);
		handleClose();
	};

	return (
		<Dialog
			open={open}
			onOpenChange={(isOpen: boolean) => !isOpen && handleClose()}
		>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>新規ユーザー登録</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
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
						<Label htmlFor="employee_number" className="text-right">
							社員番号
						</Label>
						<Controller
							name="employee_number"
							control={control}
							render={({ field }) => (
								<Input id="employee_number" {...field} className="col-span-3" />
							)}
						/>
						{errors.employee_number && (
							<p className="col-span-4 text-red-500 text-sm text-right">
								{errors.employee_number.message}
							</p>
						)}
					</div>
					<div className="grid grid-cols-4 items-center gap-4">
						<Label htmlFor="hired_date" className="text-right">
							入社日
						</Label>
						<Controller
							name="hired_date"
							control={control}
							render={({ field }) => (
								<Input
									id="hired_date"
									type="date"
									{...field}
									className="col-span-3"
								/>
							)}
						/>
						{errors.hired_date && (
							<p className="col-span-4 text-red-500 text-sm text-right">
								{errors.hired_date.message}
							</p>
						)}
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
								/>
							)}
						/>
						{errors.password_confirmation && (
							<p className="col-span-4 text-red-500 text-sm text-right">
								{errors.password_confirmation.message}
							</p>
						)}
					</div>
					<div className="grid grid-cols-4 items-center gap-4">
						<Label htmlFor="department_id" className="text-right">
							所属部署
						</Label>
						<Controller
							name="department_id"
							control={control}
							render={({ field }) => (
								<Select
									onValueChange={field.onChange}
									defaultValue={field.value}
								>
									<SelectTrigger className="col-span-3">
										<SelectValue placeholder="選択してください" />
									</SelectTrigger>
									<SelectContent>
										{departments.map((department) => (
											<SelectItem
												key={department.id}
												value={String(department.id)}
											>
												{department.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							)}
						/>
						{errors.department_id && (
							<p className="col-span-4 text-red-500 text-sm text-right">
								{errors.department_id.message}
							</p>
						)}
					</div>
					<div className="grid grid-cols-4 items-center gap-4">
						<Label htmlFor="role_id" className="text-right">
							権限
						</Label>
						<Controller
							name="role_id"
							control={control}
							render={({ field }) => (
								<Select
									onValueChange={field.onChange}
									defaultValue={field.value}
								>
									<SelectTrigger className="col-span-3">
										<SelectValue placeholder="選択してください" />
									</SelectTrigger>
									<SelectContent>
										{roles.map((role) => (
											<SelectItem key={role.id} value={String(role.id)}>
												{role.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							)}
						/>
						{errors.role_id && (
							<p className="col-span-4 text-red-500 text-sm text-right">
								{errors.role_id.message}
							</p>
						)}
					</div>
					<DialogFooter>
						<DialogClose asChild>
							<Button type="button" variant="secondary">
								キャンセル
							</Button>
						</DialogClose>
						<Button type="submit">登録</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};

export default RegisterUserModal;