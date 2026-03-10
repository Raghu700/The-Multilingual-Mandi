# Implementation Plan: AI Crop Quality Grading

## Overview

This implementation plan converts the AI Crop Quality Grading feature design into actionable coding tasks. The system enables farmers to assess crop quality using mobile phone photos, providing quality grades (A/B/C), comprehensive attribute analysis across 6 categories, confidence scores, and mandi price predictions for 8 crop types (Wheat, Tomato, Onion, Chilli, Cardamom, Potato, Rice, Cotton).

The implementation follows an incremental approach: foundation → data models → core services → UI components → integration → testing. Each task builds on previous work, with checkpoints to validate progress.

**Technology Stack**: TypeScript, React, TensorFlow.js/ONNX Runtime, PostgreSQL, AWS S3/Cloud Storage

**Key Features**:
- 3-step workflow: crop selection → photo upload → results display
- Multilingual support (Hindi, English, Telugu, Tamil)
- Mobile-optimized for 3G networks and 2GB RAM devices
- Edge AI with offline capability
- Crop-specific grading with seasonal and regional adjustments
- Admin dashboard for model improvement

## Tasks

- [ ] 1. Project setup and foundation
  - Initialize TypeScript React project with Vite or Create React App
  - Configure TypeScript with strict mode
  - Set up ESLint, Prettier for code quality
  - Install core dependencies: React, React Router, TailwindCSS
  - Install AI/ML dependencies: TensorFlow.js or ONNX Runtime
  - Install image processing: sharp (server), browser-image-compression (client)
  - Install testing: Jest, React Testing Library, fast-check
  - Set up project structure: src/{components, services, types, utils, contexts}
  - Configure build tools and environment variables
  - _Requirements: All_

- [x] 2. Define TypeScript types and interfaces
  - [x] 2.1 Create core enums and types
    - Define CropType enum (wheat, tomato, onion, chilli, cardamom, potato, rice, cotton)
    - Define QualityGrade enum (A, B, C)
    - Define Language enum (hi, en, te, ta)
    - Define Season enum (peak_harvest, off_season, storage_period)
    - Define Region enum (north_india, south_india, west_india, east_india)
    - Define ProcessingStage enum for UI feedback
    - _Requirements: 1.1, 15.1-15.4, 25.1-25.3, 26.1-26.4_

  - [x] 2.2 Create data model interfaces
    - Define UploadSession interface with sessionId, farmerId, cropType, photos, status, timestamps
    - Define Photo interface with id, uri, blob, timestamp, source
    - Define CropAttributes interface with all 6 attribute categories
    - Define PhysicalAttributes, VisualQuality, DamageAssessment, FreshnessIndicators, ContaminationDetection, CropSpecificAttributes interfaces
    - Define GradingResult interface with grade, confidence, attributes, prices, recommendations
    - Define PricePrediction and SellingRecommendation interfaces
    - Define FeedbackData interface
    - _Requirements: 6.1-6.28, 7.1-7.3, 9.1-9.30, 11.1-11.7, 14.1-14.5_

  - [x] 2.3 Create service interfaces
    - Define ImageProcessingService interface with preprocess, compress, validate methods
    - Define CropDetectionService interface with detectCrops method
    - Define FeatureExtractionService interface with extractFeatures method
    - Define GradingService interface with gradeQuality method
    - Define AttributeScoringService interface with scoreAttributes method
    - Define PricePredictionService interface with predictPrices method
    - Define TranslationService interface with translate methods
    - _Requirements: 4.1-4.5, 5.1-5.5, 6.1-6.28, 7.1-7.4, 11.1-11.10, 15.1-15.9_


- [ ] 3. Set up database schema and storage
  - [ ] 3.1 Create PostgreSQL database schema
    - Create upload_sessions table with indexes
    - Create session_photos table with foreign keys
    - Create grading_results table with processing metrics
    - Create crop_attributes table with all attribute fields
    - Create scored_attributes table
    - Create price_predictions table
    - Create selling_recommendations table
    - Create feedback_data table
    - Create training_data table
    - Create attribute_weight_configs table
    - Create quality_threshold_configs table
    - _Requirements: 13.1-13.6, 17.1-17.8, 21.1-21.8_

  - [ ] 3.2 Set up cloud storage for images
    - Configure AWS S3 or equivalent cloud storage
    - Create bucket structure: /{farmer_id}/{session_id}/{original,processed,thumbnails}/
    - Set up storage policies (retention: 90 days for originals)
    - Configure access control and permissions
    - _Requirements: 13.1, 13.6_

  - [ ] 3.3 Create database access layer
    - Implement SessionRepository with CRUD operations
    - Implement PhotoRepository with upload/retrieve methods
    - Implement GradingResultRepository with query methods
    - Implement FeedbackRepository with create/update methods
    - Implement TrainingDataRepository with export methods
    - Add connection pooling and error handling
    - _Requirements: 13.1-13.6, 14.1-14.5, 17.1-17.8_

- [ ] 4. Implement translation service and multilingual support
  - [ ] 4.1 Create translation files
    - Create translations/hi.json with Hindi translations
    - Create translations/en.json with English translations
    - Create translations/te.json with Telugu translations
    - Create translations/ta.json with Tamil translations
    - Include all UI labels, crop names, attribute names, error messages, guidelines
    - _Requirements: 15.1-15.9_

  - [ ] 4.2 Implement TranslationService
    - Create TranslationService class with translate method
    - Implement language loading and caching
    - Add parameter interpolation for dynamic messages
    - Add fallback to English for missing translations
    - Implement translateAttributes method for crop attributes
    - _Requirements: 15.1-15.9_

  - [ ] 4.3 Create LanguageContext and hooks
    - Create LanguageContext with language state and setLanguage
    - Implement useLanguage hook for components
    - Add localStorage persistence for language preference
    - _Requirements: 15.5_

  - [ ]* 4.4 Write unit tests for translation service
    - Test translate method with all languages
    - Test parameter interpolation
    - Test fallback behavior
    - Test missing key handling
    - _Requirements: 15.1-15.9_

- [ ] 5. Build frontend UI components
  - [ ] 5.1 Create LanguageSelector component
    - Display language options (Hindi, English, Telugu, Tamil)
    - Show language names in native script
    - Handle language change with context update
    - Style with large touch targets (48x48px minimum)
    - _Requirements: 15.1-15.4, 19.1_

  - [x] 5.2 Create CropSelector component
    - Display 8 crop options in grid layout (2x4 or 4x2)
    - Show crop icons (48x48px minimum) with text labels
    - Implement crop selection handler
    - Add audio instruction playback
    - Translate crop names based on selected language
    - Style with high contrast (4.5:1 ratio)
    - _Requirements: 1.1-1.5, 15.5, 19.1-19.5_

  - [x] 5.3 Create PhotoCapture component
    - Display photo guidelines (daylight, plain background, close view)
    - Provide camera capture button (native camera API)
    - Provide gallery upload button (file input)
    - Show preview thumbnails for uploaded photos (2-3)
    - Implement photo count validation (2-3 required)
    - Add retake/replace functionality for each photo
    - Disable analyze button until valid photo count
    - Compress images client-side (<500KB target)
    - _Requirements: 2.1-2.8, 16.2, 19.1_

  - [ ] 5.4 Create ImageQualityValidator component
    - Implement blur detection for clarity assessment
    - Implement lighting validation (not too dark/bright)
    - Implement crop visibility check
    - Display specific guidance for failed validations
    - Show which guideline was not met
    - Block analysis if critical issues found
    - _Requirements: 3.1-3.4_

  - [ ] 5.5 Create ProcessingAnimation component
    - Display animated spinner or progress indicator
    - Show current processing stage (uploading, preprocessing, detecting, extracting, grading)
    - Display estimated time remaining
    - Prevent user interaction during processing
    - Update stage as pipeline progresses
    - _Requirements: 10.1-10.4_

  - [x] 5.6 Create ResultsDisplay component
    - Display quality grade prominently with color coding (A=green, B=yellow, C=red)
    - Show confidence score as percentage with visual indicator
    - Organize attributes by 6 categories with expandable sections
    - Display each attribute with score/rating and visual indicator
    - Highlight attributes that most influenced grade
    - Show crop-specific attributes prominently
    - Use farmer-friendly terminology
    - Provide audio summary option
    - _Requirements: 9.1-9.30, 23.8-23.9_

  - [ ] 5.7 Create PricePrediction component
    - List mandi prices sorted by highest first
    - Highlight best price option
    - Show price date/time
    - Display selling recommendations
    - Indicate optimal timing (immediate, wait, monitor)
    - Show regional context
    - _Requirements: 11.1-11.7, 12.1-12.4_

  - [ ] 5.8 Create FeedbackCollector component
    - Display thumbs up/down buttons (48x48px minimum)
    - Allow single feedback submission per session
    - Show thank you message after submission
    - Disable buttons after feedback given
    - _Requirements: 14.1-14.5, 19.1_

  - [ ] 5.9 Create ErrorBoundary and error display components
    - Implement ErrorBoundary for React error catching
    - Create ErrorMessage component with translated messages
    - Create RetryButton component
    - Create NetworkStatusIndicator component
    - _Requirements: 18.1-18.6, 16.8_

  - [ ]* 5.10 Write unit tests for UI components
    - Test CropSelector displays all 8 crops
    - Test PhotoCapture validates photo count
    - Test ResultsDisplay shows all attribute categories
    - Test FeedbackCollector allows single submission
    - Test language switching updates UI text
    - _Requirements: 1.1-1.5, 2.1-2.8, 9.1-9.30, 14.1-14.5_

- [ ] 6. Checkpoint - UI components render correctly
  - Ensure all components render without errors
  - Verify language switching works across all components
  - Test responsive design on mobile screen sizes (320px-768px)
  - Ask the user if questions arise


- [ ] 7. Implement image processing service
  - [ ] 7.1 Create ImageProcessingService class
    - Implement compressImage method (JPEG quality 85, target <500KB)
    - Implement normalizeImage method (resize to 640x640, RGB standardization)
    - Implement backgroundFiltering method (GrabCut or color-based thresholding)
    - Implement noiseReduction method (Gaussian blur, bilateral filter)
    - Implement edgeDetection method (Canny, Sobel)
    - Implement preprocessImage orchestration method
    - Add performance tracking (target <1s per image)
    - _Requirements: 2.5, 4.1-4.5, 16.2_

  - [ ] 7.2 Implement image quality validation
    - Create validateImageQuality method with blur detection
    - Implement lighting assessment (histogram analysis)
    - Implement crop visibility check
    - Return ValidationResult with specific issues
    - _Requirements: 3.1-3.4_

  - [ ]* 7.3 Write property test for image compression
    - **Property 2: Image Compression Reduces Size**
    - **Validates: Requirements 2.5, 16.2**
    - Generate random images with varying dimensions
    - Verify compressed size < original size
    - Run 100 iterations with fast-check
    - _Requirements: 2.5, 16.2_

  - [ ]* 7.4 Write property test for preprocessing pipeline
    - **Property 6: Image Preprocessing Pipeline Completeness**
    - **Validates: Requirements 4.1-4.4**
    - Verify all 4 operations applied (normalize, filter, reduce noise, detect edges)
    - Test with various image inputs
    - _Requirements: 4.1-4.5_

  - [ ]* 7.5 Write unit tests for image processing
    - Test compression reduces file size
    - Test normalization produces 640x640 images
    - Test preprocessing completes within 1 second
    - Test quality validation detects blur
    - _Requirements: 2.5, 4.1-4.5_

- [ ] 8. Implement crop detection service
  - [ ] 8.1 Set up AI model infrastructure
    - Choose model architecture (YOLOv8 or EfficientDet)
    - Set up TensorFlow.js or ONNX Runtime
    - Create model loading and caching mechanism
    - Implement model version management
    - _Requirements: 5.1-5.5, 16.7_

  - [ ] 8.2 Create CropDetectionService class
    - Implement detectCrops method with bounding box detection
    - Apply confidence threshold filtering (0.5 minimum)
    - Handle multiple crop samples in single image
    - Return DetectionResult with bounding boxes and confidence scores
    - Add performance tracking (target <1s per image)
    - _Requirements: 5.1-5.5_

  - [ ] 8.3 Implement no-crop-detected handling
    - Detect when zero crops found
    - Return appropriate error result
    - _Requirements: 5.4_

  - [ ]* 8.4 Write property test for crop detection
    - **Property 7: Crop Detection Returns Bounding Boxes**
    - **Validates: Requirements 5.1, 5.3**
    - Test with images containing visible crops
    - Verify at least one bounding box returned
    - _Requirements: 5.1-5.5_

  - [ ]* 8.5 Write unit tests for crop detection
    - Test detection returns bounding boxes
    - Test confidence filtering
    - Test multiple crop detection
    - Test no-crop scenario
    - Test performance (<1s per image)
    - _Requirements: 5.1-5.5_

- [ ] 9. Implement feature extraction service
  - [ ] 9.1 Create FeatureExtractionService class
    - Implement extractFeatures orchestration method
    - Set up feature extraction pipeline
    - _Requirements: 6.1-6.28_

  - [ ] 9.2 Implement physical attributes extraction
    - Extract size uniformity (coefficient of variation)
    - Extract shape regularity (circularity, aspect ratio)
    - Extract weight consistency estimation
    - Extract texture quality (Gabor filters, LBP)
    - Extract firmness level indicators
    - Extract maturity level (color-based classification)
    - _Requirements: 6.1-6.6_

  - [ ] 9.3 Implement visual quality extraction
    - Extract color consistency (standard deviation)
    - Extract color intensity (mean values)
    - Extract gloss level (specular reflection)
    - Count surface blemishes (segmentation)
    - Detect discoloration patterns (clustering)
    - Extract bruising indicators
    - _Requirements: 6.7-6.12_

  - [ ] 9.4 Implement damage assessment extraction
    - Detect physical damage (cuts, cracks, splits)
    - Detect insect damage (holes, bite marks)
    - Detect disease symptoms (spots, rot, mold)
    - Detect mechanical damage (handling marks)
    - Detect weather damage (sun scald, frost)
    - Detect storage damage (shriveling, sprouting)
    - Calculate total damage percentage
    - _Requirements: 6.13-6.18_

  - [ ] 9.5 Implement freshness indicators extraction
    - Extract moisture content level (texture/color)
    - Extract wilting indicators (shape deformation)
    - Extract stem/leaf freshness (color/texture)
    - Extract skin integrity
    - Estimate shelf life (regression model)
    - Calculate freshness score
    - _Requirements: 6.19-6.23_

  - [ ] 9.6 Implement contamination detection
    - Detect foreign matter (object detection)
    - Detect pest infestation signs
    - Detect chemical residue indicators
    - Detect mold and fungal growth (color-based)
    - Calculate contamination level
    - _Requirements: 6.24-6.27_

  - [ ] 9.7 Implement crop-specific feature extraction
    - Tomato: firmness, stem attachment, color uniformity
    - Onion: bulb size, skin quality, sprouting
    - Wheat: grain size distribution, foreign matter
    - Rice: grain length, broken grains, chalkiness
    - Potato: eye depth, skin quality, greening
    - Chilli: color intensity, drying level, stem condition
    - Cotton: fiber length, color purity, trash content
    - Cardamom: pod size, color quality, oil content
    - _Requirements: 22.1-22.10_

  - [ ] 9.8 Add performance optimization
    - Ensure feature extraction completes within 2 seconds per image
    - Implement parallel processing where possible
    - _Requirements: 6.28_

  - [ ]* 9.9 Write property test for feature extraction completeness
    - **Property 9: Feature Extraction Completeness**
    - **Validates: Requirements 6.1-6.28**
    - Verify all 6 attribute categories extracted
    - Test with various crop types
    - _Requirements: 6.1-6.28_

  - [ ]* 9.10 Write property test for attribute score ranges
    - **Property 10: Attribute Score Range Invariant**
    - **Validates: Requirements 28.1-28.7**
    - Verify all scores within [0, 100] range
    - Test with random feature inputs
    - _Requirements: 28.1-28.7_

  - [ ]* 9.11 Write unit tests for feature extraction
    - Test each attribute category extraction
    - Test crop-specific feature extraction
    - Test performance (<2s per image)
    - Test score range validation
    - _Requirements: 6.1-6.28, 22.1-22.10_

- [ ] 10. Checkpoint - Image processing and feature extraction working
  - Test end-to-end: upload image → preprocess → detect → extract features
  - Verify all attribute scores within valid ranges
  - Verify performance targets met (<1s preprocessing, <1s detection, <2s extraction)
  - Ask the user if questions arise


- [ ] 11. Implement attribute scoring service
  - [ ] 11.1 Create AttributeScoringService class
    - Implement scoreAttributes method
    - Calculate score for each of 6 attribute categories (0-100)
    - Apply crop-specific weights to categories
    - Compute weighted overall score
    - Identify most influential categories
    - Ensure all scores within [0, 100] range
    - _Requirements: 23.1-23.9_

  - [ ] 11.2 Create attribute weight configurations
    - Define ATTRIBUTE_WEIGHTS constant with weights for all 8 crops
    - Wheat: Physical 30%, Visual 20%, Damage 15%, Freshness 5%, Contamination 30%
    - Tomato: Physical 20%, Visual 30%, Damage 15%, Freshness 30%, Contamination 5%
    - Onion: Physical 30%, Visual 20%, Damage 10%, Freshness 25%, Crop-Specific 15%
    - Chilli: Physical 20%, Visual 35%, Damage 5%, Contamination 15%, Crop-Specific 25%
    - Cardamom: Physical 20%, Visual 25%, Freshness 5%, Contamination 15%, Crop-Specific 35%
    - Potato: Physical 30%, Visual 15%, Damage 25%, Contamination 10%, Crop-Specific 20%
    - Rice: Physical 35%, Visual 5%, Damage 15%, Contamination 20%, Crop-Specific 25%
    - Cotton: Physical 20%, Visual 10%, Damage 5%, Contamination 25%, Crop-Specific 40%
    - _Requirements: 24.1-24.10_

  - [ ]* 11.3 Write property test for attribute scoring
    - **Property 30: Attribute Category Scoring**
    - **Validates: Requirements 23.1-23.9**
    - Verify all 6 category scores calculated
    - Verify weighted overall score computed
    - Test with various crop types and features
    - _Requirements: 23.1-23.9_

  - [ ]* 11.4 Write unit tests for attribute scoring
    - Test score calculation for each category
    - Test weight application
    - Test overall score computation
    - Test influential category identification
    - _Requirements: 23.1-23.9_

- [ ] 12. Implement grading service with crop-specific logic
  - [ ] 12.1 Create GradingService class
    - Implement gradeQuality orchestration method
    - Aggregate features from multiple images
    - Apply crop-specific grading criteria
    - Apply attribute weighting
    - Generate confidence score
    - Return GradingResult with grade, confidence, attributes
    - _Requirements: 7.1-7.4_

  - [ ] 12.2 Create quality threshold configurations
    - Define grade A thresholds for all 8 crops
    - Define grade B thresholds for all 8 crops
    - Define grade C thresholds for all 8 crops
    - Store in QualityThresholdConfig format
    - _Requirements: 7.5-7.28_

  - [ ] 12.3 Implement grading logic for each crop type
    - Wheat: Focus on grain size, color, foreign matter, broken grains
    - Tomato: Focus on firmness, color, freshness, blemishes
    - Onion: Focus on bulb size, skin quality, sprouting, freshness
    - Chilli: Focus on color intensity, drying level, stem condition
    - Cardamom: Focus on pod size, color quality, oil content
    - Potato: Focus on eye depth, skin quality, greening, damage
    - Rice: Focus on grain length, broken grains, chalkiness, foreign matter
    - Cotton: Focus on fiber length, color purity, trash content
    - _Requirements: 7.21-7.28, 22.1-22.10_

  - [ ] 12.4 Implement confidence scoring mechanism
    - Calculate confidence from model probability (40%)
    - Factor in feature quality score (30%)
    - Factor in detection confidence (20%)
    - Factor in image quality score (10%)
    - Return confidence as percentage (0-100)
    - _Requirements: 7.3, 8.1-8.4_

  - [ ] 12.5 Implement low confidence handling
    - Check if confidence < 70%
    - Return appropriate result indicating low confidence
    - Do not include full grading details
    - _Requirements: 8.1-8.2_

  - [ ]* 12.6 Write property test for valid grade output
    - **Property 11: Grading Model Returns Valid Grade**
    - **Validates: Requirements 7.1, 7.3**
    - Verify grade is one of {A, B, C}
    - Verify confidence score in [0, 100]
    - Test with various feature inputs
    - _Requirements: 7.1-7.3_

  - [ ]* 12.7 Write property test for grade A thresholds
    - **Property 12: Grade A Threshold Consistency**
    - **Validates: Requirements 7.5-7.11, 28.9-28.14**
    - Verify grade A meets all threshold requirements
    - Test across all crop types
    - _Requirements: 7.5-7.11, 28.9-28.14_

  - [ ]* 12.8 Write property test for grade B thresholds
    - **Property 13: Grade B Threshold Consistency**
    - **Validates: Requirements 7.12-7.18, 28.15-28.16**
    - Verify grade B meets threshold requirements
    - Test across all crop types
    - _Requirements: 7.12-7.18, 28.15-28.16_

  - [ ]* 12.9 Write property test for grade C thresholds
    - **Property 14: Grade C Threshold Consistency**
    - **Validates: Requirements 7.19-7.20, 28.17-28.18**
    - Verify grade C has at least one poor quality indicator
    - Test across all crop types
    - _Requirements: 7.19-7.20, 28.17-28.18_

  - [ ]* 12.10 Write property test for crop-specific grading
    - **Property 15: Crop-Specific Grading Logic Applied**
    - **Validates: Requirements 7.21-7.28, 22.1-22.10, 24.1-24.10**
    - Verify correct weights applied for each crop type
    - Verify crop-specific criteria used
    - _Requirements: 7.21-7.28, 22.1-22.10, 24.1-24.10_

  - [ ]* 12.11 Write unit tests for grading service
    - Test grade A assignment for high-quality features
    - Test grade C assignment for low-quality features
    - Test confidence score calculation
    - Test low confidence handling
    - Test crop-specific grading for all 8 crops
    - Test performance (<3s total inference)
    - _Requirements: 7.1-7.28_

- [ ] 13. Implement seasonal and regional adjustments
  - [ ] 13.1 Create seasonal adjustment logic
    - Implement applySeasonalAdjustment function
    - Peak harvest: Increase thresholds by 5-10%
    - Off-season: Decrease thresholds by 5-10%
    - Storage period: Decrease thresholds by 10%, adjust freshness weight
    - Apply to quality thresholds before grading
    - _Requirements: 25.1-25.7_

  - [ ] 13.2 Create regional adjustment configurations
    - Define REGIONAL_ADJUSTMENTS for North, South, West, East India
    - North India: Stricter contamination for wheat/rice, prefer golden wheat color
    - South India: Stricter freshness for vegetables, prefer bold green cardamom
    - West India: Emphasis on cotton fiber quality, onion storage tolerance
    - East India: Stricter rice grain quality, higher freshness requirements
    - _Requirements: 26.1-26.9_

  - [ ] 13.3 Integrate adjustments into grading service
    - Apply seasonal adjustments based on GradingContext.season
    - Apply regional adjustments based on GradingContext.region
    - Store adjustment info in GradingResult
    - _Requirements: 25.1-25.7, 26.1-26.9_

  - [ ]* 13.4 Write property test for seasonal adjustments
    - **Property 31: Seasonal Adjustment Application**
    - **Validates: Requirements 25.1-25.7**
    - Verify adjustments applied for each season
    - Test with various crop types
    - _Requirements: 25.1-25.7_

  - [ ]* 13.5 Write property test for regional adjustments
    - **Property 32: Regional Standard Application**
    - **Validates: Requirements 26.1-26.9**
    - Verify adjustments applied for each region
    - Test with various crop types
    - _Requirements: 26.1-26.9_

  - [ ]* 13.6 Write unit tests for adjustments
    - Test seasonal adjustment factors
    - Test regional adjustment application
    - Test adjustment storage in results
    - _Requirements: 25.1-25.7, 26.1-26.9_

- [ ] 14. Checkpoint - Grading logic complete and tested
  - Test grading with sample features for all 8 crops
  - Verify grade thresholds enforced correctly
  - Verify seasonal and regional adjustments work
  - Verify all property tests pass (Properties 11-15, 30-32)
  - Ask the user if questions arise


- [ ] 15. Implement price prediction service
  - [ ] 15.1 Create PricePredictionService class
    - Implement predictPrices method
    - Fetch current mandi prices for crop type (mock or API integration)
    - Apply grade-based pricing factors (A=premium 1.15x, B=standard 1.0x, C=discount 0.85x)
    - Return predictions for 6+ major mandis (Hyderabad, Nagpur, Delhi Azadpur, etc.)
    - Identify highest price option
    - Include price date/time and trend information
    - _Requirements: 11.1-11.10_

  - [ ] 15.2 Implement selling recommendations
    - Create getRecommendations method
    - Generate recommendations based on grade and prices
    - Highlight best mandi for selling
    - Provide timing advice (immediate, wait, monitor)
    - Include reasoning for recommendations
    - _Requirements: 12.1-12.4_

  - [ ]* 15.3 Write property test for price factors
    - **Property 20: Price Prediction Grade Factors**
    - **Validates: Requirements 11.8-11.10**
    - Verify premium pricing for grade A
    - Verify standard pricing for grade B
    - Verify discounted pricing for grade C
    - _Requirements: 11.8-11.10_

  - [ ]* 15.4 Write unit tests for price prediction
    - Test price calculation with grade factors
    - Test mandi price fetching
    - Test highest price identification
    - Test recommendation generation
    - _Requirements: 11.1-11.10, 12.1-12.4_

- [ ] 16. Implement session management and data persistence
  - [ ] 16.1 Create SessionService class
    - Implement createSession method
    - Implement uploadPhotos method with storage integration
    - Implement saveGradingResult method
    - Implement saveFeedback method
    - Implement getSessionHistory method (last 20 sessions)
    - Implement getSessionDetails method
    - _Requirements: 13.1-13.6, 14.1-14.5, 20.1-20.5_

  - [ ] 16.2 Implement photo storage integration
    - Upload photos to cloud storage (S3 or equivalent)
    - Generate thumbnails for history view
    - Store original and compressed versions
    - Return storage URIs
    - _Requirements: 13.1_

  - [ ] 16.3 Implement feedback collection
    - Create submitFeedback method
    - Validate single feedback per session
    - Store feedback with timestamp and farmer ID
    - Flag sessions with negative feedback for review
    - _Requirements: 14.1-14.5_

  - [ ]* 16.4 Write property test for session data persistence
    - **Property 21: Session Data Persistence**
    - **Validates: Requirements 13.1-13.6**
    - Verify all session data stored correctly
    - Test with various session configurations
    - _Requirements: 13.1-13.6_

  - [ ]* 16.5 Write property test for feedback collection
    - **Property 22: Feedback Collection Once Per Session**
    - **Validates: Requirements 14.1-14.5**
    - Verify feedback allowed exactly once per session
    - Test feedback storage
    - _Requirements: 14.1-14.5_

  - [ ]* 16.6 Write unit tests for session management
    - Test session creation
    - Test photo upload and storage
    - Test grading result storage
    - Test feedback submission
    - Test session history retrieval
    - _Requirements: 13.1-13.6, 14.1-14.5, 20.1-20.5_

- [ ] 17. Implement offline capability and edge AI
  - [ ] 17.1 Set up model caching
    - Implement model download and caching mechanism
    - Store models in IndexedDB or local storage
    - Check for model updates on app launch
    - Update models only on WiFi connection
    - _Requirements: 16.7_

  - [ ] 17.2 Implement edge AI inference
    - Set up TensorFlow Lite or ONNX Runtime for mobile
    - Implement lite model loading (MobileNetV3 quantized)
    - Implement offline grading pipeline
    - Fall back to edge AI when network unavailable
    - _Requirements: 16.6_

  - [ ] 17.3 Implement offline queue and sync
    - Queue offline sessions for upload when online
    - Implement background sync when WiFi available
    - Retry failed uploads with exponential backoff
    - Display sync status to user
    - _Requirements: 16.6_

  - [ ] 17.4 Create network detection and adaptation
    - Detect network type (WiFi, 4G, 3G, 2G, offline)
    - Measure network speed and latency
    - Adapt behavior based on network conditions
    - Display network status indicator
    - _Requirements: 16.8_

  - [ ]* 17.5 Write property test for model caching
    - **Property 25: Model Caching After First Download**
    - **Validates: Requirements 16.7**
    - Verify model cached after first download
    - Verify subsequent sessions use cached model
    - _Requirements: 16.7_

  - [ ]* 17.6 Write unit tests for offline capability
    - Test model caching
    - Test edge AI inference
    - Test offline queue
    - Test sync mechanism
    - Test network detection
    - _Requirements: 16.6-16.8_

- [ ] 18. Implement error handling across all services
  - [ ] 18.1 Create error handler classes
    - Implement NetworkErrorHandler with retry logic
    - Implement ImageQualityErrorHandler with guidance
    - Implement ProcessingErrorHandler with fallbacks
    - Implement DataErrorHandler with validation
    - Implement SystemErrorHandler with recovery
    - _Requirements: 18.1-18.6_

  - [ ] 18.2 Integrate error handling into services
    - Add error handling to ImageProcessingService
    - Add error handling to CropDetectionService
    - Add error handling to FeatureExtractionService
    - Add error handling to GradingService
    - Add error handling to SessionService
    - _Requirements: 18.1-18.6_

  - [ ] 18.3 Implement error logging and monitoring
    - Create ErrorLog structure
    - Log all errors with context
    - Track error rates and patterns
    - Generate alerts for critical errors
    - _Requirements: 29.1-29.7_

  - [ ]* 18.4 Write property test for error messages
    - **Property 26: Error Message Display and Translation**
    - **Validates: Requirements 18.1-18.6**
    - Verify error messages displayed in correct language
    - Test all error types
    - _Requirements: 18.1-18.6_

  - [ ]* 18.5 Write unit tests for error handling
    - Test network error handling and retry
    - Test image quality error guidance
    - Test processing error fallbacks
    - Test error logging
    - _Requirements: 18.1-18.6_

- [ ] 19. Checkpoint - Backend services complete
  - Test end-to-end grading workflow with all services
  - Verify error handling works for all error types
  - Verify offline capability and sync
  - Verify session data persisted correctly
  - Ask the user if questions arise


- [ ] 20. Build main application workflow
  - [ ] 20.1 Create routing and navigation
    - Set up React Router with routes: /crop-selection, /photo-upload, /results, /history
    - Implement navigation flow: crop selection → photo upload → results
    - Add progress indicators (step 1/3, 2/3, 3/3)
    - Implement back navigation
    - _Requirements: 1.3, 19.7_

  - [ ] 20.2 Create App component with workflow orchestration
    - Integrate CropSelector, PhotoCapture, ResultsDisplay components
    - Manage workflow state (selected crop, uploaded photos, grading result)
    - Coordinate service calls (upload → process → grade → display)
    - Handle loading states and errors
    - _Requirements: 1.1-1.5, 2.1-2.8, 9.1-9.30_

  - [ ] 20.3 Implement audio instructions
    - Create AudioService for text-to-speech
    - Add audio playback for each step
    - Provide audio button on each screen
    - Support all 4 languages
    - _Requirements: 19.5_

  - [ ] 20.4 Implement accessibility features
    - Add ARIA labels to all interactive elements
    - Ensure keyboard navigation works
    - Add screen reader support
    - Implement high contrast mode
    - Ensure all touch targets are 48x48px minimum
    - _Requirements: 19.1-19.7_

  - [ ]* 20.5 Write property test for navigation flow
    - **Property 35: Navigation Flow Consistency**
    - **Validates: Requirements 1.3**
    - Verify crop selection navigates to photo upload
    - Verify photo upload navigates to results after analysis
    - _Requirements: 1.3_

  - [ ]* 20.6 Write property test for photo count validation
    - **Property 1: Photo Count Validation**
    - **Validates: Requirements 2.1, 2.7**
    - Verify session accepts 2-3 photos only
    - Test with various photo counts (0-10)
    - _Requirements: 2.1, 2.7_

  - [ ]* 20.7 Write property test for UI completeness
    - **Property 18: Results Display Completeness**
    - **Validates: Requirements 9.1-9.30, 11.1-11.7, 12.1-12.4**
    - Verify all required information displayed
    - Test with various grading results
    - _Requirements: 9.1-9.30, 11.1-11.7, 12.1-12.4_

  - [ ]* 20.8 Write integration tests for workflow
    - Test complete workflow: select crop → upload photos → view results
    - Test error scenarios at each step
    - Test back navigation
    - Test language switching during workflow
    - _Requirements: 1.1-1.5, 2.1-2.8, 9.1-9.30_

- [ ] 21. Implement mobile optimization
  - [ ] 21.1 Optimize for responsive design
    - Implement responsive layouts for 320px-768px screens
    - Test on various mobile devices and screen sizes
    - Ensure no horizontal scrolling
    - Optimize touch targets for mobile
    - _Requirements: 16.4, 19.1_

  - [ ] 21.2 Optimize performance for 3G networks
    - Implement progressive loading
    - Compress request/response payloads
    - Batch requests where possible
    - Implement request timeouts and retries
    - _Requirements: 16.1_

  - [ ] 21.3 Optimize for low-end devices
    - Test on devices with 2GB RAM
    - Optimize memory usage
    - Implement lazy loading for components
    - Reduce bundle size
    - _Requirements: 16.3_

  - [ ]* 21.4 Write property test for responsive design
    - **Property 24: Responsive Design Adaptation**
    - **Validates: Requirements 16.4**
    - Test layouts at various screen widths (320px-768px)
    - Verify no content overflow
    - _Requirements: 16.4_

  - [ ]* 21.5 Write property test for performance
    - **Property 34: End-to-End Performance**
    - **Validates: Requirements 4.5, 5.5, 7.4, 16.1**
    - Verify total time < 3 seconds on 3G
    - Test with various image sizes
    - _Requirements: 4.5, 5.5, 7.4, 16.1_

  - [ ]* 21.6 Write unit tests for mobile optimization
    - Test responsive layouts
    - Test performance on simulated 3G
    - Test memory usage
    - _Requirements: 16.1-16.4_

- [ ] 22. Build admin dashboard
  - [ ] 22.1 Create admin authentication and authorization
    - Implement admin login
    - Add role-based access control
    - Protect admin routes
    - _Requirements: 21.1_

  - [ ] 22.2 Create session review interface
    - Display sessions requiring review (low confidence, negative feedback)
    - Implement filtering by crop, grade, confidence, feedback, date
    - Implement sorting and pagination
    - Show session details with photos and attributes
    - _Requirements: 21.2-21.4_

  - [ ] 22.3 Create grade correction workflow
    - Display current grade and attributes
    - Allow admin to select corrected grade
    - Require correction notes (minimum 20 characters)
    - Save correction with admin ID and timestamp
    - Flag session for model retraining
    - _Requirements: 21.5-21.8_

  - [ ] 22.4 Create training data export interface
    - Filter training data by crop, source, date range
    - Display data statistics and distribution
    - Export in multiple formats (TFRecord, PyTorch, CSV, JSON)
    - Include corrected grades and metadata
    - Balance classes for training
    - _Requirements: 17.1-17.8, 21.8_

  - [ ] 22.5 Create performance monitoring dashboard
    - Display processing time metrics (avg, P50, P95, P99)
    - Display model accuracy metrics per crop
    - Display confidence score distribution
    - Display user feedback trends
    - Show alerts for performance issues
    - Generate performance reports
    - _Requirements: 29.1-29.7_

  - [ ] 22.6 Create configuration management interface
    - Allow editing attribute weights per crop
    - Allow editing quality thresholds per crop
    - Allow editing seasonal adjustment factors
    - Allow editing regional adjustments
    - Version control for configurations
    - Preview impact before applying
    - _Requirements: 24.10, 25.7_

  - [ ]* 22.7 Write property test for admin corrections
    - **Property 29: Admin Grade Correction Tracking**
    - **Validates: Requirements 21.5-21.8**
    - Verify corrections stored with all metadata
    - Verify sessions flagged for retraining
    - _Requirements: 21.5-21.8_

  - [ ]* 22.8 Write unit tests for admin dashboard
    - Test session filtering and sorting
    - Test grade correction workflow
    - Test training data export
    - Test performance monitoring
    - Test configuration management
    - _Requirements: 21.1-21.8, 29.1-29.7_

- [ ] 23. Checkpoint - Admin dashboard functional
  - Test session review and filtering
  - Test grade correction workflow
  - Test training data export
  - Test performance monitoring displays correct metrics
  - Ask the user if questions arise


- [ ] 24. Implement remaining property-based tests
  - [ ]* 24.1 Write property test for quality validation completeness
    - **Property 3: Image Quality Validation Completeness**
    - **Validates: Requirements 3.1**
    - Verify all 3 quality aspects assessed (clarity, lighting, crop visibility)
    - _Requirements: 3.1_

  - [ ]* 24.2 Write property test for quality validation feedback
    - **Property 4: Quality Validation Feedback**
    - **Validates: Requirements 3.2, 3.3**
    - Verify specific guideline referenced in error message
    - _Requirements: 3.2, 3.3_

  - [ ]* 24.3 Write property test for analysis button state
    - **Property 5: Analysis Button State**
    - **Validates: Requirements 2.7, 3.4**
    - Verify button enabled only when photos valid and count correct
    - _Requirements: 2.7, 3.4_

  - [ ]* 24.4 Write property test for no crop detection
    - **Property 8: No Crop Detection Notification**
    - **Validates: Requirements 5.4**
    - Verify notification displayed when no crops detected
    - _Requirements: 5.4_

  - [ ]* 24.5 Write property test for low confidence handling
    - **Property 16: Low Confidence Handling**
    - **Validates: Requirements 8.1, 8.2**
    - Verify low confidence message displayed when confidence < 70%
    - Verify full results not displayed
    - _Requirements: 8.1, 8.2_

  - [ ]* 24.6 Write property test for high confidence display
    - **Property 17: High Confidence Results Display**
    - **Validates: Requirements 8.3, 8.4**
    - Verify full results displayed when confidence >= 70%
    - _Requirements: 8.3, 8.4_

  - [ ]* 24.7 Write property test for processing animation
    - **Property 19: Processing Animation Lifecycle**
    - **Validates: Requirements 10.1-10.3**
    - Verify animation visible during processing
    - Verify user interaction prevented
    - _Requirements: 10.1-10.3_

  - [ ]* 24.8 Write property test for multilingual UI
    - **Property 23: Multilingual UI Translation**
    - **Validates: Requirements 15.1-15.9**
    - Verify all UI text translated for each language
    - Test all 4 languages
    - _Requirements: 15.1-15.9_

  - [ ]* 24.9 Write property test for touch target size
    - **Property 27: Touch Target Size Compliance**
    - **Validates: Requirements 1.5, 19.1**
    - Verify all interactive elements >= 48x48px
    - _Requirements: 1.5, 19.1_

  - [ ]* 24.10 Write property test for session history
    - **Property 28: Session History Retrieval**
    - **Validates: Requirements 20.1-20.5**
    - Verify history retrieval returns last 20 sessions
    - Verify session details accessible
    - _Requirements: 20.1-20.5_

  - [ ]* 24.11 Write property test for grading consistency
    - **Property 33: Grading Consistency (Round-Trip)**
    - **Validates: Requirements 27.1-27.4**
    - Verify same images produce same grade
    - Verify confidence scores vary by <= 2%
    - _Requirements: 27.1-27.4_

  - [ ]* 24.12 Write property test for crop icon pairing
    - **Property 36: Crop Icon and Label Pairing**
    - **Validates: Requirements 1.2**
    - Verify each crop has both icon and label
    - _Requirements: 1.2_

  - [ ]* 24.13 Write property test for photo preview
    - **Property 37: Photo Preview Display**
    - **Validates: Requirements 2.6**
    - Verify preview displayed for each uploaded photo
    - _Requirements: 2.6_

  - [ ]* 24.14 Write property test for photo retake
    - **Property 38: Photo Retake Availability**
    - **Validates: Requirements 2.8**
    - Verify retake/replace option available before analysis
    - _Requirements: 2.8_

  - [ ]* 24.15 Write property test for influential attributes
    - **Property 39: Influential Attribute Categories Identification**
    - **Validates: Requirements 23.9**
    - Verify influential categories identified and highlighted
    - _Requirements: 23.9_

  - [ ]* 24.16 Write property test for network indicator
    - **Property 40: Network Status Indicator Visibility**
    - **Validates: Requirements 16.8**
    - Verify network indicator visible during operations
    - _Requirements: 16.8_

- [ ] 25. Integration testing and end-to-end validation
  - [ ]* 25.1 Write integration test for complete grading workflow
    - Test: Select crop → Upload photos → Process → Display results
    - Verify all services called in correct order
    - Verify data flows correctly through pipeline
    - _Requirements: All_

  - [ ]* 25.2 Write integration test for offline workflow
    - Test: Complete grading workflow in offline mode
    - Verify edge AI used
    - Verify session queued for sync
    - Verify sync occurs when online
    - _Requirements: 16.6_

  - [ ]* 25.3 Write integration test for error recovery
    - Test: Network error during upload → Retry → Success
    - Test: Low confidence → Retake photos → Success
    - Test: No crop detected → Retake → Success
    - _Requirements: 18.1-18.6_

  - [ ]* 25.4 Write integration test for multilingual workflow
    - Test: Complete workflow in each language
    - Verify all text translated correctly
    - Verify language persistence
    - _Requirements: 15.1-15.9_

  - [ ]* 25.5 Write integration test for all crop types
    - Test: Complete workflow for each of 8 crops
    - Verify crop-specific grading applied
    - Verify crop-specific attributes extracted
    - _Requirements: 7.21-7.28, 22.1-22.10_

  - [ ]* 25.6 Write integration test for admin workflow
    - Test: Review session → Correct grade → Export training data
    - Verify correction stored
    - Verify session flagged for training
    - _Requirements: 21.1-21.8_

- [ ] 26. Performance testing and optimization
  - [ ]* 26.1 Test preprocessing performance
    - Verify preprocessing completes within 1 second per image
    - Test with various image sizes
    - Optimize if needed
    - _Requirements: 4.5_

  - [ ]* 26.2 Test crop detection performance
    - Verify detection completes within 1 second per image
    - Test with various image complexities
    - Optimize if needed
    - _Requirements: 5.5_

  - [ ]* 26.3 Test feature extraction performance
    - Verify extraction completes within 2 seconds per image
    - Test with various crop types
    - Optimize if needed
    - _Requirements: 6.28_

  - [ ]* 26.4 Test end-to-end performance
    - Verify total time < 3 seconds on 3G network
    - Test with 2-3 photos
    - Optimize if needed
    - _Requirements: 7.4, 16.1_

  - [ ]* 26.5 Test memory usage
    - Verify app runs on devices with 2GB RAM
    - Monitor memory during grading
    - Optimize if needed
    - _Requirements: 16.3_

  - [ ]* 26.6 Test bundle size
    - Measure JavaScript bundle size
    - Optimize with code splitting if needed
    - Ensure fast initial load
    - _Requirements: 16.1_

- [ ] 27. Checkpoint - All tests passing
  - Run all unit tests and verify 100% pass
  - Run all property tests (40 properties, 100 iterations each) and verify pass
  - Run all integration tests and verify pass
  - Verify code coverage meets targets (>80% line, >75% branch)
  - Ask the user if questions arise


- [ ] 28. Polish and final integration
  - [ ] 28.1 Implement loading states and animations
    - Add skeleton loaders for components
    - Add smooth transitions between screens
    - Add success/error animations
    - Optimize animation performance
    - _Requirements: 10.1-10.4_

  - [ ] 28.2 Implement comprehensive error messages
    - Review all error messages for clarity
    - Ensure all errors translated in all languages
    - Add helpful guidance for each error type
    - Test error display in all scenarios
    - _Requirements: 18.1-18.6_

  - [ ] 28.3 Optimize accessibility
    - Run accessibility audit (axe, Lighthouse)
    - Fix any accessibility issues found
    - Test with screen readers
    - Test keyboard navigation
    - Verify color contrast ratios
    - _Requirements: 19.1-19.7_

  - [ ] 28.4 Implement analytics and monitoring
    - Add analytics tracking for user actions
    - Track grading success/failure rates
    - Track performance metrics
    - Set up error monitoring (Sentry or similar)
    - _Requirements: 29.1-29.7_

  - [ ] 28.5 Create user documentation
    - Write user guide for farmers (with screenshots)
    - Create video tutorial for each step
    - Translate documentation to all 4 languages
    - Add in-app help tooltips
    - _Requirements: 19.5-19.7_

  - [ ] 28.6 Create admin documentation
    - Write admin guide for dashboard usage
    - Document grade correction workflow
    - Document training data export process
    - Document configuration management
    - _Requirements: 21.1-21.8_

  - [ ]* 28.7 Perform final end-to-end testing
    - Test complete workflow on real mobile devices
    - Test on various Android and iOS versions
    - Test on different network conditions (WiFi, 4G, 3G, offline)
    - Test with real crop images
    - Verify all features work as expected
    - _Requirements: All_

- [ ] 29. Deployment preparation
  - [ ] 29.1 Set up production environment
    - Configure production database
    - Set up production cloud storage
    - Configure production API endpoints
    - Set up CDN for static assets
    - _Requirements: All_

  - [ ] 29.2 Set up CI/CD pipeline
    - Configure automated testing on commits
    - Set up automated deployment to staging
    - Configure production deployment process
    - Set up rollback mechanism
    - _Requirements: All_

  - [ ] 29.3 Configure monitoring and alerting
    - Set up application monitoring (New Relic, Datadog, etc.)
    - Configure performance alerts
    - Configure error rate alerts
    - Set up uptime monitoring
    - _Requirements: 29.1-29.7_

  - [ ] 29.4 Perform security audit
    - Review authentication and authorization
    - Check for SQL injection vulnerabilities
    - Check for XSS vulnerabilities
    - Review data encryption (in transit and at rest)
    - Test API security
    - _Requirements: All_

  - [ ] 29.5 Optimize for production
    - Enable production builds with minification
    - Enable gzip compression
    - Configure caching headers
    - Optimize database queries
    - Set up database indexes
    - _Requirements: 16.1-16.4_

  - [ ] 29.6 Create deployment checklist
    - Document deployment steps
    - Create rollback plan
    - Define success criteria
    - Plan for gradual rollout
    - _Requirements: All_

- [ ] 30. Final checkpoint and handoff
  - Verify all 40 correctness properties tested and passing
  - Verify all requirements covered by implementation
  - Verify performance targets met (3s on 3G, <1s preprocessing, <1s detection, <2s extraction)
  - Verify mobile optimization complete (320px-768px responsive, 2GB RAM support)
  - Verify multilingual support complete (Hindi, English, Telugu, Tamil)
  - Verify offline capability working (edge AI, sync)
  - Verify admin dashboard functional (review, correction, export, monitoring)
  - Verify all 8 crop types supported with crop-specific grading
  - Run final smoke tests on staging environment
  - Prepare for production deployment
  - Ask the user if questions arise

## Notes

- Tasks marked with `*` are optional testing tasks and can be skipped for faster MVP, but are highly recommended for production quality
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- Property tests validate universal correctness properties (40 total)
- Unit tests validate specific examples and edge cases
- Integration tests validate end-to-end workflows
- All property tests must run minimum 100 iterations
- Code coverage targets: >80% line coverage, >75% branch coverage, >90% function coverage
- Performance targets: <3s total on 3G, <1s preprocessing, <1s detection, <2s extraction
- Mobile targets: 320px-768px responsive, 2GB RAM minimum, 3G network support
- Multilingual: Hindi, English, Telugu, Tamil with complete translations
- Crop types: Wheat, Tomato, Onion, Chilli, Cardamom, Potato, Rice, Cotton
- Quality grades: A (excellent), B (good), C (fair)
- Attribute categories: Physical Attributes, Visual Quality, Damage Assessment, Freshness Indicators, Contamination Detection, Crop-Specific Attributes

## Implementation Strategy

1. **Foundation First**: Set up project structure, types, database, and translation service before building features
2. **Service Layer Before UI**: Implement backend services (image processing, detection, extraction, grading) before UI components
3. **Incremental Testing**: Write tests alongside implementation, not after
4. **Checkpoints for Validation**: Use checkpoints to validate progress and catch issues early
5. **Property Tests for Correctness**: Use property-based testing to verify universal properties across all inputs
6. **Mobile-First Design**: Design and test for mobile from the start, not as an afterthought
7. **Offline-First Architecture**: Build offline capability into the core, not as an add-on
8. **Multilingual from Start**: Include translations from the beginning, not retrofitted later
9. **Performance Monitoring**: Track performance metrics throughout development
10. **Iterative Refinement**: Continuously refine based on testing and feedback

## Success Criteria

- All 40 correctness properties pass with 100 iterations each
- All unit tests pass with >80% code coverage
- All integration tests pass
- Performance targets met: <3s total on 3G
- Mobile optimization complete: works on 2GB RAM devices, responsive 320px-768px
- Multilingual support complete: all UI text translated to 4 languages
- Offline capability working: edge AI inference, sync when online
- Admin dashboard functional: review, correction, export, monitoring
- All 8 crop types supported with crop-specific grading logic
- Seasonal and regional adjustments working
- Error handling comprehensive with translated messages
- Accessibility compliant: ARIA labels, keyboard navigation, screen reader support
- Security audit passed
- Production deployment ready
