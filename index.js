import { generateInvitationPDF } from './pdfGenerator.js';
import QRCode from 'qrcode';
import { randomUUID } from 'crypto';
import fs from 'fs';

// DATOS DE PRUEBA (simula tu body del backend)
const testData = {
    name: "Leonardo Daniel Domínguez Olvera",
    degree: "Sistemas Computacionales",
    group: "7CM1", 
    degree_method: "Curricular",
    hour: "8:00 AM",
    ceremony_number: "43"
};

// FUNCIÓN PARA GENERAR QRs DE PRUEBA
const generateTestQRs = async (studentName) => {
    const qrCodes = [];
    
    for (let i = 0; i < 3; i++) {
        const ticketId = `${studentName.replace(/\s+/g, '')}-${randomUUID()}-${i + 1}`;
        const qrData = `http://localhost:5173/invitations/${ticketId}`;
        const qrCode = await QRCode.toDataURL(qrData);
        qrCodes.push(qrCode);
    }
    
    return qrCodes;
};

// FUNCIÓN PRINCIPAL DE PRUEBA
const runTest = async () => {
    try {
        console.log('🚀 Iniciando generación de PDF de prueba...');
        
        // Generar QRs de prueba
        console.log('📱 Generando códigos QR...');
        const qrCodes = await generateTestQRs(testData.name);
        console.log(`✅ ${qrCodes.length} códigos QR generados`);
        
        console.log('📊 Datos del estudiante:', {
            ...testData,
            qrCodes: `${qrCodes.length} códigos generados`
        });
        
        // Generar PDF
        console.log('📄 Generando PDF con Puppeteer...');
        const pdfBuffer = await generateInvitationPDF(qrCodes, testData);
        
        // Guardar PDF
        const fileName = `invitacion-${Date.now()}.pdf`;
        fs.writeFileSync(fileName, pdfBuffer);
        
        console.log(`✅ PDF generado exitosamente: ${fileName}`);
        console.log(`📁 Tamaño del archivo: ${(pdfBuffer.length / 1024).toFixed(2)} KB`);
        console.log(`📂 Ubicación: ${process.cwd()}\\${fileName}`);
        
    } catch (error) {
        console.error('❌ Error durante la generación:', error.message);
        console.error('📝 Stack trace:', error.stack);
    }
};

// Ejecutar prueba
runTest();