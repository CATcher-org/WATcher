import { AppConfig } from '../../../src/environments/environment';
import { LoginPage } from '../../page-objects/login.po';

describe("WATcher's Login Page", () => {
  let page: LoginPage;

  beforeAll(() => {
    page = new LoginPage();
    page.navigateToRoot();
  });

  it('displays "WATcher" in header bar', async () => {
    expect(await page.getTitle()).toEqual(`WATcher v${AppConfig.version}\nreceipt\nmail`);
  });

  it('allows users to authenticate themselves', async () => {
    await page.login();
    expect(await page.getConfirmationScreenTitle()).toEqual('Confirm Login Account');
    await page.confirmUser();
  });
});
