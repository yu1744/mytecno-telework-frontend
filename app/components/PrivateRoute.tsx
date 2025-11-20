"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/app/store/auth";

interface PrivateRouteProps {
	children: React.ReactNode;
	allowedRoles?: string[];
}

const PrivateRoute = ({ children, allowedRoles }: PrivateRouteProps) => {
	const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
	const user = useAuthStore((state) => state.user);
	const router = useRouter();
	const [isMounted, setIsMounted] = useState(false);

	useEffect(() => {
		setIsMounted(true);
	}, []);

	const userRole = user?.role?.name;
	const effectiveRole = userRole === "user" ? "applicant" : userRole;

	useEffect(() => {
		if (isMounted) {
			if (!isAuthenticated) {
				router.push("/login");
			} else if (
				allowedRoles &&
				effectiveRole &&
				!allowedRoles.includes(effectiveRole)
			) {
				router.push("/dashboard");
			}
		}
	}, [isMounted, isAuthenticated, effectiveRole, allowedRoles, router]);

	if (!isMounted || !isAuthenticated) {
		return null;
	}

	if (allowedRoles && effectiveRole && !allowedRoles.includes(effectiveRole)) {
		return null;
	}

	return <>{children}</>;
};

export default PrivateRoute;
