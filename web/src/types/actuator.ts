/**
 * 액츄에이터 타입 정의
 */

export type ActuatorType = 'led' | 'pump' | 'fan1' | 'fan2';

export type ActuatorAction = 'on' | 'off' | 'set';

export interface ActuatorControl {
  id: number;
  actuator_type: ActuatorType;
  action: ActuatorAction;
  value: number | null;
  created_at: string;
  user_id: string | null;
}

export interface ActuatorControlInsert {
  actuator_type: ActuatorType;
  action: ActuatorAction;
  value?: number | null;
  user_id?: string | null;
}

export interface ActuatorState {
  led: {
    enabled: boolean;
    brightness: number;
  };
  pump: {
    enabled: boolean;
  };
  fan1: {
    enabled: boolean;
  };
  fan2: {
    enabled: boolean;
  };
}

export interface ActuatorControlCommand {
  actuator_type: ActuatorType;
  action: ActuatorAction;
  value?: number;
}
