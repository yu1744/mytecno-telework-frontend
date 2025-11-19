"use client";
import React from "react";
import ApplicationForm from "../components/ApplicationForm";
import PrivateRoute from "../components/PrivateRoute";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ApplyPage = () => {
	return (
		<PrivateRoute allowedRoles={["admin", "approver", "applicant", "user"]}>
			<div className="p-6">
				<h1 className="text-2xl font-bold mb-4">在宅勤務申請</h1>
				<ApplicationForm />
			</div>
		</PrivateRoute>
	);
};

export default ApplyPage;
