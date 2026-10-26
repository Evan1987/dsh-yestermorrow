/** Host loader entry for the browser-only AETHERWORKS skin. */

/**
 * The host half intentionally does nothing: the skin owns no service, emits no
 * Cordis event and never touches a model request. All behavior lives in the
 * web client entry (`./client`).
 */
export function apply(): void {}
