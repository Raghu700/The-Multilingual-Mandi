# Implementation Plan: Multilingual Rural Auth Redesign

## Overview

This implementation plan transforms the existing email-based authentication into a mobile-first, multilingual system with OTP authentication, audio guidance, and enhanced accessibility for rural Indian farmers. The implementation builds on the existing React + TypeScript + Vite stack and updates Login.tsx, Register.tsx, AuthContext.tsx, and LanguageContext.tsx components along with their supporting services.

## Tasks

- [ ] 1. Set up translation infrastructure and offline caching
  - [ ] 1.1 Create translation data structure with all 4 languages
    - Create `/public/translations/all.json` with complete translations for English, Hindi, Bengali, and Marathi
    - Include all UI strings: labels, buttons, placeholders, error messages, helper text
    - _Requirements: 1.3, 1.7_
  
  - [ ] 1.2 Implement TranslationService with localStorage caching
    - Update `src/services/translationService.ts` to implement caching logic
    - Add methods: `loadTranslations()`, `getTranslation()`, `updateCache()`, `isAvailableOffline()`
    - Implement version-based cache invalidation
    - _Requirements: 12.1, 12.2, 12.3, 12.6_
  
  - [ ]* 1.3 Write property test for translation completeness
    - **Property 2: Translation Completeness**
    - **Validates: Requirements 1.3**
    - Verify all translation keys exist in all 4 languages
    - _Requirements: 1.3_
  
  - [ ]* 1.4 Write property test for translation cache versioning
    - **Property 26: Translation Cache Versioning**
    - **Validates: Requirements 12.6**
    - Verify cached translations include version numbers
    - _Requirements: 12.6_

- [ ] 2. Update LanguageContext with persistence and translation integration
  - [ ] 2.1 Enhance LanguageContext with localStorage persistence
    - Update `src/contexts/LanguageContext.tsx` to persist language selection
    - Add translation function `t(key, params)` to context
    - Load initial language from localStorage on mount
    - Set `document.documentElement.lang` attribute
    - _Requirements: 1.4, 1.5_
  
  - [ ]* 2.2 Write property test for language persistence round-trip
    - **Property 3: Language Persistence Round-Trip**
    - **Validates: Requirements 1.4, 1.5**
    - Verify language selection persists across page reloads
    - _Requirements: 1.4, 1.5_
  
  - [ ]* 2.3 Write property test for language switch performance
    - **Property 1: Language Switch Performance**
    - **Validates: Requirements 1.2**
    - Verify UI updates within 100ms of language change
    - _Requirements: 1.2_
  
  - [ ]* 2.4 Write property test for offline translation serving
    - **Property 24: Offline Translation Serving**
    - **Validates: Requirements 12.2**
    - Verify translations served from cache when offline
    - _Requirements: 12.2_

- [ ] 3. Create LanguageSelector component
  - [ ] 3.1 Implement LanguageSelector component
    - Create `src/components/LanguageSelector.tsx` with dropdown UI
    - Support 4 languages: English, Hindi (हिंदी), Bengali (বাংলা), Marathi (मराठी)
    - Display language names in native scripts
    - Add globe icon (🌐) with "भाषा चुनें" label
    - Ensure minimum 44x44px touch target
    - _Requirements: 1.1, 1.2, 5.4_
  
  - [ ]* 3.2 Write unit tests for LanguageSelector
    - Test language switching functionality
    - Test localStorage persistence
    - Test ARIA labels for accessibility
    - _Requirements: 1.1, 1.2, 10.1_

- [ ] 4. Implement OTP service with mock implementation
  - [ ] 4.1 Create OTPService interface and mock implementation
    - Create `src/services/otpService.ts` with MockOTPService class
    - Implement methods: `sendOTP()`, `verifyOTP()`, `resendOTP()`
    - Use fixed OTP '123456' for demo
    - Implement 5-minute expiration and 3-attempt limit
    - Add 30-second resend cooldown
    - _Requirements: 2.5, 2.7_
  
  - [ ]* 4.2 Write property test for OTP generation timing
    - **Property 5: OTP Generation Timing**
    - **Validates: Requirements 2.5**
    - Verify OTP generated within 3 seconds
    - _Requirements: 2.5_
  
  - [ ]* 4.3 Write property test for OTP authentication flow
    - **Property 6: OTP Authentication Flow**
    - **Validates: Requirements 2.7**
    - Verify valid mobile + OTP creates user session
    - _Requirements: 2.7_
  
  - [ ]* 4.4 Write unit tests for OTP service
    - Test OTP expiration after 5 minutes
    - Test max attempts enforcement
    - Test resend cooldown
    - _Requirements: 2.5, 2.7_

- [ ] 5. Create validation utilities and InputValidator component
  - [ ] 5.1 Implement validation utilities
    - Create `src/utils/validation.ts` with validation functions
    - Add `validateMobileNumber()` - 10 digits starting with 6-9
    - Add `validateOTP()` - exactly 6 digits
    - Add `validateEmail()` for fallback auth
    - _Requirements: 2.3, 2.4, 4.4, 4.5_
  
  - [ ] 5.2 Create InputValidator component with debouncing
    - Create `src/components/InputValidator.tsx` with render props pattern
    - Implement 300ms debounce for validation
    - Provide visual feedback: green border + checkmark for valid, red border + error for invalid
    - Use high-contrast colors: green #10b981, red #ef4444
    - _Requirements: 4.1, 4.2, 4.6, 4.7_
  
  - [ ]* 5.3 Write property test for mobile number validation feedback
    - **Property 4: Mobile Number Validation Feedback**
    - **Validates: Requirements 2.3, 2.4, 4.1, 4.2, 4.4**
    - Verify correct visual feedback for any mobile number input
    - _Requirements: 2.3, 2.4, 4.1, 4.2, 4.4_
  
  - [ ]* 5.4 Write property test for OTP validation
    - **Property 9: OTP Validation**
    - **Validates: Requirements 4.5**
    - Verify OTP marked valid only for exactly 6 digits
    - _Requirements: 4.5_
  
  - [ ]* 5.5 Write property test for validation debounce timing
    - **Property 10: Validation Debounce Timing**
    - **Validates: Requirements 4.6**
    - Verify validation executes 300ms ±50ms after last input
    - _Requirements: 4.6_
  
  - [ ]* 5.6 Write unit tests for validation utilities
    - Test edge cases for mobile number validation
    - Test OTP validation with various inputs
    - Test error message generation
    - _Requirements: 2.3, 2.4, 4.4, 4.5_

- [ ] 6. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Create MobileAuthForm component
  - [ ] 7.1 Implement MobileAuthForm component
    - Create `src/components/MobileAuthForm.tsx` for mobile + OTP authentication
    - Add mobile number input with validation and audio hint button
    - Add OTP input field (appears after mobile verification)
    - Implement "Send OTP" and "Verify OTP" buttons (min 48px height)
    - Add "Resend OTP" with 30-second countdown
    - Show visual validation feedback using InputValidator
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 5.1, 5.2, 5.3_
  
  - [ ]* 7.2 Write unit tests for MobileAuthForm
    - Test mobile number submission flow
    - Test OTP verification flow
    - Test resend OTP functionality
    - Test error handling
    - _Requirements: 2.1, 2.2, 2.5, 2.6, 2.7_

- [x] 8. Create DemoAccessCard component
  - [x] 8.1 Implement DemoAccessCard component
    - Create `src/components/DemoAccessCard.tsx` with prominent demo access UI
    - Display "👨‍🌾 New to EktaMandi?" heading (24px font, bold)
    - Add "🎯 Try Demo Without Registering" button (saffron gradient, min 48px height)
    - Show demo credentials: mobile 9876543210, OTP 123456
    - ~~Add "Copy Credentials" button with clipboard functionality~~ (Removed per UI update)
    - ~~Show success toast on copy~~ (Removed per UI update)
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 11.1, 11.2_
  
  - [ ]* 8.2 Write property test for demo session expiration
    - **Property 13: Demo Session Expiration**
    - **Validates: Requirements 6.7**
    - Verify demo sessions expire after 24 hours
    - _Requirements: 6.7_
  
  - [ ]* 8.3 Write unit tests for DemoAccessCard
    - Test demo credential display
    - ~~Test copy to clipboard functionality~~ (Removed)
    - Test demo login trigger
    - ~~Test toast message display~~ (Removed)
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

- [ ] 9. Set up audio infrastructure with IndexedDB caching
  - [ ] 9.1 Create audio files directory structure
    - Create `/public/audio/` directory with subdirectories for each language
    - Create placeholder audio files for: mobile_number, otp, email, password, name
    - Structure: `/public/audio/{language}/{fieldId}.mp3`
    - _Requirements: 3.3, 3.7_
  
  - [ ] 9.2 Implement AudioService with IndexedDB caching
    - Create `src/services/audioService.ts` with AudioServiceImpl class
    - Implement IndexedDB initialization for audio cache
    - Add methods: `playHint()`, `preloadAudio()`, `isCached()`
    - Implement cache-first playback strategy
    - _Requirements: 3.2, 3.4, 3.7_
  
  - [ ]* 9.3 Write property test for audio hint playback
    - **Property 7: Audio Hint Playback**
    - **Validates: Requirements 3.2**
    - Verify audio plays for any field in any language
    - _Requirements: 3.2_
  
  - [ ]* 9.4 Write property test for audio caching
    - **Property 8: Audio Caching**
    - **Validates: Requirements 3.7**
    - Verify subsequent playback served from cache
    - _Requirements: 3.7_
  
  - [ ]* 9.5 Write unit tests for AudioService
    - Test audio playback functionality
    - Test IndexedDB caching
    - Test error handling for missing files
    - Test graceful degradation
    - _Requirements: 3.2, 3.4, 3.7_

- [ ] 10. Create AudioHintPlayer component
  - [ ] 10.1 Implement AudioHintPlayer component
    - Create `src/components/AudioHintPlayer.tsx` with 🔊 icon button
    - Integrate with AudioService for playback
    - Show animated icon during playback
    - Ensure minimum 44x44px touch target
    - Add ARIA labels for screen readers
    - _Requirements: 3.1, 3.2, 3.5, 5.4, 10.1_
  
  - [ ]* 10.2 Write unit tests for AudioHintPlayer
    - Test audio playback trigger
    - Test loading state display
    - Test error handling
    - Test accessibility attributes
    - _Requirements: 3.1, 3.2, 3.5, 10.1_

- [ ] 11. Create VoiceGuideButton component
  - [ ] 11.1 Implement VoiceGuideButton component
    - Create `src/components/VoiceGuideButton.tsx` for step-by-step walkthrough
    - Add "🎙️ Voice Guide" button (min 48px height)
    - Implement step-by-step audio playthrough with element highlighting
    - Add controls: skip, replay, exit
    - Store completion status in localStorage
    - Hide button after first completion
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 5.1_
  
  - [ ]* 11.2 Write property test for walkthrough completion persistence
    - **Property 14: Walkthrough Completion Persistence**
    - **Validates: Requirements 7.6**
    - Verify completion status persists across sessions
    - _Requirements: 7.6_
  
  - [ ]* 11.3 Write unit tests for VoiceGuideButton
    - Test walkthrough initiation
    - Test step progression
    - Test element highlighting
    - Test completion tracking
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

- [ ] 12. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 13. Update AuthContext for mobile authentication
  - [ ] 13.1 Enhance AuthContext to support mobile authentication
    - Update `src/contexts/AuthContext.tsx` to handle mobile-based users
    - Add support for demo user sessions with 24-hour expiration
    - Update User type to include optional mobile field
    - Maintain backward compatibility with email authentication
    - _Requirements: 2.7, 6.7_
  
  - [ ]* 13.2 Write unit tests for AuthContext updates
    - Test mobile authentication flow
    - Test demo session expiration
    - Test user state management
    - _Requirements: 2.7, 6.7_

- [ ] 14. Update authService for mobile and demo authentication
  - [ ] 14.1 Enhance authService with mobile authentication
    - Update `src/services/authService.ts` to support mobile + OTP login
    - Add `loginWithMobile()` function
    - Add `registerWithMobile()` function
    - Implement demo account creation with 24-hour expiration
    - Update User model to include mobile field
    - _Requirements: 2.7, 6.3, 6.7_
  
  - [ ]* 14.2 Write unit tests for authService updates
    - Test mobile authentication
    - Test demo account creation
    - Test session expiration
    - _Requirements: 2.7, 6.3, 6.7_

- [ ] 15. Create OfflineContext for offline capability
  - [ ] 15.1 Implement OfflineContext
    - Create `src/contexts/OfflineContext.tsx` for offline state management
    - Monitor online/offline status using navigator.onLine
    - Implement operation queue for offline requests
    - Add "Working Offline" indicator
    - Process queued operations when connection restored
    - _Requirements: 12.4, 12.5_
  
  - [ ]* 15.2 Write unit tests for OfflineContext
    - Test online/offline detection
    - Test operation queueing
    - Test queue processing on reconnection
    - _Requirements: 12.4, 12.5_

- [x] 16. Redesign Login component with mobile-first approach
  - [x] 16.1 Update Login.tsx with new mobile-first design
    - Update `src/components/Login.tsx` to use MobileAuthForm as primary method
    - Add LanguageSelector at top of screen
    - Position DemoAccessCard above login form
    - ~~Add VoiceGuideButton for first-time users~~ (Not implemented yet)
    - Add "Use Email Instead" link for fallback authentication
    - ~~Integrate AudioHintPlayer for all input fields~~ (Not implemented yet)
    - ~~Add culturally relevant background image (blurred mandi scene)~~ (Not implemented yet)
    - Display "Made for Bharat Farmers" footer with Indian flag
    - Ensure mobile-first responsive layout (320px-480px)
    - **UI Updates Applied:**
      - Removed flag emoji from header (line 72-73)
      - Added Indian flag image next to EktaMandi logo
      - Optimized spacing to remove vertical scroll
      - Reduced all component sizes and margins
      - Farmer image with phone badge
      - Trust badges (Secure, Verified, AI)
      - Earthy color scheme (green, amber, emerald)
    - _Requirements: 1.1, 2.1, 2.8, 2.9, 3.1, 6.1, 7.1, 8.1, 8.3, 8.5, 9.1, 9.5, 11.2_
  
  - [ ]* 16.2 Write property test for mobile viewport layout
    - **Property 17: Mobile Viewport Layout**
    - **Validates: Requirements 9.1, 9.5**
    - Verify mobile-optimized layout for 320px-480px viewports
    - _Requirements: 9.1, 9.5_
  
  - [ ]* 16.3 Write unit tests for updated Login component
    - Test mobile authentication flow
    - Test email fallback flow
    - Test demo access integration
    - Test language switching
    - ~~Test voice guide integration~~ (Not implemented yet)
    - _Requirements: 2.1, 2.8, 2.9, 6.1, 7.1_

- [ ] 17. Redesign Register component with mobile-first approach
  - [ ] 17.1 Update Register.tsx with mobile authentication
    - Update `src/components/Register.tsx` to use MobileAuthForm
    - Add LanguageSelector at top
    - Add language preference selector in registration form
    - Integrate AudioHintPlayer for all input fields
    - Add culturally relevant background image
    - Update role selection to include 'farmer' and 'fpo_admin'
    - Ensure mobile-first responsive layout
    - _Requirements: 1.1, 2.1, 3.1, 8.1, 8.5, 9.1, 9.5_
  
  - [ ]* 17.2 Write unit tests for updated Register component
    - Test mobile registration flow
    - Test language preference selection
    - Test role selection
    - Test audio hint integration
    - _Requirements: 2.1, 3.1_

- [ ] 18. Add culturally relevant visual design elements
  - [ ] 18.1 Create and optimize background images
    - Create 3-5 background images showing mandi scenes, baskets, crops
    - Optimize images to max 200KB each
    - Implement image rotation logic
    - Add images to `/public/images/backgrounds/`
    - _Requirements: 8.1, 8.2, 8.7_
  
  - [ ] 18.2 Update theme with Indian tricolor elements
    - Update Tailwind config with saffron (#f97316), white, green (#10b981) theme
    - Add emoji icons throughout UI (📱, 🔒, 👨‍🌾, 🎯, 🌐, 🔊, 🎙️)
    - Update EktaMandi logo to include Hindi text
    - _Requirements: 8.3, 8.4, 8.5, 8.6_
  
  - [ ]* 18.3 Write property test for background image rotation
    - **Property 15: Background Image Rotation**
    - **Validates: Requirements 8.2**
    - Verify different images displayed across page loads
    - _Requirements: 8.2_
  
  - [ ]* 18.4 Write property test for image file size optimization
    - **Property 16: Image File Size Optimization**
    - **Validates: Requirements 8.7**
    - Verify all background images ≤ 200KB
    - _Requirements: 8.7_

- [ ] 19. Implement accessibility enhancements
  - [ ] 19.1 Add ARIA labels and semantic HTML
    - Add aria-label to all interactive elements
    - Use semantic HTML (button, input, label) throughout
    - Add aria-live regions for validation errors
    - Add role="alert" for error messages
    - Ensure logical tab order for keyboard navigation
    - Add skip navigation links
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7_
  
  - [ ]* 19.2 Write property test for ARIA accessibility attributes
    - **Property 19: ARIA Accessibility Attributes**
    - **Validates: Requirements 10.1, 10.4, 10.5**
    - Verify all interactive elements have ARIA attributes
    - _Requirements: 10.1, 10.4, 10.5_
  
  - [ ]* 19.3 Write property test for keyboard navigation tab order
    - **Property 20: Keyboard Navigation Tab Order**
    - **Validates: Requirements 10.2**
    - Verify logical tab order through interactive elements
    - _Requirements: 10.2_
  
  - [ ]* 19.4 Write property test for error message announcements
    - **Property 21: Error Message Announcements**
    - **Validates: Requirements 10.3**
    - Verify error messages have aria-live or role="alert"
    - _Requirements: 10.3_
  
  - [ ]* 19.5 Write property test for accessibility dimensions
    - **Property 11: Accessibility Dimensions**
    - **Validates: Requirements 5.1, 5.4**
    - Verify minimum 44x44px touch targets, 48px button height
    - _Requirements: 5.1, 5.4_
  
  - [ ]* 19.6 Write property test for interactive element spacing
    - **Property 12: Interactive Element Spacing**
    - **Validates: Requirements 5.6**
    - Verify minimum 12px spacing between elements
    - _Requirements: 5.6_

- [ ] 20. Add progress indicators and visual hierarchy
  - [ ] 20.1 Implement progress indicator for multi-step auth
    - Create progress indicator component for mobile → OTP flow
    - Update indicator as user progresses through steps
    - Use visual hierarchy (size, color, spacing) for emphasis
    - Position demo access above login form
    - Use card-based layout with clear separation
    - _Requirements: 11.3, 11.4, 11.5, 11.6_
  
  - [ ]* 20.2 Write property test for progress indicator updates
    - **Property 22: Progress Indicator Updates**
    - **Validates: Requirements 11.6**
    - Verify indicator updates reflect current step
    - _Requirements: 11.6_
  
  - [ ]* 20.3 Write unit tests for progress indicator
    - Test step progression
    - Test visual updates
    - Test accessibility
    - _Requirements: 11.6_

- [ ] 21. Implement responsive design and performance optimizations
  - [ ] 21.1 Add responsive CSS and media queries
    - Add CSS media queries for mobile (320px-480px), tablet (768px+), desktop
    - Implement responsive font sizes (14px-18px)
    - Ensure vertical stacking on mobile
    - Test on Android 7.0+ with 2GB RAM
    - _Requirements: 9.1, 9.3, 9.4, 9.5, 9.6, 9.7_
  
  - [ ]* 21.2 Write property test for page load performance
    - **Property 18: Page Load Performance**
    - **Validates: Requirements 9.2**
    - Verify critical resources load within 3 seconds on 3G
    - _Requirements: 9.2_
  
  - [ ]* 21.3 Write unit tests for responsive behavior
    - Test layout at different viewport sizes
    - Test font scaling
    - Test element stacking
    - _Requirements: 9.1, 9.4, 9.5, 9.6, 9.7_

- [ ] 22. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 23. Create custom test generators for property-based tests
  - [ ] 23.1 Implement custom generators
    - Create `src/test/generators/userGenerators.ts`
    - Add generators: languageArb, mobileNumberArb, invalidMobileNumberArb, otpArb, userArb
    - Create `src/test/generators/validationGenerators.ts`
    - Add generators for validation test cases
    - _Requirements: All property tests_
  
  - [ ]* 23.2 Write unit tests for generators
    - Test generator output validity
    - Test generator edge cases
    - _Requirements: All property tests_

- [ ] 24. Write integration tests for complete authentication flows
  - [ ]* 24.1 Write integration test for mobile OTP authentication flow
    - Test complete flow: mobile input → OTP send → OTP verify → authenticated
    - Test with language switching during flow
    - Test with audio hints
    - _Requirements: 2.1, 2.2, 2.5, 2.6, 2.7_
  
  - [ ]* 24.2 Write integration test for demo access flow
    - Test demo credential auto-fill
    - Test demo authentication
    - Test demo session expiration
    - _Requirements: 6.1, 6.2, 6.3, 6.7_
  
  - [ ]* 24.3 Write integration test for offline/online transitions
    - Test translation caching
    - Test operation queueing when offline
    - Test queue processing when back online
    - _Requirements: 12.1, 12.2, 12.4, 12.5_
  
  - [ ]* 24.4 Write integration test for voice walkthrough
    - Test complete walkthrough flow
    - Test element highlighting
    - Test completion persistence
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

- [ ] 25. Write remaining property-based tests
  - [ ]* 25.1 Write property test for translation cache initialization
    - **Property 23: Translation Cache Initialization**
    - **Validates: Requirements 12.1**
    - Verify translations cached before UI render
    - _Requirements: 12.1_
  
  - [ ]* 25.2 Write property test for translation cache updates
    - **Property 25: Translation Cache Updates**
    - **Validates: Requirements 12.3**
    - Verify cache updates when online and newer version available
    - _Requirements: 12.3_

- [ ] 26. Run accessibility audit and fix violations
  - [ ]* 26.1 Run automated accessibility tests with axe-core
    - Install and configure jest-axe
    - Run axe tests on all components
    - Fix any violations found
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7_
  
  - [ ]* 26.2 Perform manual screen reader testing
    - Test with NVDA or JAWS
    - Verify all content is accessible
    - Verify logical navigation order
    - Fix any issues found
    - _Requirements: 10.1, 10.2, 10.3, 10.5_
  
  - [ ]* 26.3 Perform manual keyboard navigation testing
    - Test tab order through all interactive elements
    - Test Enter/Space activation of buttons
    - Test Escape to close modals/dropdowns
    - Fix any issues found
    - _Requirements: 10.2_

- [ ] 27. Final checkpoint - Comprehensive testing
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 28. Update documentation and create demo content
  - [ ] 28.1 Update README with new authentication features
    - Document mobile OTP authentication
    - Document multilingual support
    - Document audio hints and voice walkthrough
    - Document demo access
    - Add screenshots of new UI
    - _Requirements: All_
  
  - [ ] 28.2 Create demo audio files
    - Record or generate audio hints for all fields in all 4 languages
    - Record voice walkthrough audio in all 4 languages
    - Optimize audio files for web delivery
    - _Requirements: 3.2, 3.3, 7.2_
  
  - [ ] 28.3 Add culturally relevant background images
    - Source or create 3-5 mandi scene images
    - Optimize to max 200KB each
    - Add to project
    - _Requirements: 8.1, 8.2, 8.7_

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties (26 total)
- Unit tests validate specific examples and edge cases
- Integration tests validate complete user flows
- All property tests should run minimum 100 iterations using fast-check
- The implementation builds on existing React + TypeScript + Vite stack
- Existing components (Login.tsx, Register.tsx) will be updated, not replaced
- Backward compatibility maintained for email authentication
