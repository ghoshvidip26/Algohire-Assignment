import { processBatch, startPatternAbsenceMonitor } from "../jobs/queue";
import { saveReadings, type SensorReading } from "../services/monitoring-store";
import { readingRepo } from "../repositories/reading.repo";
import { startEscalationWorker } from "../workers/escalation.worker";

type IngestRequest = {
  body: SensorReading[];
};

type IngestResponse = {
  status: (code: number) => {
    send: (payload: { success: boolean; accepted?: number }) => void;
  };
};

export async function ingestReadings(req: IngestRequest, res: IngestResponse) {
  const readings = req.body;

  await readingRepo.insertMany(readings);
  await saveReadings(readings);
  processBatch(readings);
  startPatternAbsenceMonitor();
  startEscalationWorker();

  res.status(200).send({ success: true, accepted: readings.length });
}
