import type { Role } from "@prisma/client";

export function dashboardPathForRole(role: Role): string {
  switch (role) {
    case "PLATFORM_ADMIN":
      return "/admin";
    case "TUTOR":
      return "/dashboard";
    case "STUDENT":
      return "/me";
    case "PARENT":
      return "/parent";
    default:
      return "/login";
  }
}
