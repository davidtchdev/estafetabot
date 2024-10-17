import fs from 'fs';

const archivoJSON: string = './telefonos.json'; // Nombre del archivo JSON predeterminado

// Función para buscar un número de teléfono y agregarlo al JSON
export function agregarTelefono(numero: string): boolean {
  try {
    let telefonos: Record<string, boolean>;
    if (fs.existsSync(archivoJSON)) {
      const data: string = fs.readFileSync(archivoJSON, 'utf8');
      telefonos = JSON.parse(data);
    } else {
      telefonos = {};
    }

    if (Object.prototype.hasOwnProperty.call(telefonos, numero)) {
      return false; // El número ya existe en el JSON
    } else {
      telefonos[numero] = true;
      fs.writeFileSync(archivoJSON, JSON.stringify(telefonos, null, 2));
      return true; // Número agregado con éxito
    }
  } catch (error) {
    console.error('Error al agregar/buscar el número de teléfono:', error);
    return false;
  }
}
