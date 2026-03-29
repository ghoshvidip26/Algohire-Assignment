import { getUserById, getUserZoneIds } from "../repositories/user.repo";

export async function getAccessScope(userId: string) {
  const user = await getUserById(userId);
  const zoneIds = user.role === "supervisor" ? [] : await getUserZoneIds(userId);

  return {
    user,
    isSupervisor: user.role === "supervisor",
    zoneIds,
  };
}

export async function assertHasAssignedZones(userId: string) {
  const scope = await getAccessScope(userId);

  if (!scope.isSupervisor && scope.zoneIds.length === 0) {
    throw new Error("User has no assigned zones");
  }

  return scope;
}
