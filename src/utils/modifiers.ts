export type ModifierKey = 'shift' | 'command' | 'control' | 'option'

let prewarmed = false

/**
 * Pre-warm the native module by loading it in advance.
 * Call this early to avoid delay on first use.
 */
export function prewarmModifiers(): void {
  if (prewarmed || process.platform !== 'darwin') {
    return
  }
  prewarmed = true
  // Load module in background
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { prewarm } = require('modifiers-napi') as { prewarm: () => void }
    prewarm()
  } catch {
    // Ignore errors during prewarm
  }
}

/**
 * Check if a specific modifier key is currently pressed (synchronous).
 */
export function isModifierPressed(modifier: ModifierKey): boolean {
  if (process.platform !== 'darwin') {
    return false
  }
  // Fail safe: if the native module is missing, stubbed, or throws, treat the
  // modifier as not pressed. This function is called from the Enter handler on
  // every keystroke — an uncaught throw here kills Enter entirely (the build
  // stubs `modifiers-napi` with only a default export, so the named import
  // below is undefined and calling it throws "is not a function").
  try {
    // Dynamic import to avoid loading native module at top level
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const native = require('modifiers-napi') as {
      isModifierPressed?: (m: string) => boolean
    }
    if (typeof native?.isModifierPressed !== 'function') {
      return false
    }
    return native.isModifierPressed(modifier) === true
  } catch {
    return false
  }
}
