"use client";

import React, { useState, useEffect } from "react";
import {
	Container,
	Typography,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	Button,
	IconButton,
	Box,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import api from "@/app/lib/api";
import PrivateRoute from "@/app/components/PrivateRoute";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import EmptyState from "@/app/components/EmptyState";

interface Department {
	id: number;
	name: string;
}

interface Role {
	id: number;
	name: string;
}

interface User {
	id: number;
	name: string;
}

interface PersonnelChangeResponse {
	id: number;
	user: User;
	old_department: Department | null;
	new_department: Department;
	old_role: Role | null;
	new_role: Role;
	effective_date: string;
}

interface PersonnelChange {
	id: number;
	user_name: string;
	old_department: string;
	new_department: string;
	old_role: string;
	new_role: string;
	effective_date: string;
}

const PersonnelChangesPage = () => {
	const [changes, setChanges] = useState<PersonnelChange[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchPersonnelChanges = async () => {
			try {
				setLoading(true);
				const response = await api.get<PersonnelChangeResponse[]>(
					"/admin/user_info_changes"
				);
				const formattedData = response.data.map((item) => ({
					id: item.id,
					user_name: item.user.name,
					old_department: item.old_department?.name || "N/A",
					new_department: item.new_department.name,
					old_role: item.old_role?.name || "N/A",
					new_role: item.new_role.name,
					effective_date: item.effective_date,
				}));
				setChanges(formattedData);
				setError(null);
			} catch (error) {
				setError("データの表示に失敗しました。");
				console.error("Failed to fetch personnel changes:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchPersonnelChanges();
	}, []);

	const handleEdit = (id: number) => {
		// TODO: 編集機能の実装
		console.log(`Edit change with id: ${id}`);
	};

	const handleDelete = async (id: number) => {
		if (window.confirm("この予約を取り消しますか？")) {
			try {
				await api.delete(`/admin/user_info_changes/${id}`);
				setChanges(changes.filter((change) => change.id !== id));
				alert("予約を取り消しました。");
			} catch (error) {
				console.error("Failed to delete personnel change:", error);
				alert("予約の取消に失敗しました。");
			}
		}
	};

	if (loading) {
		return <LoadingSpinner />;
	}

	return (
		<PrivateRoute allowedRoles={["admin"]}>
			<Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
				<Box
					sx={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						mb: 2,
					}}
				>
					<Typography variant="h4" component="h1">
						人事異動の予約・管理
					</Typography>
					<Button variant="contained" color="primary">
						新規予約作成
					</Button>
				</Box>
				{error && <Typography color="error">{error}</Typography>}
				{!error && changes.length === 0 ? (
					<EmptyState message="予約されている人事異動はありません。" />
				) : (
					<TableContainer component={Paper}>
						<Table>
							<TableHead>
								<TableRow>
									<TableCell>対象ユーザー</TableCell>
									<TableCell>変更前</TableCell>
									<TableCell>変更後</TableCell>
									<TableCell>変更反映日</TableCell>
									<TableCell>操作</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{changes.map((change) => (
									<TableRow key={change.id}>
										<TableCell>{change.user_name}</TableCell>
										<TableCell>
											所属: {change.old_department}
											<br />
											権限: {change.old_role}
										</TableCell>
										<TableCell>
											所属: {change.new_department}
											<br />
											権限: {change.new_role}
										</TableCell>
										<TableCell>{change.effective_date}</TableCell>
										<TableCell>
											<IconButton
												onClick={() => handleEdit(change.id)}
												color="primary"
											>
												<EditIcon />
											</IconButton>
											<IconButton
												onClick={() => handleDelete(change.id)}
												color="error"
											>
												<DeleteIcon />
											</IconButton>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</TableContainer>
				)}
			</Container>
		</PrivateRoute>
	);
};

export default PersonnelChangesPage;
