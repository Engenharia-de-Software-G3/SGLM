// Teste simples para verificar se o Jest funciona
describe('Testes Básicos', () => {
  test('deve somar 2 + 2', () => {
    expect(2 + 2).toBe(4);
  });

  test('deve verificar se string contém texto', () => {
    expect('Hello World').toContain('World');
  });

  test('deve verificar se array tem elemento', () => {
    const array = ['a', 'b', 'c'];
    expect(array).toContain('b');
  });
});