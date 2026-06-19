declare module 'split-type' {
  export interface SplitTypeOptions {
    types?: string
    tagName?: string
  }

  export default class SplitType {
    constructor(target: Element | string, options?: SplitTypeOptions)
    revert(): void
  }
}
