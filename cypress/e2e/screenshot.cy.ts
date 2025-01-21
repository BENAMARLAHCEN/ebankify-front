// cypress/e2e/screenshot.cy.ts
describe('Screenshot Testing', () => {
    beforeEach(() => {
      cy.visit('/auth/login');
    });
  
    it('should capture screenshot of login page', () => {
      cy.screenshot('login-page');
    });
  
    it('should capture screenshot on failure', () => {
      // This test will fail and automatically take a screenshot
      cy.get('non-existent-element').should('exist');
    });
  });