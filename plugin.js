const createBlock = async (w,l,h) => {
    const pt1 = await WSM.Geom.Point3d(0,0,0);
    const pt2 = await WSM.Geom.Point3d(w,l,h);
    const histID = await FormIt.GroupEdit.GetEditingHistoryID();
    console.log(histID, pt1, pt2)

    const test = await WSM.APICreateBlock(histID, pt1, pt2);
}

document.getElementById("CreateBlockBtn").addEventListener("click", () => {
    const w = Number(document.getElementById("Width").value);
    const h = Number(document.getElementById("Height").value);
    const l = Number(document.getElementById("Length").value);

    createBlock(w,l,h);
});

/* FormIt AI Modeler - Muro V1 */

// Convierte metros a unidades internas de FormIt
async function convertirMetros(valor) {
    const dato = await FormIt.StringConversion
        .StringToLinearValue(`${valor} m`);

    const numero = typeof dato === "number"
        ? dato
        : dato && dato.result;

    if (!Number.isFinite(numero) ||
        (dato && dato.success === false)) {
        throw new Error("No se pudo convertir la medida");
    }

    return numero;
}

// Crear muro
async function crearMuro(largo, altura, espesor) {

    const L = await convertirMetros(largo);
    const H = await convertirMetros(altura);
    const E = await convertirMetros(espesor);

    const histID =
        await FormIt.GroupEdit.GetEditingHistoryID();

    // Punto inferior del muro
    const inicio = await WSM.Geom.Point3d(
        0, 0, 0
    );

    // Punto superior opuesto
    const final = await WSM.Geom.Point3d(
        L, E, H
    );

    const muro = await WSM.APICreateBlock(
        histID,
        inicio,
        final
    );

    console.log("Muro creado:", muro);
    return muro;
}

// Boton de la interfaz
document.getElementById("CreateWallBtn")
    .addEventListener("click", async () => {

    const estado =
        document.getElementById("WallStatus");

    const L = Number(
        document.getElementById("WallLength").value
    );

    const H = Number(
        document.getElementById("WallHeight").value
    );

    const E = Number(
        document.getElementById("WallThickness").value
    );

    if (![L, H, E].every(
        n => Number.isFinite(n) && n > 0
    )) {
        estado.textContent =
            "Introduce dimensiones mayores que cero.";
        return;
    }

    try {
        estado.textContent = "Creando muro...";

        await crearMuro(L, H, E);

        estado.textContent =
            "Muro generado correctamente.";

    } catch (error) {
        console.error("Error al crear muro:", error);
        estado.textContent =
            "Error al generar el muro. Revisa Script Output.";
    }
});