import { EdgeRiskEngine, UserBaseline } from '../edge/risk-engine/EdgeRiskEngine';
import { generateSyntheticReading, SCENARIO_PRESETS } from '../edge/sensors/simulatedSensors';

describe('EdgeRiskEngine Unit Tests', () => {
  const sampleBaseline: UserBaseline = {
    userId: 'test-user-01',
    baselineHeartRate: 72,
    baselineSpo2: 98.0,
    baselineSkinTemp: 36.4,
    baselineSystolic: 120,
    baselineDiastolic: 80,
    typicalSleepMinutes: 450,
  };

  test('NORMAL scenario generates LOW overall risk (< 25)', () => {
    const packet = generateSyntheticReading('NORMAL', 'test-user-01');
    const result = EdgeRiskEngine.assessRisk(packet, sampleBaseline);

    expect(result.overallLevel).toBe('LOW');
    expect(result.overallScore).toBeLessThan(25);
    expect(result.isFallSuspected).toBe(false);
    expect(result.recommendations.length).toBeGreaterThan(0);
  });

  test('HEAT_WAVE scenario generates HIGH risk (>= 50)', () => {
    const packet = generateSyntheticReading('HEAT_WAVE', 'test-user-01');
    const result = EdgeRiskEngine.assessRisk(packet, sampleBaseline, 'HEAT_WAVE');

    expect(['HIGH', 'CRITICAL']).toContain(result.overallLevel);
    expect(result.risks.heat).toBeGreaterThanOrEqual(50);
    expect(result.reasons.some((r) => r.includes('Heat Index') || r.includes('Heart rate'))).toBe(true);
  });

  test('AIR_POLLUTION scenario elevates Respiratory Risk', () => {
    const packet = generateSyntheticReading('AIR_POLLUTION', 'test-user-01');
    const result = EdgeRiskEngine.assessRisk(packet, sampleBaseline);

    expect(result.risks.respiratory).toBeGreaterThanOrEqual(50);
    expect(result.reasons.some((r) => r.includes('air quality') || r.includes('SpO₂'))).toBe(true);
  });

  test('FALL scenario triggers immediate fall detection & emergency score >= 90', () => {
    const packet = generateSyntheticReading('FALL', 'test-user-01');
    const result = EdgeRiskEngine.assessRisk(packet, sampleBaseline);

    expect(result.isFallSuspected).toBe(true);
    expect(result.risks.fallEmergency).toBeGreaterThanOrEqual(90);
    expect(result.overallScore).toBeGreaterThanOrEqual(90);
    expect(result.requiresImmediateSos).toBe(true);
  });

  test('Baseline deviation model reflects personal deltas correctly', () => {
    const packet = generateSyntheticReading('NORMAL', 'test-user-01');
    packet.heartRate = 102; // +30 BPM above 72 baseline
    packet.skinTemperature = 37.8; // +1.4°C above 36.4 baseline

    const result = EdgeRiskEngine.assessRisk(packet, sampleBaseline);

    expect(result.baselineDeltas.heartRateDelta).toBe(30);
    expect(result.baselineDeltas.skinTempDelta).toBe(1.4);
    expect(result.reasons.some((r) => r.includes('+30 BPM'))).toBe(true);
  });
});
