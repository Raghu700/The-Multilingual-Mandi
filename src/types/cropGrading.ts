/**
 * Core types and enums for AI Crop Quality Grading feature
 * Requirements: 1.1, 15.1-15.4, 25.1-25.3, 26.1-26.4
 */

// Crop types supported by the system
export enum CropType {
  WHEAT = 'wheat',
  TOMATO = 'tomato',
  ONION = 'onion',
  CHILLI = 'chilli',
  CARDAMOM = 'cardamom',
  POTATO = 'potato',
  RICE = 'rice',
  COTTON = 'cotton',
}

// Quality grades
export enum QualityGrade {
  A = 'A',
  B = 'B',
  C = 'C',
}

// Supported languages (extending existing Language type)
export enum Language {
  HINDI = 'hi',
  ENGLISH = 'en',
  TELUGU = 'te',
  TAMIL = 'ta',
}

// Seasonal periods affecting grading thresholds
export enum Season {
  PEAK_HARVEST = 'peak_harvest',
  OFF_SEASON = 'off_season',
  STORAGE_PERIOD = 'storage_period',
}

// Regional standards for grading
export enum Region {
  NORTH_INDIA = 'north_india',
  SOUTH_INDIA = 'south_india',
  WEST_INDIA = 'west_india',
  EAST_INDIA = 'east_india',
}

// Processing stages for UI feedback
export enum ProcessingStage {
  IDLE = 'idle',
  UPLOADING = 'uploading',
  PREPROCESSING = 'preprocessing',
  DETECTING = 'detecting',
  EXTRACTING = 'extracting',
  GRADING = 'grading',
  COMPLETE = 'complete',
  ERROR = 'error',
}

// Session status
export enum SessionStatus {
  CREATED = 'created',
  UPLOADING = 'uploading',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

// Photo source
export enum PhotoSource {
  CAMERA = 'camera',
  GALLERY = 'gallery',
}

/**
 * Data model interfaces
 * Requirements: 6.1-6.28, 7.1-7.3, 9.1-9.30, 11.1-11.7, 14.1-14.5
 */

// Upload session
export interface UploadSession {
  sessionId: string;
  farmerId: string;
  cropType: CropType;
  photos: Photo[];
  status: SessionStatus;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

// Photo metadata
export interface Photo {
  id: string;
  uri: string;
  blob?: Blob;
  timestamp: Date;
  source: PhotoSource;
  compressed?: boolean;
  size?: number;
}

// Physical attributes (Requirements 6.1-6.6)
export interface PhysicalAttributes {
  sizeUniformity: number; // 0-100, coefficient of variation
  shapeRegularity: number; // 0-100, circularity/aspect ratio
  weightConsistency: number; // 0-100, estimated from size
  textureQuality: number; // 0-100, Gabor filters/LBP
  firmnessLevel: number; // 0-100, visual indicators
  maturityLevel: number; // 0-100, color-based classification
}

// Visual quality attributes (Requirements 6.7-6.12)
export interface VisualQuality {
  colorConsistency: number; // 0-100, standard deviation
  colorIntensity: number; // 0-100, mean values
  glossLevel: number; // 0-100, specular reflection
  surfaceBlemishes: number; // count
  discolorationPatterns: number; // 0-100, clustering score
  bruisingIndicators: number; // 0-100, detection score
}

// Damage assessment (Requirements 6.13-6.18)
export interface DamageAssessment {
  physicalDamage: number; // 0-100, cuts/cracks/splits
  insectDamage: number; // 0-100, holes/bite marks
  diseaseSymptoms: number; // 0-100, spots/rot/mold
  mechanicalDamage: number; // 0-100, handling marks
  weatherDamage: number; // 0-100, sun scald/frost
  storageDamage: number; // 0-100, shriveling/sprouting
  totalDamagePercentage: number; // 0-100, overall damage
}

// Freshness indicators (Requirements 6.19-6.23)
export interface FreshnessIndicators {
  moistureContent: number; // 0-100, texture/color based
  wiltingIndicators: number; // 0-100, shape deformation
  stemLeafFreshness: number; // 0-100, color/texture
  skinIntegrity: number; // 0-100, condition score
  estimatedShelfLife: number; // days
  freshnessScore: number; // 0-100, overall freshness
}

// Contamination detection (Requirements 6.24-6.27)
export interface ContaminationDetection {
  foreignMatter: number; // 0-100, object detection score
  pestInfestation: number; // 0-100, signs detected
  chemicalResidueIndicators: number; // 0-100, visual indicators
  moldFungalGrowth: number; // 0-100, color-based detection
  contaminationLevel: number; // 0-100, overall contamination
}

// Crop-specific attributes (Requirements 22.1-22.10)
export interface CropSpecificAttributes {
  // Tomato
  tomatoFirmness?: number;
  tomatoStemAttachment?: number;
  tomatoColorUniformity?: number;
  
  // Onion
  onionBulbSize?: number;
  onionSkinQuality?: number;
  onionSprouting?: number;
  
  // Wheat
  wheatGrainSizeDistribution?: number;
  wheatForeignMatter?: number;
  wheatBrokenGrains?: number;
  
  // Rice
  riceGrainLength?: number;
  riceBrokenGrains?: number;
  riceChalkiness?: number;
  
  // Potato
  potatoEyeDepth?: number;
  potatoSkinQuality?: number;
  potatoGreening?: number;
  
  // Chilli
  chilliColorIntensity?: number;
  chilliDryingLevel?: number;
  chilliStemCondition?: number;
  
  // Cotton
  cottonFiberLength?: number;
  cottonColorPurity?: number;
  cottonTrashContent?: number;
  
  // Cardamom
  cardamomPodSize?: number;
  cardamomColorQuality?: number;
  cardamomOilContent?: number;
}

// Complete crop attributes (Requirements 6.1-6.28)
export interface CropAttributes {
  physical: PhysicalAttributes;
  visual: VisualQuality;
  damage: DamageAssessment;
  freshness: FreshnessIndicators;
  contamination: ContaminationDetection;
  cropSpecific: CropSpecificAttributes;
}

// Price prediction (Requirements 11.1-11.7)
export interface PricePrediction {
  mandiName: string;
  location: string;
  pricePerKg: number;
  currency: string;
  date: Date;
  trend?: 'rising' | 'falling' | 'stable';
  isHighest?: boolean;
}

// Selling recommendation (Requirements 12.1-12.4)
export interface SellingRecommendation {
  timing: 'immediate' | 'wait' | 'monitor';
  bestMandi: string;
  reasoning: string;
  expectedPriceRange?: {
    min: number;
    max: number;
  };
}

// Grading result (Requirements 7.1-7.3, 9.1-9.30, 11.1-11.7)
export interface GradingResult {
  sessionId: string;
  grade: QualityGrade;
  confidence: number; // 0-100
  attributes: CropAttributes;
  attributeScores: {
    physical: number;
    visual: number;
    damage: number;
    freshness: number;
    contamination: number;
    cropSpecific: number;
    overall: number;
  };
  influentialCategories: string[]; // Categories that most influenced grade
  prices?: PricePrediction[];
  recommendations?: SellingRecommendation;
  processingTime: number; // milliseconds
  timestamp: Date;
  seasonalAdjustment?: string;
  regionalAdjustment?: string;
  warning?: string; // Warning message if crop match is low
}

// Feedback data (Requirements 14.1-14.5)
export interface FeedbackData {
  sessionId: string;
  farmerId: string;
  isAccurate: boolean; // thumbs up/down
  timestamp: Date;
  comment?: string;
}

// Grading context for seasonal/regional adjustments
export interface GradingContext {
  season?: Season;
  region?: Region;
  cropType: CropType;
}

/**
 * Service interfaces
 * Requirements: 4.1-4.5, 5.1-5.5, 6.1-6.28, 7.1-7.4, 11.1-11.10, 15.1-15.9
 */

// Image quality validation result
export interface ValidationResult {
  isValid: boolean;
  issues: string[];
  clarity?: number; // 0-100
  lighting?: number; // 0-100
  cropVisibility?: number; // 0-100
}

// Crop detection result
export interface DetectionResult {
  boundingBoxes: BoundingBox[];
  confidence: number;
  cropsDetected: number;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
}

// Image processing service interface (Requirements 4.1-4.5)
export interface IImageProcessingService {
  compressImage(image: Blob, targetSizeKB?: number): Promise<Blob>;
  normalizeImage(image: Blob): Promise<Blob>;
  preprocessImage(image: Blob): Promise<{
    processed: Blob;
    metadata: {
      originalSize: number;
      processedSize: number;
      processingTime: number;
    };
  }>;
  validateImageQuality(image: Blob): Promise<ValidationResult>;
}

// Crop detection service interface (Requirements 5.1-5.5)
export interface ICropDetectionService {
  detectCrops(image: Blob): Promise<DetectionResult>;
  initialize(): Promise<void>;
}

// Feature extraction service interface (Requirements 6.1-6.28)
export interface IFeatureExtractionService {
  extractFeatures(
    images: Blob[],
    cropType: CropType,
    detectionResults: DetectionResult[]
  ): Promise<CropAttributes>;
  initialize(): Promise<void>;
}

// Grading service interface (Requirements 7.1-7.4)
export interface IGradingService {
  gradeQuality(
    attributes: CropAttributes,
    cropType: CropType,
    context?: GradingContext
  ): Promise<GradingResult>;
  initialize(): Promise<void>;
}

// Attribute scoring service interface (Requirements 23.1-23.9)
export interface IAttributeScoringService {
  scoreAttributes(
    attributes: CropAttributes,
    cropType: CropType
  ): Promise<{
    physical: number;
    visual: number;
    damage: number;
    freshness: number;
    contamination: number;
    cropSpecific: number;
    overall: number;
    influentialCategories: string[];
  }>;
}

// Price prediction service interface (Requirements 11.1-11.10)
export interface IPricePredictionService {
  predictPrices(
    cropType: CropType,
    grade: QualityGrade,
    region?: Region
  ): Promise<PricePrediction[]>;
  getRecommendations(
    cropType: CropType,
    grade: QualityGrade,
    prices: PricePrediction[]
  ): Promise<SellingRecommendation>;
}

// Translation service interface (Requirements 15.1-15.9)
export interface ITranslationService {
  translate(key: string, language: Language, params?: Record<string, string>): string;
  translateAttributes(attributes: CropAttributes, language: Language): Record<string, string>;
  setLanguage(language: Language): void;
  getCurrentLanguage(): Language;
}

// Session service interface (Requirements 13.1-13.6, 14.1-14.5, 20.1-20.5)
export interface ISessionService {
  createSession(farmerId: string, cropType: CropType): Promise<UploadSession>;
  uploadPhotos(sessionId: string, photos: Photo[]): Promise<void>;
  saveGradingResult(sessionId: string, result: GradingResult): Promise<void>;
  saveFeedback(sessionId: string, feedback: FeedbackData): Promise<void>;
  getSessionHistory(farmerId: string, limit?: number): Promise<UploadSession[]>;
  getSessionDetails(sessionId: string): Promise<UploadSession & { result?: GradingResult }>;
}
