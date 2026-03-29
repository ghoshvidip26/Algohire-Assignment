import { alertRepo, type AlertRecord } from "../repositories/alert.repo";
import { escalationRepo } from "../repositories/escalation.repo";
import { getSupervisor } from "../repositories/user.repo";

let escalationWorker: ReturnType<typeof setInterval> | null = null;

export function startEscalationWorker(intervalMs = 30_000) {
  if (escalationWorker) {
    return escalationWorker;
  }

  escalationWorker = setInterval(() => {
    void runEscalationPass();
  }, intervalMs);

  return escalationWorker;
}

export function stopEscalationWorker() {
  if (!escalationWorker) {
    return;
  }

  clearInterval(escalationWorker);
  escalationWorker = null;
}

export async function runEscalationPass(now = Date.now()) {
  const alerts = await alertRepo.getOpenCriticalAlerts();

  for (const alert of alerts) {
    if (alert.escalated || alert.status !== "open") {
      continue;
    }

    const diff = now - new Date(alert.created_at).getTime();

    if (diff >= 5 * 60 * 1000) {
      await escalateAlert(alert);
    }
  }
}

export async function escalateAlert(alert: AlertRecord) {
  const supervisor = await getSupervisor();

  await alertRepo.update(alert.id, {
    assigned_to: supervisor.id,
    escalated: true,
  });

  await escalationRepo.create({
    alertId: alert.id,
    escalatedTo: supervisor.id,
  });
}
