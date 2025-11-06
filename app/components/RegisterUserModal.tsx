import React from "react";
import {
	Modal,
	Box,
	Typography,
	TextField,
	Button,
	Select,
	MenuItem,
	FormControl,
	InputLabel,
	FormHelperText,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Role, Department } from "../types/user";
import { CreateUserParams } from "../lib/api";

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
		department_id: z.number().min(1, "所属部署を選択してください。"),
		role_id: z.number().min(1, "権限を選択してください。"),
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
			department_id: 0,
			role_id: 0,
		},
	});

	const handleClose = () => {
		reset();
		onClose();
	};

	const onSubmit = (data: FormData) => {
		onRegister(data);
		handleClose();
	};

	return (
		<Modal open={open} onClose={handleClose}>
			<Box
				sx={{
					position: "absolute",
					top: "50%",
					left: "50%",
					transform: "translate(-50%, -50%)",
					width: 400,
					bgcolor: "background.paper",
					border: "2px solid #000",
					boxShadow: 24,
					p: 4,
				}}
			>
				<Typography variant="h6" component="h2">
					新規ユーザー登録
				</Typography>
				<Box
					component="form"
					sx={{ mt: 2 }}
					onSubmit={handleSubmit(onSubmit)}
					noValidate
				>
					<Controller
						name="email"
						control={control}
						render={({ field }) => (
							<TextField
								{...field}
								fullWidth
								label="メールアドレス"
								margin="normal"
								type="email"
								required
								error={!!errors.email}
								helperText={errors.email?.message}
							/>
						)}
					/>
					<Controller
						name="name"
						control={control}
						render={({ field }) => (
							<TextField
								{...field}
								fullWidth
								label="名前"
								margin="normal"
								type="text"
								required
								error={!!errors.name}
								helperText={errors.name?.message}
							/>
						)}
					/>
					<Controller
						name="employee_number"
						control={control}
						render={({ field }) => (
							<TextField
								{...field}
								fullWidth
								label="社員番号"
								margin="normal"
								type="text"
								required
								error={!!errors.employee_number}
								helperText={errors.employee_number?.message}
							/>
						)}
					/>
					<Controller
						name="hired_date"
						control={control}
						render={({ field }) => (
							<TextField
								{...field}
								fullWidth
								label="入社日"
								margin="normal"
								type="date"
								required
								error={!!errors.hired_date}
								helperText={errors.hired_date?.message}
								InputLabelProps={{ shrink: true }}
							/>
						)}
					/>
					<Controller
						name="password"
						control={control}
						render={({ field }) => (
							<TextField
								{...field}
								fullWidth
								label="パスワード"
								margin="normal"
								type="password"
								required
								error={!!errors.password}
								helperText={errors.password?.message}
							/>
						)}
					/>
					<Controller
						name="password_confirmation"
						control={control}
						render={({ field }) => (
							<TextField
								{...field}
								fullWidth
								label="パスワード（確認）"
								margin="normal"
								type="password"
								required
								error={!!errors.password_confirmation}
								helperText={errors.password_confirmation?.message}
							/>
						)}
					/>
					<FormControl fullWidth margin="normal" error={!!errors.department_id}>
						<InputLabel id="department-select-label">所属部署</InputLabel>
						<Controller
							name="department_id"
							control={control}
							render={({ field }) => (
								<Select
									{...field}
									labelId="department-select-label"
									label="所属部署"
									required
								>
									<MenuItem value={0} disabled>
										選択してください
									</MenuItem>
									{departments.map((department) => (
										<MenuItem key={department.id} value={department.id}>
											{department.name}
										</MenuItem>
									))}
								</Select>
							)}
						/>
						{errors.department_id && (
							<FormHelperText>{errors.department_id.message}</FormHelperText>
						)}
					</FormControl>
					<FormControl fullWidth margin="normal" error={!!errors.role_id}>
						<InputLabel id="role-select-label">権限</InputLabel>
						<Controller
							name="role_id"
							control={control}
							render={({ field }) => (
								<Select
									{...field}
									labelId="role-select-label"
									label="権限"
									required
								>
									<MenuItem value={0} disabled>
										選択してください
									</MenuItem>
									{roles.map((role) => (
										<MenuItem key={role.id} value={role.id}>
											{role.name}
										</MenuItem>
									))}
								</Select>
							)}
						/>
						{errors.role_id && (
							<FormHelperText>{errors.role_id.message}</FormHelperText>
						)}
					</FormControl>
					<Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
						<Button onClick={handleClose}>キャンセル</Button>
						<Button
							variant="contained"
							color="primary"
							type="submit"
							sx={{ ml: 1 }}
						>
							登録
						</Button>
					</Box>
				</Box>
			</Box>
		</Modal>
	);
};

export default RegisterUserModal;