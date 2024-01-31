import { ISSUER_PUBLIC_KEY, ISSUER_SECRET_KEY, HOLDER_PUBLIC_KEY, ASSET_CODE, EXPECTED_STATUS_LINK } from '../index';

describe('Asset Freezing', () => {
  beforeEach(() => {
    cy.clearLocalStorage();

    cy.intercept(
      {
        method: 'GET',
        url: `https://horizon-testnet.stellar.org/accounts/${ISSUER_PUBLIC_KEY}`
      },
      { fixture: 'issuerAccount.json' }
    ).as('stellarIssuerGetRequest');

    cy.intercept(
      {
        method: 'GET',
        url: `https://horizon-testnet.stellar.org/accounts/${HOLDER_PUBLIC_KEY}`
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
    cy.getByDataTestAttribute('asset-code-input').type(ASSET_CODE);
    cy.getByDataTestAttribute('issuer-secret-key-input').type(ISSUER_SECRET_KEY);
  });

  it('Should freezes an asset', () => {
    cy.getByDataTestAttribute('asset-holder-public-key-input').type(HOLDER_PUBLIC_KEY);
    cy.getByDataTestAttribute('freeze-switch').find('input').check({ force: true });

    cy.getByDataTestAttribute('perform-button').click();

    cy.getByDataTestAttribute('status').should('contain', 'Asset frozen successfully!');
    cy.getByDataTestAttribute('status').within(() => {
      cy.contains('Asset frozen successfully!');
      cy.contains('See details').should('have.prop', 'href', EXPECTED_STATUS_LINK);
    });
  });

  it('Should unfreezes an asset', () => {
    cy.getByDataTestAttribute('asset-holder-public-key-input').type(HOLDER_PUBLIC_KEY);
    cy.getByDataTestAttribute('freeze-switch').find('input').uncheck({ force: true });
    cy.getByDataTestAttribute('perform-button').click();

    cy.getByDataTestAttribute('status').should('contain', 'Asset unfrozen successfully!');
    cy.getByDataTestAttribute('status').within(() => {
      cy.contains('Asset unfrozen successfully!');
      cy.contains('See details').should('have.prop', 'href', EXPECTED_STATUS_LINK);
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
