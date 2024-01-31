import { ISSUER_SECRET_KEY, HOLDER_PUBLIC_KEY, ASSET_CODE, EXPECTED_STATUS_LINK } from '../index';

describe('Test Clawback Page', () => {
  beforeEach(() => {
    cy.clearLocalStorage();

    cy.intercept('GET', 'https://horizon-testnet.stellar.org/accounts/*', (req) => {
      req.reply({ fixture: 'issuerAccount.json' });
    });

    cy.intercept('POST', 'https://horizon-testnet.stellar.org/transactions', (req) => {
      req.reply({ fixture: 'transaction.json' });
    });
    cy.intercept(
      {
        method: 'GET',
        url: `https://horizon-testnet.stellar.org/accounts/${HOLDER_PUBLIC_KEY}`
      },
      { fixture: 'holderAccount.json' }
    ).as('stellarHolderGetRequest');

    cy.visit('/recipe/clawback');
  });

  it('Should performs clawback of 100 testCoin when button is clicked, and verifies the status', () => {
    cy.getByDataTestAttribute('asset-code-input').should('be.visible').type(ASSET_CODE);
    cy.getByDataTestAttribute('issuer-secret-key-input').should('be.visible').type(ISSUER_SECRET_KEY);
    cy.getByDataTestAttribute('clawback-account-input').should('be.visible').type(HOLDER_PUBLIC_KEY);
    cy.getByDataTestAttribute('is-clawback-all-enabled-checkbox').should('be.visible').uncheck();
    cy.getByDataTestAttribute('amount-input').should('be.visible').type('100');

    cy.getByDataTestAttribute('clawback-button').click();

    cy.getByDataTestAttribute('status').within(() => {
      cy.contains('Transaction successful');
      cy.contains('See details').should('have.prop', 'href', EXPECTED_STATUS_LINK);
    });
  });

  it('Should perform a full clawback when checkbox is ticked', () => {
    cy.getByDataTestAttribute('asset-code-input').should('be.visible').type(ASSET_CODE);
    cy.getByDataTestAttribute('issuer-secret-key-input').should('be.visible').type(ISSUER_SECRET_KEY);
    cy.getByDataTestAttribute('clawback-account-input').should('be.visible').type(HOLDER_PUBLIC_KEY);
    cy.getByDataTestAttribute('is-clawback-all-enabled-checkbox').should('be.visible').check();

    cy.getByDataTestAttribute('clawback-button').click();

    cy.getByDataTestAttribute('status').within(() => {
      cy.contains('Transaction successful');
      cy.contains('See details').should('have.prop', 'href', EXPECTED_STATUS_LINK);
    });
  });

  it('Should try to perform clawback when button is clicked, but fails because the available balance is less than the amount', () => {
    cy.getByDataTestAttribute('asset-code-input').should('be.visible').type(ASSET_CODE);
    cy.getByDataTestAttribute('issuer-secret-key-input').should('be.visible').type(ISSUER_SECRET_KEY);
    cy.getByDataTestAttribute('clawback-account-input').should('be.visible').type(HOLDER_PUBLIC_KEY);
    cy.getByDataTestAttribute('is-clawback-all-enabled-checkbox').should('be.visible').uncheck();
    cy.getByDataTestAttribute('amount-input').should('be.visible').type('10000000');

    cy.getByDataTestAttribute('clawback-button').click();

    cy.getByDataTestAttribute('status').should(
      'contain',
      'An error occurred: The amount for clawback (10000000) is greater than the available balance (999900.0000000)'
    );
  });
});

it('Should show an error message when transaction fails', () => {
  cy.intercept('POST', 'https://horizon-testnet.stellar.org/transactions', { fixture: 'transactionFail.json' }).as(
    'performClawback'
  );

  cy.intercept('GET', `https://horizon-testnet.stellar.org/accounts/${HOLDER_PUBLIC_KEY}`, {
    fixture: 'holderAccount.json'
  }).as('loadholderAccountRequest');

  cy.visit('/recipe/clawback');
  cy.getByDataTestAttribute('asset-code-input').should('be.visible').type(ASSET_CODE);
  cy.getByDataTestAttribute('issuer-secret-key-input').should('be.visible').type(ISSUER_SECRET_KEY);
  cy.getByDataTestAttribute('clawback-account-input').should('be.visible').type(HOLDER_PUBLIC_KEY);
  cy.getByDataTestAttribute('is-clawback-all-enabled-checkbox').should('be.visible').check();

  cy.getByDataTestAttribute('clawback-button').click();

  cy.getByDataTestAttribute('status').should(
    'contain',
    'An error occurred: Clawback of 999900.0000000 testCoin failed.'
  );
});
