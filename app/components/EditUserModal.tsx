"use client";

import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, Role, Department, Group } from "../types/user";
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

const schema = z
	.object({
		name: z.string().min(1, "名前は必須です。"),
		email: z.string().email("有効なメールアドレスを入力してください。"),
		employee_number: z.string().min(1, "社員番号は必須です。"),
		address: z.string().optional(),
		phone_number: z.string().optional(),
		password: z.string().optional(),
		password_confirmation: z.string().optional(),
		department_id: z.string().min(1, "所属部署を選択してください。"),
		role_id: z.string().min(1, "権限を選択してください。"),
		group_id: z.string().optional(),
		position: z.string().optional(),
		manager_id: z.string().optional(),
	})
	.refine((data) => {
		if (data.password) {
			return data.password === data.password_confirmation;
		}
		return true;
	}, {
		message: "パスワードが一致しません。",
		path: ["password_confirmation"],
	});

type FormData = z.infer<typeof schema>;

interface Props {
	open: boolean;
	onClose: () => void;
	user: User | null;
	users: User[];
	roles: Role[];
	departments: Department[];
	groups: Group[];
	onUpdate: (user: UpdateUserParams) => void;
}

const EditUserModal: React.FC<Props> = ({
	open,
	onClose,
	user,
	users,
	roles,
	departments,
	groups,
	onUpdate,
}) => {
	const {
		control,
		handleSubmit,
		formState: { errors },
		reset,
	} = useForm<FormData>({
		resolver: zodResolver(schema),
	});

	useEffect(() => {
		if (user) {
			reset({
				name: user.name,
				email: user.email,
				employee_number: user.employee_number,
				address: user.address || "",
				phone_number: user.phone_number || "",
				department_id: String(user.department_id),
				role_id: String(user.role_id),
				group_id: user.group_id ? String(user.group_id) : "",
				position: user.position || "",
				manager_id: user.manager_id ? String(user.manager_id) : "",
			});
		}
	}, [user, reset]);

	const handleClose = () => {
		reset();
		onClose();
	};

	const onSubmit = (data: FormData) => {
		if (!user) return;
		const { password, password_confirmation, ...restData } = data;
		const updateData: Omit<UpdateUserParams, "id"> = {
			...restData,
			department_id: parseInt(data.department_id, 10),
			role_id: parseInt(data.role_id, 10),
			group_id: data.group_id ? parseInt(data.group_id, 10) : undefined,
			manager_id: data.manager_id ? parseInt(data.manager_id, 10) : undefined,
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
					<DialogTitle>ユーザー情報編集</DialogTitle>
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
						<Label htmlFor="department_id" className="text-right">
							所属部署
						</Label>
						<Controller
							name="department_id"
							control={control}
							render={({ field }) => (
								<Select
									onValueChange={field.onChange}
									value={field.value}
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
						<Label htmlFor="group_id" className="text-right">
							グループ
						</Label>
						<Controller
							name="group_id"
							control={control}
							render={({ field }) => (
								<Select
									onValueChange={field.onChange}
									value={field.value}
								>
									<SelectTrigger className="col-span-3">
										<SelectValue placeholder="選択してください" />
									</SelectTrigger>
									<SelectContent>
										{groups
											.map((group) => (
												<SelectItem key={group.id} value={String(group.id)}>
													{group.name}
												</SelectItem>
											))}
									</SelectContent>
								</Select>
							)}
						/>
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
									value={field.value}
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
					<div className="grid grid-cols-4 items-center gap-4">
						<Label htmlFor="position" className="text-right">
							役職
						</Label>
						<Controller
							name="position"
							control={control}
							render={({ field }) => (
								<Input id="position" {...field} className="col-span-3" />
							)}
						/>
					</div>
					<div className="grid grid-cols-4 items-center gap-4">
						<Label htmlFor="manager_id" className="text-right">
							上長
						</Label>
						<Controller
							name="manager_id"
							control={control}
							render={({ field }) => (
								<Select
									onValueChange={field.onChange}
									value={field.value}
								>
									<SelectTrigger className="col-span-3">
										<SelectValue placeholder="選択してください" />
									</SelectTrigger>
									<SelectContent>
										{users.map((u) => (
											<SelectItem key={u.id} value={String(u.id)}>
												{u.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
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

export default EditUserModal;