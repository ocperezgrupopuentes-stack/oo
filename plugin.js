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



/*
=======================================
FORMIT AI MODELER V2
Generador de muros y habitaciones
=======================================
*/

// CONVERSION DE METROS A UNIDADES WSM

function aiMetros(valor) {
    return Number(valor) / 0.3048;
}

// LEER VALORES DE LA INTERFAZ

function aiLeer(id) {
    return Number(
        document.getElementById(id).value
    );
}

// CREAR BLOQUE 3D

async function aiCrearBloque(
    historial,
    x1, y1, z1,
    x2, y2, z2
) {

    const punto1 = await WSM.Geom.Point3d(
        x1, y1, z1
    );

    const punto2 = await WSM.Geom.Point3d(
        x2, y2, z2
    );

    const resultado = await WSM.APICreateBlock(
        historial,
        punto1,
        punto2
    );

    console.log("Bloque generado:", resultado);

    return resultado;
}

/*
=======================================
V1 - GENERADOR DE MUROS
=======================================
*/

async function aiCrearMuro(
    largo,
    altura,
    espesor
) {

    const L = aiMetros(largo);
    const H = aiMetros(altura);
    const E = aiMetros(espesor);

    const historial =
        await FormIt.GroupEdit.GetEditingHistoryID();

    return await aiCrearBloque(
        historial,
        0, 0, 0,
        L, E, H
    );
}

// BOTON GENERAR MURO

document.getElementById("CreateWallBtn")
    .addEventListener("click", async function () {

    const L = aiLeer("WallLength");
    const H = aiLeer("WallHeight");
    const E = aiLeer("WallThickness");

    const estado =
        document.getElementById("WallStatus");

    if (![L, H, E].every(
        n => Number.isFinite(n) && n > 0
    )) {
        estado.textContent =
            "ERROR: Dimensiones invalidas.";
        return;
    }

    try {

        estado.textContent = "Generando muro...";

        await aiCrearMuro(L, H, E);

        estado.textContent =
            "Muro generado correctamente.";

    } catch (error) {

        console.error("Error muro:", error);

        estado.textContent =
            "ERROR: " + (error.message || String(error));
    }

});

/*
=======================================
V2 - GENERADOR DE HABITACIONES
=======================================
*/

async function aiCrearHabitacion(
    largo,
    ancho,
    altura,
    espesor,
    x, y, z
) {

    // CONVERTIR MEDIDAS

    const L = aiMetros(largo);
    const A = aiMetros(ancho);
    const H = aiMetros(altura);
    const E = aiMetros(espesor);

    const X = aiMetros(x);
    const Y = aiMetros(y);
    const Z = aiMetros(z);

    // OBTENER HISTORIAL ACTIVO

    const historial =
        await FormIt.GroupEdit.GetEditingHistoryID();

    // FUNCION INTERNA PARA CREAR CADA MURO

    async function muro(x1, y1, x2, y2) {

        return await aiCrearBloque(
            historial,
            x1, y1, Z,
            x2, y2, Z + H
        );

    }

    // MURO FRONTAL

    await muro(
        X, Y,
        X + L, Y + E
    );

    // MURO POSTERIOR

    await muro(
        X, Y + A - E,
        X + L, Y + A
    );

    // MURO IZQUIERDO

    await muro(
        X, Y + E,
        X + E, Y + A - E
    );

    // MURO DERECHO

    await muro(
        X + L - E, Y + E,
        X + L, Y + A - E
    );

    console.log(
        "Los cuatro muros fueron procesados."
    );
}

/*
=======================================
BOTON GENERAR HABITACION
=======================================
*/

document.getElementById("CreateRoomBtn")
    .addEventListener("click", async function () {

    const L = aiLeer("RoomLength");
    const A = aiLeer("RoomWidth");
    const H = aiLeer("RoomHeight");
    const E = aiLeer("RoomThickness");

    const X = aiLeer("RoomX");
    const Y = aiLeer("RoomY");
    const Z = aiLeer("RoomZ");

    const estado =
        document.getElementById("RoomStatus");

    // VALIDAR DATOS

    if (
        ![L, A, H, E, X, Y, Z].every(Number.isFinite) ||
        L <= 0 ||
        A <= 0 ||
        H <= 0 ||
        E <= 0 ||
        E * 2 >= Math.min(L, A)
    ) {

        estado.textContent =
            "ERROR: Verifica las dimensiones.";

        return;
    }

    try {

        estado.textContent =
            "Generando habitacion...";

        await aiCrearHabitacion(
            L, A, H, E,
            X, Y, Z
        );

        estado.textContent =
            "Habitacion creada correctamente.";

    } catch (error) {

        console.error(
            "Error habitacion:", error
        );

        estado.textContent =
            "ERROR: " + (
                error.message || String(error)
            );

    }

});
