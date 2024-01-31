const FREEZE_ASSET_CODE: string = Cypress.env('ASSET_CODE');

const FREEZE_ISSUER_PUBLIC_KEY: string = Cypress.env('ISSUER_PUBLIC_KEY');
const FREEZE_ISSUER_SECRET_KEY: string = Cypress.env('ISSUER_SECRET_KEY');
const FREEZE_ASSET_HOLDER_PUBLIC_KEY: string = Cypress.env('HOLDER_PUBLIC_KEY');
const EXPECTED_STATUS_LINK_FREEZE: string = Cypress.env('EXPECTED_STATUS_LINK');

describe('Asset Freezing', () => {
  beforeEach(() => {
    cy.clearLocalStorage();

    cy.intercept(
      {
        method: 'GET',
        url: `https://horizon-testnet.stellar.org/accounts/${FREEZE_ISSUER_PUBLIC_KEY}`
      },
      { fixture: 'issuerAccount.json' }
    ).as('stellarIssuerGetRequest');

    cy.intercept(
      {
        method: 'GET',
        url: `https://horizon-testnet.stellar.org/accounts/${FREEZE_ASSET_HOLDER_PUBLIC_KEY}`
      },
      { fixture: 'holderAccount.json' }
    ).as('stellarHolderGetRequest');

    cy.intercept(
      {
        method: 'POST',
        url: 'https://horizon-testnet.stellar.org/transactions'
      },
      { fixture: 'transaction.json' }
    ).as('stellarTransactionPostRequest');

    cy.intercept(
      {
        method: 'GET',
        url: 'https://horizon-testnet.stellar.org/accounts/GWRONGPUBLICKEYXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'
      },
      {
        statusCode: 400,
        fixture: 'transactionFail.json'
      }
    ).as('stellarWrongAccountGetRequest');

    cy.visit('/recipe/freeze-assets');
    cy.getByDataTestAttribute('asset-code-input').type(FREEZE_ASSET_CODE);
    cy.getByDataTestAttribute('issuer-secret-key-input').type(FREEZE_ISSUER_SECRET_KEY);
  });

  it('Should freezes an asset', () => {
    cy.getByDataTestAttribute('asset-holder-public-key-input').type(FREEZE_ASSET_HOLDER_PUBLIC_KEY);
    cy.getByDataTestAttribute('freeze-switch').find('input').check({ force: true });

    cy.getByDataTestAttribute('perform-button').click();

    cy.getByDataTestAttribute('status').should('contain', 'Asset frozen successfully!');
    cy.getByDataTestAttribute('status').within(() => {
      cy.contains('Asset frozen successfully!');
      cy.contains('See details').should('have.prop', 'href', EXPECTED_STATUS_LINK_FREEZE);
    });
  });

  it('Should unfreezes an asset', () => {
    cy.getByDataTestAttribute('asset-holder-public-key-input').type(FREEZE_ASSET_HOLDER_PUBLIC_KEY);
    cy.getByDataTestAttribute('freeze-switch').find('input').uncheck({ force: true });
    cy.getByDataTestAttribute('perform-button').click();

    cy.getByDataTestAttribute('status').should('contain', 'Asset unfrozen successfully!');
    cy.getByDataTestAttribute('status').within(() => {
      cy.contains('Asset unfrozen successfully!');
      cy.contains('See details').should('have.prop', 'href', EXPECTED_STATUS_LINK_FREEZE);
    });
  });

  it('Should show an error if the account does not exist', () => {
    cy.getByDataTestAttribute('asset-holder-public-key-input').type(
      'GWRONGPUBLICKEYXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'
    );
    cy.getByDataTestAttribute('freeze-switch').find('input').check({ force: true });
    cy.getByDataTestAttribute('perform-button').click();

    cy.getByDataTestAttribute('status').should('contain', 'Error: Failed to load account');
  });
});
