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

/* FORMIT AI MODELER V3 - PUERTA */

// Convertir metros a unidades WSM
function v3m(valor) {
    return valor / 0.3048;
}

// Crear bloque y devolver su identificador
async function v3Bloque(hist, x1, y1, z1, x2, y2, z2) {

    const p1 = await WSM.Geom.Point3d(x1, y1, z1);
    const p2 = await WSM.Geom.Point3d(x2, y2, z2);

    const id = await WSM.APICreateBlock(
        hist, p1, p2
    );

    if (!Number.isInteger(id) || id < 0) {
        throw new Error(
            "FormIt no devolvio un ID de bloque valido: " +
            JSON.stringify(id)
        );
    }

    return id;
}

// Crear habitacion con puerta
async function v3Habitacion(datos) {

    const {
        largo, ancho, altura, espesor,
        x, y, z,
        puertaAncho, puertaAlto, puertaOffset
    } = datos;

    const L = v3m(largo);
    const A = v3m(ancho);
    const H = v3m(altura);
    const E = v3m(espesor);

    const X = v3m(x);
    const Y = v3m(y);
    const Z = v3m(z);

    const PW = v3m(puertaAncho);
    const PH = v3m(puertaAlto);
    const PO = v3m(puertaOffset);

    const hist =
        await FormIt.GroupEdit.GetEditingHistoryID();

    // 1. Crear muro frontal completo
    const frontal = await v3Bloque(
        hist,
        X, Y, Z,
        X + L, Y + E, Z + H
    );

    // 2. Crear volumen cortador de la puerta
    // Sobresale 2 cm del muro para asegurar
    // el corte completo del espesor.
    const margen = v3m(0.02);

    const cortador = await v3Bloque(
        hist,
        X + PO, Y - margen, Z - margen,
        X + PO + PW, Y + E + margen, Z + PH
    );

    // 3. Restar cortador del muro frontal
    await WSM.APISubtract(
        hist,
        frontal,
        cortador
    );

    console.log("Sustraccion puerta ejecutada");

    // 4. Crear muro posterior
    await v3Bloque(
        hist,
        X, Y + A - E, Z,
        X + L, Y + A, Z + H
    );

    // 5. Crear muro izquierdo
    await v3Bloque(
        hist,
        X, Y + E, Z,
        X + E, Y + A - E, Z + H
    );

    // 6. Crear muro derecho
    await v3Bloque(
        hist,
        X + L - E, Y + E, Z,
        X + L, Y + A - E, Z + H
    );
}

// Conectar boton V3
document.getElementById("CreateDoorRoomBtn")
.addEventListener("click", async () => {

    const leer = id => Number(
        document.getElementById(id).value
    );

    const estado =
        document.getElementById("DoorRoomStatus");

    const datos = {
        largo: leer("RoomLength"),
        ancho: leer("RoomWidth"),
        altura: leer("RoomHeight"),
        espesor: leer("RoomThickness"),
        x: leer("RoomX"),
        y: leer("RoomY"),
        z: leer("RoomZ"),
        puertaAncho: leer("DoorWidth"),
        puertaAlto: leer("DoorHeight"),
        puertaOffset: leer("DoorOffset")
    };

    const d = datos;

    if (
        !Object.values(d).every(Number.isFinite) ||
        d.largo <= 0 ||
        d.ancho <= 0 ||
        d.altura <= 0 ||
        d.espesor <= 0 ||
        d.espesor * 2 >= Math.min(d.largo, d.ancho) ||
        d.puertaAncho <= 0 ||
        d.puertaAlto <= 0 ||
        d.puertaAlto >= d.altura ||
        d.puertaOffset <= 0 ||
        d.puertaOffset + d.puertaAncho >= d.largo
    ) {
        estado.textContent =
            "ERROR: Revisa dimensiones de habitacion y puerta.";
        return;
    }

    try {
        estado.textContent =
            "Creando habitacion con puerta...";

        await v3Habitacion(datos);

        estado.textContent =
            "Operacion ejecutada. Verifica la abertura en 3D.";

    } catch (error) {
        console.error("Error V3:", error);

        estado.textContent =
            "ERROR: " + (
                error.message || String(error)
            );
    }
});

