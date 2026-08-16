/**
 * Utility to generate a full Tailwind color scale (50-950) from a single hex color.
 * Uses color-mix to blend the base color with white or black.
 */
export function generateColorScale(baseColorHex: string, prefix: string = 'primary'): React.CSSProperties {
  // We assume baseColorHex is a valid hex color like #3b82f6
  // Tailwind's 500 is typically the base color.
  // We blend with white for lighter shades (50-400) and black for darker shades (600-950).
  
  return {
    [`--${prefix}-50`]: `color-mix(in oklab, ${baseColorHex} 10%, white)`,
    [`--${prefix}-100`]: `color-mix(in oklab, ${baseColorHex} 20%, white)`,
    [`--${prefix}-200`]: `color-mix(in oklab, ${baseColorHex} 40%, white)`,
    [`--${prefix}-300`]: `color-mix(in oklab, ${baseColorHex} 60%, white)`,
    [`--${prefix}-400`]: `color-mix(in oklab, ${baseColorHex} 80%, white)`,
    [`--${prefix}-500`]: baseColorHex,
    [`--${prefix}-600`]: `color-mix(in oklab, ${baseColorHex} 80%, black)`,
    [`--${prefix}-700`]: `color-mix(in oklab, ${baseColorHex} 60%, black)`,
    [`--${prefix}-800`]: `color-mix(in oklab, ${baseColorHex} 40%, black)`,
    [`--${prefix}-900`]: `color-mix(in oklab, ${baseColorHex} 20%, black)`,
    [`--${prefix}-950`]: `color-mix(in oklab, ${baseColorHex} 10%, black)`,
  } as React.CSSProperties;
}
