# Accessibility Checklist

Phase 6A accessibility pass for `apps/web`.

## Automated checks

- [x] `jest-axe` audit added for `LevelCanvas`
- [x] `jest-axe` audit added for `ProgressCodeForm`
- [x] Interactive controls use accessible names
- [x] Progress indicators expose semantic progressbar metadata
- [x] Live regions added for success, failure, and import feedback

## Manual checks

- [x] Keyboard navigation confirmed for core level controls
- [x] Visible skip link added for keyboard users
- [x] Textarea has a programmatic label and helper text
- [x] Primary touch targets are at least 44px high on settings and game controls
- [ ] NVDA / JAWS screen reader smoke test
- [ ] Real-device color-contrast audit

## Notes

- Mobile and desktop smoke coverage lives in `e2e/smoke.spec.ts` and `e2e/mobile.spec.ts`.
- Remaining manual items should be completed before a production accessibility sign-off.
