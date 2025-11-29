# TODO: Renewable Energy Management System Enhancements

## Phase 1: Type Definitions
- [x] Update src/types/index.ts with new interfaces (UserPoints, PriorityRequest, Region, MLMode, VoiceCommand)

## Phase 2: New Components
- [x] Create src/components/ChatbotWidget.tsx for Gemini integration
- [x] Create src/components/EnergyMap.tsx for region visualization
- [x] Create src/components/PriorityManager.tsx for static priority settings
- [x] Create src/components/PointsLeaderboard.tsx for user rankings

## Phase 3: User Dashboard Enhancements
- [x] Add points display and leaderboard to UserDashboard
- [ ] Implement conditional animations (solar/wind based on energy source)
- [x] Expand request-based priorities with static mappings
- [x] Add expected demand graph component
- [x] Integrate ChatbotWidget
- [x] Add contacts section for Rajasthan EB and PM schemes

## Phase 4: Admin Dashboard Enhancements
- [ ] Add manual mode controls for output switching
- [ ] Implement voice recognition mode with Gemini
- [ ] Add ML model mode with sleep(10) simulation
- [ ] Enhance analytics with region-wise data and points leaderboard
- [ ] Integrate EnergyMap component
- [ ] Add static PriorityManager page

## Phase 5: Testing & Verification
- [ ] Test all new features for functionality
- [ ] Verify animations render correctly
- [ ] Ensure voice and ML placeholders work
- [ ] Confirm data consistency between views
- [ ] Add any missing dependencies (e.g., for maps)
