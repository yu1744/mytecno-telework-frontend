import React from "react";
import { Modal, Box, Typography, Button } from "@mui/material";
import { User } from "../types/user";

interface Props {
	open: boolean;
	onClose: () => void;
	user: User | null;
	onDelete: () => void;
}

const DeleteUserModal: React.FC<Props> = ({ open, onClose, user, onDelete }) => {
	if (!user) return null;

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
					ユーザー削除の確認
				</Typography>
				<Typography sx={{ mt: 2 }}>
					{user.name}さんを本当に削除しますか？
				</Typography>
				<Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
					<Button onClick={onClose}>キャンセル</Button>
					<Button
						variant="contained"
						color="error"
						onClick={onDelete}
						sx={{ ml: 1 }}
					>
						削除する
					</Button>
				</Box>
			</Box>
		</Modal>
	);
};

export default DeleteUserModal;