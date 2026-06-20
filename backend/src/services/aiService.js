const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

class AIService {
    static async reconocerPlaca(imagePath) {
        try {
            // Tu token real ya puesto y activo
            const TOKEN = 'f92d83a35d1b84631f377308130b6bd3cb496f10'; 

            const formData = new FormData();
            formData.append('upload', fs.createReadStream(imagePath));

            // Enviamos la foto a la IA especializada en autos
            const response = await axios.post(
                'https://api.platerecognizer.com/v1/plate-reader/',
                formData,
                {
                    headers: {
                        ...formData.getHeaders(),
                        'Authorization': `Token ${TOKEN}`
                    }
                }
            );

            // Si la IA encontró una placa en la foto
            if (response.data.results && response.data.results.length > 0) {
                const placaId = response.data.results[0].plate.toUpperCase();
                console.log(`🤖 IA de Placas detectó con éxito: ${placaId}`);
                return placaId; 
            }
            
            console.log("❌ La IA analizó la foto pero no vio ninguna placa de vehículo.");
            return null; 

        } catch (error) {
            console.error("Error detallado en la API de IA:", error.response?.data || error.message);
            throw new Error("Falló la comunicación con la IA externa");
        }
    }
}

module.exports = AIService;