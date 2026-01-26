"use client";
import React from "react";
import ApplicationForm from "../components/ApplicationForm";
import PrivateRoute from "../components/PrivateRoute";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ApplyPage = () => {
	return (
		<PrivateRoute allowedRoles={["admin", "approver", "applicant", "user"]}>
			<div className="max-w-7xl mx-auto p-4 md:p-8">
				<div className="flex items-center mb-8 border-b pb-4">
					<h1 className="text-3xl font-extrabold tracking-tight">在宅勤務申請</h1>
				</div>
				<ApplicationForm />
			</div>
		</PrivateRoute>
	);
};

export default ApplyPage;
