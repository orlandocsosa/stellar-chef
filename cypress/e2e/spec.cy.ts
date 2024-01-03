describe('Asset Issuance Page', () => {
  it('successfully loads', () => {
    const baseUrl = Cypress.config('baseUrl');

    cy.visit(`${baseUrl}/recipe/asset-issuance`);
  });

  it('creates a new asset', () => {
    // Intercept any network request
    cy.intercept('**').as('anyRequest');

    // Fill out the form
    cy.get('#asset-code').type('testAsset');
    cy.get('#create-distributor-account').check();
    cy.get('#clawback-enabled').check();
    cy.get('#frozen-asset').check();

    // Click the "Prepare!" button
    cy.get('#prepare-button').click();
  });
});
