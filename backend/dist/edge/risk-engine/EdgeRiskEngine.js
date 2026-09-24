"use strict";
/**
 * HeatGuard-Edge Standalone Edge-AI Risk Engine
 * Zero-dependency TypeScript module capable of running directly on:
 * - Wearable MCU / Edge Gateway (e.g. Qualcomm Dragonwing / ESP32 / Arduino UNO Q)
 * - Browser Client (Offline Mode)
 * - Node.js Backend Server
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EdgeRiskEngine = void 0;
class EdgeRiskEngine {
    /**
     * Helper to map a numeric 0-100 score to standardized prototype risk level
     */
    static getLevel(score) {
        if (score < 25)
            return 'LOW';
        if (score < 50)
            return 'CAUTION';
        if (score < 75)
            return 'HIGH';
        return 'CRITICAL';
    }
    /**
     * Calculate Heat Index (Apparent Temperature in °C) from Ambient Temp & Humidity
     * Based on NOAA Heat Index formulation converted to Celsius
     */
    static calculateHeatIndex(tempC, humidity) {
        if (tempC < 20)
            return tempC;
        const T = tempC;
        const R = humidity;
        const c1 = -8.78469475556;
        const c2 = 1.61139411;
        const c3 = 2.33854883889;
        const c4 = -0.14611605;
        const c5 = -0.012308094;
        const c6 = -0.0164248277778;
        const c7 = 0.002211732;
        const c8 = 0.00072546;
        const c9 = -0.000003582;
        const hi = c1 + c2 * T + c3 * R + c4 * T * R + c5 * T * T + c6 * R * R + c7 * T * T * R + c8 * T * R * R + c9 * T * T * R * R;
        return Math.round(Math.max(tempC, hi) * 10) / 10;
    }
    /**
     * Heat Stress Risk (0 - 100)
     * Considers Heat Index, Skin Temp deviation (+1C delta is huge), HR delta, and exposure time
     */
    static calculateHeatRisk(packet, baseline, heatIndex) {
        let score = 0;
        // Environmental Heat Index contribution (max 40 pts)
        if (heatIndex >= 45)
            score += 40;
        else if (heatIndex >= 40)
            score += 32;
        else if (heatIndex >= 35)
            score += 22;
        else if (heatIndex >= 30)
            score += 12;
        else
            score += 4;
        // Skin Temperature Deviation (max 25 pts)
        const skinDelta = packet.skinTemperature - baseline.baselineSkinTemp;
        if (skinDelta >= 1.8)
            score += 25;
        else if (skinDelta >= 1.2)
            score += 18;
        else if (skinDelta >= 0.6)
            score += 10;
        else if (skinDelta >= 0.2)
            score += 4;
        // Heart Rate Elevation in Heat (max 20 pts)
        const hrDelta = packet.heartRate - baseline.baselineHeartRate;
        if (hrDelta >= 35)
            score += 20;
        else if (hrDelta >= 22)
            score += 14;
        else if (hrDelta >= 12)
            score += 8;
        // Exposure Duration Factor (max 15 pts)
        if (packet.exposureMinutes >= 180)
            score += 15;
        else if (packet.exposureMinutes >= 120)
            score += 10;
        else if (packet.exposureMinutes >= 60)
            score += 5;
        return Math.min(100, Math.max(0, Math.round(score)));
    }
    /**
     * Dehydration Risk (0 - 100)
     * Correlates sustained elevated HR with high heat exposure and active physical workload
     */
    static calculateDehydrationRisk(packet, baseline, heatRiskScore) {
        let score = 0;
        const hrDelta = packet.heartRate - baseline.baselineHeartRate;
        // HR elevation under thermal/activity strain
        if (hrDelta >= 30)
            score += 35;
        else if (hrDelta >= 18)
            score += 22;
        else if (hrDelta >= 8)
            score += 10;
        // Coupled with heat risk
        score += (heatRiskScore / 100) * 35;
        // Exposure & Activity
        if (packet.activityState === 'VIGOROUS' || packet.activityState === 'ACTIVE_WORK') {
            score += 15;
        }
        if (packet.exposureMinutes >= 90)
            score += 15;
        else if (packet.exposureMinutes >= 45)
            score += 8;
        return Math.min(100, Math.max(0, Math.round(score)));
    }
    /**
     * Respiratory Risk (0 - 100)
     * Correlates Air Quality Index (AQI/PM2.5) with SpO2 downward baseline drift
     */
    static calculateRespiratoryRisk(packet, baseline) {
        let score = 0;
        // AQI / PM2.5 Contribution (max 45 pts)
        if (packet.aqi >= 300 || packet.pm25 >= 250)
            score += 45; // Hazardous
        else if (packet.aqi >= 200 || packet.pm25 >= 150)
            score += 35; // Very Unhealthy
        else if (packet.aqi >= 150 || packet.pm25 >= 55)
            score += 25; // Unhealthy
        else if (packet.aqi >= 100 || packet.pm25 >= 35)
            score += 15; // Moderate
        else
            score += 4;
        // SpO2 Deviation from Personal Baseline (max 40 pts)
        const spo2Delta = baseline.baselineSpo2 - packet.spo2; // positive if dropped
        if (packet.spo2 < 90 || spo2Delta >= 6)
            score += 40;
        else if (packet.spo2 < 93 || spo2Delta >= 4)
            score += 30;
        else if (packet.spo2 < 95 || spo2Delta >= 2)
            score += 18;
        else if (spo2Delta >= 1)
            score += 8;
        // Respiratory compensation: elevated HR during poor air
        const hrDelta = packet.heartRate - baseline.baselineHeartRate;
        if (hrDelta >= 20 && packet.aqi > 150)
            score += 15;
        return Math.min(100, Math.max(0, Math.round(score)));
    }
    /**
     * Fatigue Risk (0 - 100)
     * Evaluates sleep duration deficit + high exertion + elevated resting baseline
     */
    static calculateFatigueRisk(packet, baseline) {
        let score = 0;
        const sleepActual = packet.sleepMinutesEstimated ?? baseline.typicalSleepMinutes;
        const sleepDeficitMinutes = Math.max(0, baseline.typicalSleepMinutes - sleepActual);
        // Sleep deficit (max 45 pts)
        if (sleepDeficitMinutes >= 180)
            score += 45; // Missing 3+ hours
        else if (sleepDeficitMinutes >= 120)
            score += 30;
        else if (sleepDeficitMinutes >= 60)
            score += 15;
        // Continuous exposure / exertion (max 30 pts)
        if (packet.exposureMinutes >= 240)
            score += 30;
        else if (packet.exposureMinutes >= 150)
            score += 18;
        else if (packet.exposureMinutes >= 60)
            score += 8;
        // HR elevated despite low activity (sign of cardiovascular fatigue)
        const hrDelta = packet.heartRate - baseline.baselineHeartRate;
        if (hrDelta >= 15 && packet.activityState === 'RESTING') {
            score += 25;
        }
        return Math.min(100, Math.max(0, Math.round(score)));
    }
    /**
     * Cardiovascular Stress Indicator (0 - 100)
     * Evaluates HR deviation, BP variance from baseline, and acute strain
     */
    static calculateCardiovascularStress(packet, baseline) {
        let score = 0;
        const hrDelta = packet.heartRate - baseline.baselineHeartRate;
        const sysDelta = packet.systolic - baseline.baselineSystolic;
        if (packet.heartRate >= 130 || hrDelta >= 45)
            score += 40;
        else if (packet.heartRate >= 110 || hrDelta >= 28)
            score += 28;
        else if (packet.heartRate >= 95 || hrDelta >= 15)
            score += 14;
        if (packet.systolic >= 160 || sysDelta >= 35)
            score += 35;
        else if (packet.systolic >= 140 || sysDelta >= 20)
            score += 22;
        else if (packet.systolic >= 130 || sysDelta >= 10)
            score += 10;
        if (packet.diastolic >= 95)
            score += 15;
        else if (packet.diastolic >= 85)
            score += 8;
        return Math.min(100, Math.max(0, Math.round(score)));
    }
    /**
     * MPU6050 Fall Detection & Sudden Inactivity State Machine (0 - 100)
     */
    static calculateFallRisk(packet) {
        const vectorMag = Math.sqrt(packet.accelX * packet.accelX +
            packet.accelY * packet.accelY +
            packet.accelZ * packet.accelZ);
        const isFallDetected = packet.activityState === 'POSSIBLE_FALL' ||
            (vectorMag > 2.7 && Math.abs(packet.gyroX) + Math.abs(packet.gyroY) > 200);
        if (isFallDetected) {
            return { score: 95, isFall: true };
        }
        if (packet.activityState === 'INACTIVITY' && packet.exposureMinutes > 120) {
            return { score: 55, isFall: false };
        }
        return { score: 0, isFall: false };
    }
    /**
     * Main Comprehensive Edge Risk Evaluator
     */
    static assessRisk(packet, baseline, disasterContext = 'NONE', engineLocation = 'EDGE_DEVICE_LOCAL') {
        const heatIndex = this.calculateHeatIndex(packet.ambientTemperature, packet.humidity);
        const heatRisk = this.calculateHeatRisk(packet, baseline, heatIndex);
        const dehydrationRisk = this.calculateDehydrationRisk(packet, baseline, heatRisk);
        const respiratoryRisk = this.calculateRespiratoryRisk(packet, baseline);
        const fatigueRisk = this.calculateFatigueRisk(packet, baseline);
        const cardiovascularRisk = this.calculateCardiovascularStress(packet, baseline);
        const fallAssessment = this.calculateFallRisk(packet);
        // Baseline deviations
        const hrDelta = packet.heartRate - baseline.baselineHeartRate;
        const spo2Delta = packet.spo2 - baseline.baselineSpo2;
        const skinDelta = Math.round((packet.skinTemperature - baseline.baselineSkinTemp) * 10) / 10;
        const sysDelta = packet.systolic - baseline.baselineSystolic;
        const diaDelta = packet.diastolic - baseline.baselineDiastolic;
        // Overall Weighted Risk Score
        let composite = heatRisk * 0.28 +
            dehydrationRisk * 0.22 +
            respiratoryRisk * 0.20 +
            cardiovascularRisk * 0.18 +
            fatigueRisk * 0.12;
        // Immediate emergency override if fall or critical multi-system failure
        if (fallAssessment.isFall) {
            composite = Math.max(composite, 95);
        }
        if (packet.spo2 < 88 || packet.heartRate > 150) {
            composite = Math.max(composite, 85);
        }
        const overallScore = Math.min(100, Math.max(0, Math.round(composite)));
        const overallLevel = this.getLevel(overallScore);
        // Explainable AI: Dynamic Reason Generator
        const reasons = [];
        if (hrDelta >= 15) {
            reasons.push(`Heart rate elevated by +${hrDelta} BPM above your personal baseline (${baseline.baselineHeartRate} BPM).`);
        }
        if (skinDelta >= 0.6) {
            reasons.push(`Skin temperature is +${skinDelta}°C above your calibrated baseline (${baseline.baselineSkinTemp}°C).`);
        }
        if (heatIndex >= 38) {
            reasons.push(`Extreme environmental Heat Index of ${heatIndex}°C (Ambient ${packet.ambientTemperature}°C at ${packet.humidity}% humidity).`);
        }
        else if (heatIndex >= 32) {
            reasons.push(`Elevated Heat Index of ${heatIndex}°C (${packet.ambientTemperature}°C, ${packet.humidity}% RH).`);
        }
        if (packet.exposureMinutes >= 90) {
            reasons.push(`Prolonged environmental exposure duration (${packet.exposureMinutes} minutes).`);
        }
        if (packet.aqi >= 150) {
            reasons.push(`Poor environmental air quality detected (AQI: ${packet.aqi}, PM2.5: ${packet.pm25} µg/m³).`);
        }
        if (spo2Delta <= -3) {
            reasons.push(`SpO₂ blood oxygen dropped ${Math.abs(spo2Delta)}% below your typical baseline (${baseline.baselineSpo2}%).`);
        }
        if (fallAssessment.isFall) {
            reasons.push(`Sudden acceleration impact and orientation shift detected (MPU6050 fall event).`);
        }
        if (reasons.length === 0) {
            reasons.push(`All physiological readings and environmental metrics are within your healthy baseline.`);
        }
        // Actionable Personalized Recommendations
        const recommendations = [];
        if (fallAssessment.isFall) {
            recommendations.push('Immediate safety check: Confirm you are okay or dispatch SOS assistance.');
        }
        if (heatRisk >= 50 || dehydrationRisk >= 50) {
            recommendations.push('Take an immediate 15-minute rest break in a shaded or cooled location.');
            recommendations.push('Hydrate with cool water and electrolyte replenishment (at least 250-500ml).');
        }
        if (respiratoryRisk >= 50) {
            recommendations.push('Move indoors or to a filtered-air environment; wear an N95 respirator if outdoors.');
            recommendations.push('Reduce high-intensity aerobic activity while AQI remains elevated.');
        }
        if (fatigueRisk >= 50) {
            recommendations.push('Reduce physical workload and avoid operating heavy machinery.');
            recommendations.push('Ensure a recovery rest period before the next work shift.');
        }
        if (recommendations.length === 0) {
            recommendations.push('Maintain regular hydration.');
            recommendations.push('Continue normal daily routine and keep wearable connected.');
        }
        return {
            overallScore,
            overallLevel,
            risks: {
                heat: heatRisk,
                dehydration: dehydrationRisk,
                respiratory: respiratoryRisk,
                fatigue: fatigueRisk,
                cardiovascular: cardiovascularRisk,
                fallEmergency: fallAssessment.score,
            },
            levels: {
                heat: this.getLevel(heatRisk),
                dehydration: this.getLevel(dehydrationRisk),
                respiratory: this.getLevel(respiratoryRisk),
                fatigue: this.getLevel(fatigueRisk),
                cardiovascular: this.getLevel(cardiovascularRisk),
                fallEmergency: this.getLevel(fallAssessment.score),
            },
            baselineDeltas: {
                heartRateDelta: hrDelta,
                spo2Delta,
                skinTempDelta: skinDelta,
                systolicDelta: sysDelta,
                diastolicDelta: diaDelta,
            },
            reasons,
            recommendations,
            isFallSuspected: fallAssessment.isFall,
            requiresImmediateSos: overallScore >= 80 || fallAssessment.isFall,
            computedAt: new Date().toISOString(),
            engineLocation,
            disasterContext,
        };
    }
}
exports.EdgeRiskEngine = EdgeRiskEngine;
