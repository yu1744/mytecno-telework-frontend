"use client";

import React, { useState } from "react";
import {
	Container,
	Box,
	TextField,
	Button,
	Typography,
	Card,
} from "@mui/material";
import { useRouter } from "next/navigation";
import api from "@/app/lib/api";
import { useAuthStore } from "@/app/store/auth";
import Cookies from "js-cookie";

const LoginPage = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const setAuth = useAuthStore((state) => state.setAuth);
	const router = useRouter();

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setError("");
		try {
			const response = await api.post("/auth/sign_in", {
				email,
				password,
			});

			const user = response.data.data;
			const headers = response.headers;
			const authHeaders = {
				"access-token": headers["access-token"] as string,
				client: headers["client"] as string,
				uid: headers["uid"] as string,
			};

			setAuth(user, authHeaders);

			Cookies.set("access-token", authHeaders["access-token"]);
			Cookies.set("client", authHeaders["client"]);
			Cookies.set("uid", authHeaders["uid"]);

			const roleName = user.role?.name;
			switch (roleName) {
				case "admin":
					router.push("/admin");
					break;
				case "approver":
					router.push("/approvals");
					break;
				case "applicant":
					router.push("/dashboard");
					break;
				default:
					router.push("/dashboard");
					break;
			}
		} catch (error) {
			console.error("Login failed:", error);
			setError("メールアドレスまたはパスワードが正しくありません。");
		}
	};

	return (
		<Container component="main" maxWidth="xs">
			<Card
				sx={{
					mt: 8,
					p: 4,
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					boxShadow: 3,
				}}
			>
				<Typography component="h1" variant="h5" sx={{ mb: 2 }}>
					在宅勤務申請システム
				</Typography>
				<Typography component="h2" variant="h6">
					ログイン
				</Typography>
				{error && (
					<Typography color="error" sx={{ mt: 2 }}>
						{error}
					</Typography>
				)}
				<Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
					<TextField
						margin="normal"
						required
						fullWidth
						id="email"
						label="メールアドレス"
						name="email"
						autoComplete="email"
						autoFocus
						value={email}
						onChange={(e) => setEmail(e.target.value)}
					/>
					<TextField
						margin="normal"
						required
						fullWidth
						name="password"
						label="パスワード"
						type="password"
						id="password"
						autoComplete="current-password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
					/>
					<Button
						type="submit"
						fullWidth
						variant="contained"
						color="primary"
						sx={{ mt: 3, mb: 2 }}
					>
						ログイン
					</Button>
				</Box>
			</Card>
		</Container>
	);
};

export default LoginPage;
