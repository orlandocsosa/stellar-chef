declare namespace Cypress {
  interface Chainable {
    /**
     * Get a DOM element by data-cy attribute
     */
    getByDataTestAttribute: (dataTestAttribute: string, args?: any) => Chainable<JQuery<HTMLElement>>;
  }
}
