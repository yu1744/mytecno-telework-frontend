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
} from "@mui/material";
import { Role, Department } from "../types/user";

interface Props {
	open: boolean;
	onClose: () => void;
	roles: Role[];
	departments: Department[];
}

const RegisterUserModal: React.FC<Props> = ({
	open,
	onClose,
	roles,
	departments,
}) => {
	return (
		<Modal open={open} onClose={onClose}>
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
				<Box component="form" sx={{ mt: 2 }}>
					<TextField
						fullWidth
						label="氏名"
						margin="normal"
						name="name"
						required
					/>
					<TextField
						fullWidth
						label="メールアドレス"
						margin="normal"
						name="email"
						type="email"
						required
					/>
					<FormControl fullWidth margin="normal">
						<InputLabel id="department-select-label">所属部署</InputLabel>
						<Select
							labelId="department-select-label"
							id="department-select"
							label="所属部署"
							name="department_id"
							defaultValue=""
						>
							{departments.map((department) => (
								<MenuItem key={department.id} value={department.id}>
									{department.name}
								</MenuItem>
							))}
						</Select>
					</FormControl>
					<FormControl fullWidth margin="normal">
						<InputLabel id="role-select-label">権限</InputLabel>
						<Select
							labelId="role-select-label"
							id="role-select"
							label="権限"
							name="role_id"
							defaultValue=""
						>
							{roles.map((role) => (
								<MenuItem key={role.id} value={role.id}>
									{role.name}
								</MenuItem>
							))}
						</Select>
					</FormControl>
					<Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
						<Button onClick={onClose}>キャンセル</Button>
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