const ASSET_CODE = 'testAsset';
const STATUS_SELECTOR = '[data-cy=status]';
const TIMEOUT = { timeout: 35000 };
const EXPECTED_STELLAR_EXPERT_ASSET_URL = 'https://stellar.expert/explorer/testnet/asset/testAsset';
const EXPECTED_STELLAR_EXPERT_ACCOUNT_URL = 'https://stellar.expert/explorer/testnet/account/';

describe('Asset Creation', () => {
  beforeEach(() => {
    cy.visit('/recipe/asset-issuance');
    cy.getByDataTestAttribute('asset-code-input').type(ASSET_CODE);
  });

  it('Should create a new asset and verifies the details links, the coin info link and the status', () => {
    cy.getByDataTestAttribute('prepare-button').click();

    cy.get(STATUS_SELECTOR, TIMEOUT).should(
      'contain',
      `Transaction successful. Distributor account balance: 1000000.0000000 ${ASSET_CODE}`
    );

    cy.getByDataTestAttribute('issuer-info-link')
      .should('be.visible')
      .should('have.prop', 'href')
      .and('include', EXPECTED_STELLAR_EXPERT_ACCOUNT_URL);

    cy.getByDataTestAttribute('distributor-info-link')
      .should('be.visible')
      .should('have.prop', 'href')
      .and('include', EXPECTED_STELLAR_EXPERT_ACCOUNT_URL);

    cy.getByDataTestAttribute('coin-info-link')
      .should('be.visible')
      .should('have.prop', 'href')
      .and('include', EXPECTED_STELLAR_EXPERT_ASSET_URL);
  });

  it('Should create a new asset with "frozen" and "clawback" options enabled, verifies the details links, the coin info link, and the status', () => {
    cy.getByDataTestAttribute('frozen-asset').check();
    cy.getByDataTestAttribute('clawback-enabled').check();
    cy.getByDataTestAttribute('prepare-button').click();

    cy.get(STATUS_SELECTOR, TIMEOUT).should(
      'contain',
      `Transaction successful. Distributor account balance: 1000000.0000000 ${ASSET_CODE}`
    );

    cy.getByDataTestAttribute('issuer-info-link')
      .should('be.visible')
      .should('have.prop', 'href')
      .and('include', EXPECTED_STELLAR_EXPERT_ACCOUNT_URL);

    cy.getByDataTestAttribute('distributor-info-link')
      .should('be.visible')
      .should('have.prop', 'href')
      .and('include', EXPECTED_STELLAR_EXPERT_ACCOUNT_URL);

    cy.getByDataTestAttribute('coin-info-link')
      .should('be.visible')
      .should('have.prop', 'href')
      .and('include', EXPECTED_STELLAR_EXPERT_ASSET_URL);
  });

  it('Should create a new asset with frozen and clawback options and 1 holder. Checks the details, keys and links, including holder', () => {
    cy.getByDataTestAttribute('frozen-asset').check();
    cy.getByDataTestAttribute('clawback-enabled').check();
    cy.getByDataTestAttribute('create-holders').check();
    cy.getByDataTestAttribute('prepare-button').click();

    cy.get(STATUS_SELECTOR, TIMEOUT).should(
      'contain',
      `Transaction successful. Distributor account balance: 999900.0000000 ${ASSET_CODE}`
    );

    cy.getByDataTestAttribute('issuer-info-link')
      .should('be.visible')
      .should('have.prop', 'href')
      .and('include', EXPECTED_STELLAR_EXPERT_ACCOUNT_URL);

    cy.getByDataTestAttribute('distributor-info-link')
      .should('be.visible')
      .should('have.prop', 'href')
      .and('include', EXPECTED_STELLAR_EXPERT_ACCOUNT_URL);

    cy.getByDataTestAttribute('coin-info-link')
      .should('be.visible')
      .should('have.prop', 'href')
      .and('include', EXPECTED_STELLAR_EXPERT_ASSET_URL);

    cy.getByDataTestAttribute('toggle-holders-button').click();

    cy.getByDataTestAttribute('holder-1-info-link')
      .should('be.visible')
      .should('have.prop', 'href')
      .and('include', EXPECTED_STELLAR_EXPERT_ACCOUNT_URL);
  });

  it('Should handle asset dsitribution failure with not enough funds for the holders', () => {
    cy.getByDataTestAttribute('distributor-payment-amount-input').clear().type('100');
    cy.getByDataTestAttribute('create-holders').check();
    cy.getByDataTestAttribute('number-of-holders-input').clear().type('4');
    cy.getByDataTestAttribute('balance-per-holder-input').clear().type('1000');
    cy.getByDataTestAttribute('prepare-button').click();

    cy.get(STATUS_SELECTOR, TIMEOUT).should(
      'contain',
      'Error: Not enough funds for distributor account to create holders.'
    );
  });
});
