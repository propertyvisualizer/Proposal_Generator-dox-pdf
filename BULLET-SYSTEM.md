# Bullet Point System Documentation

## Overview
The proposal form now uses a simplified textarea-based bullet point system with dash hierarchy notation.

## Format
Each service has a single textarea where users can enter bullet points using this format:

```
Main bullet point
- Sub-bullet point
-- Sub-sub-bullet point
Another main bullet point
- Another sub-bullet
```

## Hierarchy Rules
- **No dash**: Main bullet point
- **Single dash (-)**: Sub-bullet (child of the previous main bullet)
- **Double dash (--)**: Sub-sub-bullet (child of the previous sub-bullet)

## Example
```
High-quality 3D exterior visualization
- Photorealistic rendering
- Professional lighting
-- Natural daylight simulation
-- Artificial light sources
- Multiple angles
Complete revision included
```

This will render as:
- High-quality 3D exterior visualization
  - Photorealistic rendering
  - Professional lighting
    - Natural daylight simulation
    - Artificial light sources
  - Multiple angles
- Complete revision included

## Technical Details

### Form (proposal-form.html)
- All textareas use class: `custom-description-textarea`
- Attribute: `data-service="[service-id]"`
- Auto-save enabled via existing event listeners
- Parser function: `bulletsToDescriptionArray(serviceId)`

### Parser Logic
The `bulletsToDescriptionArray()` function:
1. Reads textarea content
2. Splits by newlines
3. Detects dash prefix to determine hierarchy level
4. Outputs array format compatible with preview and DOCX generation

### Output Format
Returns null if empty, otherwise an array of:
- Strings for main bullets without children
- Objects `{text: "...", children: [...]}` for bullets with sub-bullets

### Compatibility
- Preview (preview.html): No changes needed - receives same array format
- DOCX Generator (pure-docx-generator.js): No changes needed - receives same array format

## Migration Notes
- Old bullet system (individual input fields with add/delete buttons) has been disabled
- Function `initializeBulletUI()` is commented out
- Old functions still present but unused: `addBulletPoint()`, `deleteBullet()`, `renderBullets()`
- Saved data from old system is automatically converted to textarea format on load
