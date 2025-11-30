const { calculateTotalCost } = require('./gym_system');

describe('Pruebas del Sistema de Gimnasio', () => {

    // Test: Costo base + features simples
    test('Calculo basico: Plan Basic + Personal Training (1 persona)', () => {
        // Basic ($50) + Personal Training ($30) = 80
        const result = calculateTotalCost("basic", ["personal_training"], 1);
        expect(result).toBe(80);
    });

    // Test: Descuento grupal (10%)
    test('Descuento grupal: Plan Premium (2 personas)', () => {
        // Premium ($100). 2 personas -> Base 200.
        // Descuento 10% -> 180.
        // 180 < 200, así que no hay descuento extra.
        const result = calculateTotalCost("premium", [], 2);
        expect(result).toBe(180);
    });

    // Test: Recargo Premium (15%)
    test('Recargo Premium: Plan Basic + Acceso Exclusivo', () => {
        // Basic ($50) + Exclusive Access ($50 - Premium).
        // Subtotal = 100.
        // Recargo 15% -> 115.
        const result = calculateTotalCost("basic", ["exclusive_access"], 1);
        expect(result).toBe(115);
    });

    // Test: Descuento Especial (> $200)
    test('Descuento Especial > 200: Family + Acceso Exclusivo', () => {
        // Family ($150) + Exclusive ($50 Premium).
        // Subtotal base = 200. 
        // Recargo premium 15% -> 230.
        // Como 230 > 200, resta $20 -> Total 210.
        const result = calculateTotalCost("family", ["exclusive_access"], 1);
        expect(result).toBe(210);
    });

    // Test: Descuento Especial (> $400)
    test('Descuento Especial > 400: Premium x 5 personas', () => {
        // Premium ($100) * 5 = 500.
        // Descuento grupo 10% -> 450.
        // Como 450 > 400, resta $50 -> Total 400.
        const result = calculateTotalCost("premium", [], 5);
        expect(result).toBe(400);
    });

    // Test: Manejo de errores
    test('Retorna -1 si el plan es invalido', () => {
        const result = calculateTotalCost("plan_inexistente", [], 1);
        expect(result).toBe(-1);
    });

    test('Retorna -1 si la caracteristica es invalida', () => {
        const result = calculateTotalCost("basic", ["masaje_spa"], 1);
        expect(result).toBe(-1);
    });

    test('Retorna -1 si numero de miembros es 0', () => {
        const result = calculateTotalCost("basic", [], 0);
        expect(result).toBe(-1);
    });
});