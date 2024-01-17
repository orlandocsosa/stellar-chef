const ASSET_CODE = 'testAsset';
const STATUS_SELECTOR = '[data-cy=status]';
const TIMEOUT = { timeout: 35000 };

const visitAssetIssuancePage = (): void => {
  cy.visit('/recipe/asset-issuance');
};

const createAsset = (assetCode: string): void => {
  cy.getByDataTestAttribute('asset-code-input').as('assetCodeInput').type(assetCode);
  cy.getByDataTestAttribute('prepare-button').click();
};

const checkKeyFormat = (container: string, keyType: string, index?: number): void => {
  const containerSelector = index !== undefined ? `${container}-${index}` : container;
  cy.getByDataTestAttribute(`${containerSelector}-container`)
    .find(`[for="${containerSelector}${keyType}Key"] div`)
    .invoke('text')
    .should('match', new RegExp(`^${keyType === 'Public' ? 'G' : 'S'}`))
    .and('have.length', 56);
};
const checkCoinInfoLink = (assetCode: string): void => {
  cy.getByDataTestAttribute('coin-info')
    .find('a')
    .invoke('attr', 'href')
    .then((href: string) => {
      const urlParts = href.split('/');
      const lastPart = urlParts[urlParts.length - 1];
      const [actualAssetCode, actualPublicKey] = lastPart.split('-');

      expect(actualAssetCode).to.equal(assetCode);
      expect(actualPublicKey).to.match(/^G/);
      expect(actualPublicKey).to.have.length(56);
    });
};
const checkAccountInfoLink = (publicKeyElement: string, linkDetailsId: string): void => {
  cy.get(publicKeyElement)
    .invoke('text')
    .then((accountId) => {
      cy.get(linkDetailsId)
        .should('have.attr', 'href')
        .and('equal', `https://stellar.expert/explorer/testnet/account/${accountId}`);
    });
};

describe('Asset Creation', () => {
  beforeEach(visitAssetIssuancePage);

  it('Should create a new asset and verifies the details links, public and secret keys for the issuer and distributor, and the coin info link', () => {
    createAsset(ASSET_CODE);

    cy.get(STATUS_SELECTOR, TIMEOUT).should(
      'contain',
      `Transaction successful. Distributor account balance: 1000000.0000000 ${ASSET_CODE}`
    );

    checkCoinInfoLink(ASSET_CODE);
    checkKeyFormat('issuer', 'Public');
    checkKeyFormat('issuer', 'Secret');
    checkAccountInfoLink('label[for="issuerPublicKey"] div', 'h3 a');

    checkKeyFormat('distributor', 'Public');
    checkKeyFormat('distributor', 'Secret');
  });

  it('Should create a new asset with "frozen" and "clawback" options enabled, verifies the keys, and the coin info link.', () => {
    cy.getByDataTestAttribute('frozen-asset').check();
    cy.getByDataTestAttribute('clawback-enabled').check();
    createAsset(ASSET_CODE);

    cy.get(STATUS_SELECTOR, TIMEOUT).should(
      'contain',
      `Transaction successful. Distributor account balance: 1000000.0000000 ${ASSET_CODE}`
    );

    checkCoinInfoLink(ASSET_CODE);
    checkKeyFormat('issuer', 'Public');
    checkKeyFormat('issuer', 'Secret');
    checkAccountInfoLink('label[for="issuerPublicKey"] div', 'h3 a');

    checkKeyFormat('distributor', 'Public');
    checkKeyFormat('distributor', 'Secret');
  });

  it('Should create a new asset with frozen and clawback options and 1 holder. Checks the details, keys and links, including holder', () => {
    cy.getByDataTestAttribute('frozen-asset').check();
    cy.getByDataTestAttribute('clawback-enabled').check();
    cy.getByDataTestAttribute('create-holders').check();
    createAsset(ASSET_CODE);

    cy.get(STATUS_SELECTOR, TIMEOUT).should(
      'contain',
      `Transaction successful. Distributor account balance: 999900.0000000 ${ASSET_CODE}`
    );

    checkCoinInfoLink(ASSET_CODE);
    checkKeyFormat('issuer', 'Public');
    checkKeyFormat('issuer', 'Secret');
    checkAccountInfoLink('label[for="issuerPublicKey"] div', 'h3 a');

    checkKeyFormat('distributor', 'Public');
    checkKeyFormat('distributor', 'Secret');

    cy.getByDataTestAttribute('toggle-holders-button').click();

    checkKeyFormat('holder', 'Public', 1);
    checkKeyFormat('holder', 'Secret', 1);
  });

  it('Should handle asset dsitribution failure with not enough funds for the holders', () => {
    cy.getByDataTestAttribute('distributor-payment-amount-input').clear().type('100');
    cy.getByDataTestAttribute('create-holders').check();
    cy.getByDataTestAttribute('number-of-holders-input').clear().type('4');
    cy.getByDataTestAttribute('balance-per-holder-input').clear().type('1000');
    createAsset(ASSET_CODE);

    cy.get(STATUS_SELECTOR, TIMEOUT).should(
      'contain',
      'Error: Not enough funds for distributor account to create holders.'
    );
  });
});
