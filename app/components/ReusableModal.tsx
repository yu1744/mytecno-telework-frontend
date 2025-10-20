import React from "react";
import { Modal, Box, Typography, Button } from "@mui/material";

interface Props {
	open: boolean;
	onClose: () => void;
	title: string;
	content: React.ReactNode;
	actions: {
		text: string;
		onClick: () => void;
		color?: "inherit" | "primary" | "secondary" | "success" | "error" | "info" | "warning";
		variant?: "text" | "outlined" | "contained";
	}[];
}

const ReusableModal: React.FC<Props> = ({ open, onClose, title, content, actions }) => {
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
					{title}
				</Typography>
				<Typography component="div" sx={{ mt: 2 }}>{content}</Typography>
				<Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
					{actions.map((action, index) => (
						<Button
							key={index}
							variant={action.variant || "contained"}
							color={action.color || "primary"}
							onClick={action.onClick}
							sx={{ ml: 1 }}
						>
							{action.text}
						</Button>
					))}
				</Box>
			</Box>
		</Modal>
	);
};

export default ReusableModal;