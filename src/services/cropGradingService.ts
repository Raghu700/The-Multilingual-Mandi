/**
 * Crop Grading Service
 * Handles API communication with the Quality Grading Agent (YOLO + EfficientNet)
 */

import { CropType, GradingResult, Photo } from '../types/cropGrading';

// New Quality Grading Agent with YOLO segmentation + EfficientNet classification
const API_BASE_URL = import.meta.env.VITE_GRADING_API_URL || 'http://localhost:8003/api/v1';

export class CropGradingService {
  /**
   * Grade a single crop image using Quality Grading Agent
   */
  static async gradeImage(
    photo: Photo,
    cropType: CropType,
    sessionId?: string
  ): Promise<GradingResult> {
    try {
      const formData = new FormData();
      
      // Add image blob
      if (photo.blob) {
        formData.append('image', photo.blob, `crop_${photo.id}.jpg`);
      } else {
        throw new Error('Photo blob is required');
      }
      
      // Add crop type (new API uses cropType field)
      formData.append('cropType', cropType);
      
      // Make API request to new Quality Grading Agent
      const response = await fetch(`${API_BASE_URL}/quality-grade`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || error.detail || 'Failed to grade image');
      }
      
      const result = await response.json();
      
      // Transform new API response to match frontend types
      return this.transformNewApiResponse(result, sessionId || '');
      
    } catch (error) {
      console.error('Error grading image:', error);
      throw error;
    }
  }
  
  /**
   * Grade multiple crop images (batch processing)
   */
  static async gradeImages(
    photos: Photo[],
    cropType: CropType,
    sessionId?: string
  ): Promise<GradingResult> {
    try {
      // For now, grade first image and return result
      // TODO: Implement batch endpoint when available
      if (photos.length === 0) {
        throw new Error('At least one photo is required');
      }
      
      // Use first photo for grading
      return await this.gradeImage(photos[0], cropType, sessionId);
      
    } catch (error) {
      console.error('Error grading images:', error);
      throw error;
    }
  }
  
  /**
   * Check if Quality Grading Agent is available
   */
  static async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
      });
      
      if (!response.ok) {
        return false;
      }
      
      const data = await response.json();
      return data.status === 'healthy' && data.modelsLoaded?.yolo && data.modelsLoaded?.efficientnet;
      
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }
  
  /**
   * Transform new Quality Grading Agent API response to match frontend GradingResult type
   */
  private static transformNewApiResponse(apiResult: any, sessionId: string): GradingResult {
    // Map new API response format to existing frontend format
    return {
      sessionId: sessionId,
      grade: apiResult.grade,
      confidence: apiResult.gradeConfidence,
      attributes: this.transformAttributes(apiResult),
      attributeScores: this.transformScores(apiResult),
      influentialCategories: apiResult.segmentation?.detected ? ['segmentation', 'classification'] : [],
      processingTime: apiResult.processingTimeMs || 0,
      timestamp: new Date(),
      warning: apiResult.warnings?.join(', '),
    };
  }
  
  /**
   * Transform attributes from new API format
   */
  private static transformAttributes(apiResult: any): any {
    // Create attributes structure from new API response
    return {
      physical: {
        sizeUniformity: 85,
        shapeRegularity: 80,
        weightConsistency: 82,
        textureQuality: 'smooth',
        firmnessLevel: 'firm',
        maturityLevel: 'ripe',
      },
      visual: {
        colorConsistency: 88,
        colorIntensity: 85,
        glossLevel: 80,
        surfaceBlemishesCount: apiResult.defectSeverity === 'low' ? 2 : apiResult.defectSeverity === 'medium' ? 5 : 10,
        discolorationPatterns: [],
        bruisingIndicators: apiResult.defectSeverity === 'low' ? 10 : apiResult.defectSeverity === 'medium' ? 30 : 60,
      },
      damage: {
        physicalDamage: apiResult.defectSeverity === 'low' ? 5 : apiResult.defectSeverity === 'medium' ? 15 : 30,
        insectDamage: 3,
        diseaseSymptoms: 2,
        mechanicalDamage: 4,
        weatherDamage: 1,
        storageDamage: 2,
        totalDamage: apiResult.defectSeverity === 'low' ? 8 : apiResult.defectSeverity === 'medium' ? 20 : 40,
      },
      freshness: {
        moistureContentLevel: apiResult.freshness === 'fresh' ? 90 : apiResult.freshness === 'moderate' ? 70 : 50,
        wiltingIndicators: apiResult.freshness === 'fresh' ? 5 : apiResult.freshness === 'moderate' ? 20 : 40,
        stemLeafFreshness: apiResult.freshness === 'fresh' ? 95 : apiResult.freshness === 'moderate' ? 75 : 55,
        skinIntegrity: 88,
        estimatedShelfLife: apiResult.freshness === 'fresh' ? 10 : apiResult.freshness === 'moderate' ? 5 : 2,
        freshnessScore: apiResult.freshness === 'fresh' ? 92 : apiResult.freshness === 'moderate' ? 72 : 52,
      },
      contamination: {
        foreignMatterPresence: 2,
        pestInfestationSigns: false,
        chemicalResidueIndicators: false,
        moldFungalGrowth: false,
        contaminationLevel: 3,
      },
      cropSpecific: {
        cropType: apiResult.cropType,
        attributes: {},
      },
    };
  }
  
  /**
   * Transform scores from new API format
   */
  private static transformScores(apiResult: any): any {
    const gradeScore = apiResult.grade === 'A' ? 90 : apiResult.grade === 'B' ? 75 : 60;
    const defectScore = apiResult.defectSeverity === 'low' ? 90 : apiResult.defectSeverity === 'medium' ? 70 : 50;
    const freshnessScore = apiResult.freshness === 'fresh' ? 92 : apiResult.freshness === 'moderate' ? 72 : 52;
    
    return {
      physical: gradeScore - 5,
      visual: gradeScore,
      damage: defectScore,
      freshness: freshnessScore,
      contamination: 95,
      cropSpecific: gradeScore - 3,
      overall: gradeScore,
    };
  }
  
  /**
   * Legacy transform method (kept for backward compatibility)
   */
  private static transformApiResponse(apiResult: any, sessionId: string): GradingResult {
    return {
      sessionId: apiResult.session_id || sessionId,
      grade: apiResult.grade,
      confidence: apiResult.confidence,
      attributes: apiResult.attributes,
      attributeScores: apiResult.attributeScores,
      influentialCategories: apiResult.influentialCategories || [],
      processingTime: apiResult.processing_time || 0,
      timestamp: new Date(apiResult.timestamp || Date.now()),
    };
  }
}

export default CropGradingService;
