import { JWT } from "google-auth-library";
import { GoogleSpreadsheet } from "google-spreadsheet";
import dotenv from 'dotenv'; 
dotenv.config(); 

const SCOPES: string[] = [
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/drive.file",
];

class GoogleSheetService {
  jwtFromEnv: JWT | undefined;
  doc: GoogleSpreadsheet | undefined;

  constructor(id: string | undefined = undefined) {
    if (!id) {
      throw new Error("ID_UNDEFINED");
    }

    this.jwtFromEnv = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
      key: process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, "\n"),
      scopes: SCOPES,
    });
    this.doc = new GoogleSpreadsheet(id, this.jwtFromEnv);
  }

  searchAndReturnRowByPhoneNumber = async (phoneNumber: string): Promise<any | null> => {
    try {
        await this.doc!.loadInfo();

        const sheet = this.doc!.sheetsByIndex[0]; 

        const rows = await sheet.getRows();

        // Remover el carácter "-" de phoneNumber
        const sanitizedPhoneNumber = phoneNumber.replace(/-/g, '');

        for (const row of rows) {
            // Remover "-" de columCedula
            const columNombre = row.get('Nombre'); 
            const columTelefono = row.get('Telefono').replace(/-/g, '');
            const columInicial = row.get('Saldo Inicial'); 
            const columDisponible = row.get('Saldo Disponible'); 
            const columCompras = row.get('ID de Compras');

            if (columTelefono === sanitizedPhoneNumber) {
                const foundObject = {
                    nombre: columNombre || '',
                    telefono: columTelefono || '', // Cedula sin guiones
                    inicial: columInicial || '',
                    disponible: columDisponible || '',
                    compras: columCompras || ''
                };

                return foundObject; 
            }
        }

        return null; 
    } catch (err) {
        console.error("Error en searchAndReturnRowByPhoneNumber:", err);
        return null; 
    }
};


updateSaldoDisponibleByPhoneNumber = async (phoneNumber: string, cantidad: number): Promise<any | null> => {
  try {
      // Cargar la información del documento
      await this.doc!.loadInfo();
      
      // Seleccionar la primera hoja
      const sheet = this.doc!.sheetsByIndex[0]; 

      // Obtener todas las filas
      const rows = await sheet.getRows(); // Puedes pasar { limit, offset } si necesitas paginación

      // Limpiar el número de teléfono de guiones
      const sanitizedPhoneNumber = phoneNumber.replace(/-/g, '');

      // Recorrer las filas de la hoja
      for (const row of rows) {
          // Obtener el teléfono en la fila y limpiar guiones
          const columTelefono = (row.get('Telefono') || '').replace(/-/g, '');
          const columDisponible = parseFloat(row.get('Saldo Disponible')) || 0; // Convertir a número
          
          // Verificar si el teléfono coincide
          if (columTelefono === sanitizedPhoneNumber) {
              // Restar la cantidad enviada por parámetro al saldo disponible
              const nuevoSaldo = columDisponible - cantidad;

              // Evitar saldo negativo
              if (nuevoSaldo < 0) {
                  console.log('El saldo no puede ser negativo.');
                  return null; 
              }

              // Usar .set() para actualizar la columna 'Saldo Disponible'
              row.set('Saldo Disponible', nuevoSaldo.toString()); // Convertir a string antes de guardar

              // Guardar los cambios en la fila
              await row.save();

              console.log(`Saldo actualizado para el teléfono: ${sanitizedPhoneNumber}`);
              
              return {
                  telefono: columTelefono,
                  saldoDisponibleAnterior: columDisponible,
                  saldoDisponibleActualizado: nuevoSaldo
              };
          }
      }

      console.log('Número de teléfono no encontrado.');
      return null; // No se encontró el número
  } catch (err) {
      console.error("Error en updateSaldoDisponibleByPhoneNumber:", err);
      return null;
  }
};



reenviarPdf = async (phoneNumber: string): Promise<any | null> => {
  try {
      await this.doc!.loadInfo();

      const sheet = this.doc!.sheetsByIndex[1]; 

      const rows = await sheet.getRows();


      for (const row of rows) {

          const columId = row.get('ID'); 
          const columFolio = row.get('Folio'); 
          const columTelefono = row.get('Telefono').replace(/-/g, '');
          const columDatos = row.get('Datos'); 
          const columPaqueteria = row.get('Paqueteria'); 
          const columTipo = row.get('Tipo');
          const columPeso = row.get('Peso');
          const columPrecio = row.get('Precio');
          const columFecha = row.get('Fecha');
          const columHora = row.get('Hora');
          const columProveedor = row.get('Proveedor');

          if (columId === phoneNumber) {
              const foundObject = {
                  id: columId || '',
                  folio: columFolio || '',
                  telefono: columTelefono || '', 
                  datos: columDatos || '',
                  paqueteria: columPaqueteria || '',
                  tipo: columTipo || '',
                  peso: columPeso || '',
                  precio: columPrecio || '',
                  fecha: columFecha || '',
                  hora: columHora || '',
                  proveedor: columProveedor || ''                 
              };

              return foundObject; 
          }
      }

      return null; 
  } catch (err) {
      console.error("Error en searchAndReturnRowByPhoneNumber:", err);
      return null; 
  }
};

buscarProveedores = async (phoneNumber: string): Promise<any | null> => {
  try {
      await this.doc!.loadInfo();

      const sheet = this.doc!.sheetsByIndex[2]; 

      const rows = await sheet.getRows();

      for (const row of rows) {
          const columPaqueteria = row.get('Paqueteria'); 
          const columNombre = row.get('Nombre')
          const columTelefono = row.get('Telefono'); 


          if (columPaqueteria === phoneNumber) {
              const foundObject = {
                  paqueteria: columPaqueteria || '',
                  nombre: columNombre || '',
                  telefono: columTelefono || '',
              };

              return foundObject; 
          }
      }

      return null; 
  } catch (err) {
      console.error("Error en buscar proveedor:", err);
      return null; 
  }
};

buscarPreciosporKg = async (sheetName: string): Promise<any[]> => {
  try {
    await this.doc!.loadInfo();

    // Acceder a la hoja usando el nombre proporcionado como parámetro
    const sheet = this.doc!.sheetsByTitle[sheetName];  
    if (!sheet) {
      throw new Error(`No se encontró una hoja con el nombre: ${sheetName}`);
    }

    const rows = await sheet.getRows();

    const results = [];

    for (const row of rows) {
      const columPeso = row.get('Peso Kg'); 
      const columTerrestre = row.get('Terrestre'); 
      const columExpress = row.get('Express'); 
      const columCostoT = row.get('Costo Terrestre');
      const columCostoE = row.get('Costo Express');

      const foundObject = {
        kg: columPeso || '',
        terrestre: columTerrestre || '',
        express: columExpress|| '',
        costoT: columCostoT|| '',
        costoE: columCostoE|| ''
      };

      results.push(foundObject);
    }

    return results; 
  } catch (err) {
    console.error("Error en buscarPreciosporKg:", err);
    return []; // Retorna un array vacío en caso de error
  }
};



searchBlackList = async (phoneNumber: string): Promise<any | null> => {
  try {
      await this.doc!.loadInfo();

      const sheet = this.doc!.sheetsByIndex[1]; 

      const rows = await sheet.getRows();

      for (const row of rows) {
          const numTelefono = row.get('Telefono'); // Obtener el número de unidad

          if (
              numTelefono === phoneNumber
          ) {
              const foundObject = true;

              return foundObject; 
          }
      }

      return null;
  } catch (err) {
      console.error("Error en searchAndReturnRowByPhoneNumber:", err);
      return null; // Manejar el error y retornar null
  }
};

  
saveOrder = async (data: {
  id: string,
  folio: string,
  telefono: string,
  datos: string,
  paqueteria: string,
  tipo: string,
  peso: number,
  precio: number,
  fecha: string,
  hora: string,
  proveedor: string
}): Promise<any> => {
  try {
    await this.doc!.loadInfo();
    const sheet = this.doc!.sheetsByIndex[1]; // La segunda hoja

    const order = await sheet.addRow({
      ID: data.id,
      Folio: data.folio,
      Telefono: data.telefono,
      Datos: data.datos,
      Paqueteria: data.paqueteria,
      Tipo: data.tipo,
      Peso: data.peso,
      Precio: data.precio,
      Fecha: data.fecha,
      Hora: data.hora,
      Proveedor: data.proveedor
    });

    return order;
  } catch (err) {
    console.log("Error:", err);
    return null;
  }
};
}

export default GoogleSheetService;



