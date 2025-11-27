const readline = require('readline');

// --- DEFINICIÓN DE DATOS ---
// Equivalente a los diccionarios de Python
const PLANS = {
    "basic": { cost: 50, name: "Basic Plan" },
    "premium": { cost: 100, name: "Premium Plan" },
    "family": { cost: 150, name: "Family Plan" }
};

const FEATURES = {
    "personal_training": { cost: 30, name: "Personal Training", is_premium: false },
    "group_classes": { cost: 20, name: "Group Classes", is_premium: false },
    "exclusive_access": { cost: 50, name: "Exclusive Facilities Access", is_premium: true }
};

/**
 * Calcula el costo total aplicando las reglas del negocio.
 * @param {string} planKey - La clave del plan (ej: 'basic')
 * @param {Array} selectedFeaturesKeys - Lista de claves de características (ej: ['group_classes'])
 * @param {number} numMembers - Cantidad de personas
 */
function calculateTotalCost(planKey, selectedFeaturesKeys, numMembers) {
    // 1. Validación de disponibilidad
    if (!PLANS[planKey]) {
        console.log("Error: El plan seleccionado no es válido.");
        return -1;
    }

    for (let feat of selectedFeaturesKeys) {
        if (!FEATURES[feat]) {
            console.log(`Error: La característica '${feat}' no es válida.`);
            return -1;
        }
    }

    if (numMembers < 1) {
        console.log("Error: El número de miembros debe ser al menos 1.");
        return -1;
    }

    // 2. Costo Base y Características
    let baseCost = PLANS[planKey].cost;
    
    // Sumar costos de las características seleccionadas
    let featuresCost = 0;
    selectedFeaturesKeys.forEach(key => {
        featuresCost += FEATURES[key].cost;
    });

    // Costo unitario antes de multiplicadores
    let subtotalPerPerson = baseCost + featuresCost;

    // 3. Recargo por características Premium
    // Verificamos si alguna de las seleccionadas tiene is_premium: true
    const hasPremium = selectedFeaturesKeys.some(key => FEATURES[key].is_premium);
    
    if (hasPremium) {
        subtotalPerPerson *= 1.15; // +15% recargo
    }

    // Costo total inicial (todos los miembros)
    let totalCost = subtotalPerPerson * numMembers;

    // 4. Descuento por Grupo (10% si son 2 o más)
    if (numMembers >= 2) {
        console.log("¡Aviso! Se ha aplicado un descuento de grupo del 10%.");
        totalCost *= 0.90;
    }

    // 5. Descuentos de Oferta Especial
    if (totalCost > 400) {
        totalCost -= 50;
    } else if (totalCost > 200) {
        totalCost -= 20;
    }

    // CORRECCIÓN: Usamos Math.round para evitar errores de precisión (114.999 -> 115)
    return Math.round(totalCost);
}

// --- CONFIGURACIÓN PARA LEER DE CONSOLA (INPUT) ---
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Función auxiliar para usar 'await' al pedir datos (como el input de Python)
function ask(question) {
    return new Promise(resolve => rl.question(question, resolve));
}

// --- FUNCIÓN PRINCIPAL ---
async function main() {
    console.log("--- Gym Membership System (JS) ---");

    // Convertimos las claves a listas para acceder por índice (0, 1, 2...)
    const listOfPlans = Object.keys(PLANS);
    const listOfFeatures = Object.keys(FEATURES);

    // --- MOSTRAR MENU DE PLANES ---
    console.log("\nPlanes disponibles:");
    listOfPlans.forEach((key, index) => {
        const plan = PLANS[key];
        console.log(` ${index + 1} - ${plan.name}: $${plan.cost}`);
    });

    try {
        // Selección de Plan
        const planInput = await ask("\nSeleccione el número del plan deseado: ");
        const optionPlan = parseInt(planInput);

        if (isNaN(optionPlan) || optionPlan < 1 || optionPlan > listOfPlans.length) {
            console.log("Error: Opción de plan inválida.");
            rl.close();
            return -1;
        }

        const selectedPlanKey = listOfPlans[optionPlan - 1];

        // --- MOSTRAR MENU DE CARACTERÍSTICAS ---
        console.log("\nCaracterísticas adicionales disponibles:");
        listOfFeatures.forEach((key, index) => {
            const feat = FEATURES[key];
            const typeLabel = feat.is_premium ? "PREMIUM" : "Standard";
            console.log(` ${index + 1} - ${feat.name}: $${feat.cost} (${typeLabel})`);
        });

        console.log("\nIngrese los números de las características separadas por coma");
        console.log("(Ejemplo: '1, 3' o deje vacío si no desea ninguna):");
        const featInput = await ask("> ");

        let selectedFeaturesKeys = [];
        if (featInput.trim() !== "") {
            const optionsFeat = featInput.split(",");
            
            for (let opt of optionsFeat) {
                const cleanOpt = opt.trim();
                const idx = parseInt(cleanOpt);

                if (isNaN(idx)) {
                    console.log(`Error: '${cleanOpt}' no es un número válido.`);
                    rl.close();
                    return -1;
                }

                if (idx < 1 || idx > listOfFeatures.length) {
                    console.log(`Error: La opción '${idx}' no existe.`);
                    rl.close();
                    return -1;
                }
                
                selectedFeaturesKeys.push(listOfFeatures[idx - 1]);
            }
        }

        // --- NÚMERO DE MIEMBROS ---
        const membersInputStr = await ask("\n¿Cuántas personas se inscribirán?: ");
        const membersInput = parseInt(membersInputStr);

        // Calcular costo
        const cost = calculateTotalCost(selectedPlanKey, selectedFeaturesKeys, membersInput);

        if (cost === -1) {
            rl.close();
            return -1;
        }

        // --- CONFIRMACIÓN ---
        const planNameDisplay = PLANS[selectedPlanKey].name;
        // Mapeamos las keys a nombres bonitos
        const featuresNamesDisplay = selectedFeaturesKeys.map(k => FEATURES[k].name);

        console.log("\n" + "=".repeat(30));
        console.log(" CONFIRMACIÓN DE INSCRIPCIÓN");
        console.log("=".repeat(30));
        console.log(`Plan:        ${planNameDisplay}`);
        console.log(`Extras:      ${featuresNamesDisplay.length > 0 ? featuresNamesDisplay.join(', ') : 'Ninguno'}`);
        console.log(`Miembros:    ${membersInput}`);
        console.log("-".repeat(30));
        console.log(`TOTAL A PAGAR: $${cost}`);
        console.log("=".repeat(30));

        const confirm = await ask("\n¿Confirmar inscripción? (1 = Sí, 0 = No): ");

        if (confirm.trim() === '1') {
            console.log(`\n✅ Inscripción exitosa. Total cobrado: $${cost}`);
            rl.close();
            return cost;
        } else {
            console.log("\n❌ Inscripción cancelada por el usuario.");
            rl.close();
            return -1;
        }

    } catch (error) {
        console.log("\nError inesperado:", error);
        rl.close();
        return -1;
    }
}

// Ejecutar main si se corre directamente
if (require.main === module) {
    main();
}

// Exportamos para poder probar (test) el cálculo por separado
module.exports = { calculateTotalCost };