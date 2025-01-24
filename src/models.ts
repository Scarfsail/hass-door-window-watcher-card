export interface OpenSensorInfo {
    entity_id: string;
    opened_at: string; // ISO datetime string
    remaining_seconds: number;
    adjusted_seconds: number;
    alert_triggered: boolean;
}