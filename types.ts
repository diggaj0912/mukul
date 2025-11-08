export interface CareVisionReport {
  summary: string;
  emotion: 'Calm' | 'Happy' | 'Sadness' | 'Fear' | 'Pain' | 'Distress' | 'Neutral';
  motion: 'Normal Activity' | 'Lying Still (Resting)' | 'Sudden Movement (Potential Fall)' | 'No Person Detected';
  alertStatus: 'No Alert' | 'Alert Triggered';
  recommendation: string;
}

export interface EmotionEvent {
  timestamp: string;
  emotion: CareVisionReport['emotion'];
  motion: CareVisionReport['motion'];
  summary: string;
}

export enum AppStatus {
  IDLE = 'IDLE',
  MONITORING = 'MONITORING',
  ERROR = 'ERROR',
}