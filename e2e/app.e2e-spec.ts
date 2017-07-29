import { ObaPage } from './app.po';

describe('oba App', () => {
  let page: ObaPage;

  beforeEach(() => {
    page = new ObaPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!');
  });
});
