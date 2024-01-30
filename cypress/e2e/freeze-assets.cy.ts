const TEST_ASSET_CODE = 'testCoin';
const TEST_ISSUER_PUBLIC_KEY = 'GDJ4QQ7HKBO2P44BUDCKYBFZCVGPRDOFRXLTHMFZ3DFVEQDWVGIR3WGR';
const TEST_ISSUER_SECRET_KEY = 'SDLHQKNDTHFZM3X44VACP3ZTLAKEI2ACAVIJIH7GHAMKLZWCDWJDCUQO';
const TEST_ASSET_HOLDER_PUBLIC_KEY = 'GDY2JIGRR5JQFXBM2CP6AAV4W3TYMI6KIAXMWEBFCGYXY2ON3Y5LRLIS';
const FREEZE_TRANSACTION_ID = '1a33a9ca4e0fbf72c0108af38921142a9b2344923ac4d864c7c53e2f8a30b014';

describe('Asset Freezing', () => {
  beforeEach(() => {
    cy.intercept(
      {
        method: 'GET',
        url: `https://horizon-testnet.stellar.org/accounts/${TEST_ISSUER_PUBLIC_KEY}`
      },
      { fixture: 'freeze-assets/stellarIssuerGetResponse.json' }
    ).as('stellarIssuerGetRequest');

    cy.intercept(
      {
        method: 'GET',
        url: `https://horizon-testnet.stellar.org/accounts/${TEST_ASSET_HOLDER_PUBLIC_KEY}`
      },
      { fixture: 'freeze-assets/stellarHolderGetResponse.json' }
    ).as('stellarHolderGetRequest');

    cy.intercept(
      {
        method: 'POST',
        url: 'https://horizon-testnet.stellar.org/transactions'
      },
      { fixture: 'freeze-assets/stellarTransactionPostResponse.json' }
    ).as('stellarTransactionPostRequest');

    cy.intercept(
      {
        method: 'GET',
        url: 'https://horizon-testnet.stellar.org/accounts/GWRONGPUBLICKEYXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'
      },
      {
        statusCode: 400,
        fixture: 'freeze-assets/stellarTransactionFailPostResponse.json'
      }
    ).as('stellarWrongAccountGetRequest');

    cy.visit('/recipe/freeze-assets');
    cy.getByDataTestAttribute('asset-code-input').type(TEST_ASSET_CODE);
    cy.getByDataTestAttribute('issuer-secret-key-input').type(TEST_ISSUER_SECRET_KEY);
  });

  it('Should freezes an asset', () => {
    cy.getByDataTestAttribute('asset-holder-public-key-input').type(TEST_ASSET_HOLDER_PUBLIC_KEY);
    cy.getByDataTestAttribute('freeze-switch').find('input').check({ force: true });

    cy.getByDataTestAttribute('perform-button').click();

    cy.getByDataTestAttribute('status').should('contain', 'Asset frozen successfully!');
    cy.getByDataTestAttribute('status').within(() => {
      cy.contains('Asset frozen successfully!');
      cy.contains('See details').should(
        'have.prop',
        'href',
        `https://stellar.expert/explorer/testnet/tx/${FREEZE_TRANSACTION_ID}`
      );
    });
  });

  it('Should unfreezes an asset', () => {
    cy.getByDataTestAttribute('asset-holder-public-key-input').type(TEST_ASSET_HOLDER_PUBLIC_KEY);
    cy.getByDataTestAttribute('freeze-switch').find('input').uncheck({ force: true });
    cy.getByDataTestAttribute('perform-button').click();

    cy.getByDataTestAttribute('status').should('contain', 'Asset unfrozen successfully!');
    cy.getByDataTestAttribute('status').within(() => {
      cy.contains('Asset unfrozen successfully!');
      cy.contains('See details').should(
        'have.prop',
        'href',
        `https://stellar.expert/explorer/testnet/tx/${FREEZE_TRANSACTION_ID}`
      );
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
