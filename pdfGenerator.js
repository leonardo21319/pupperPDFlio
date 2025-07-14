import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

export const generateInvitationPDF = async (qrCodes, studentData) => {
    console.log('🔧 Configurando Puppeteer...');
    
    const browser = await puppeteer.launch({
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu'
        ]
    });
    
    try {
        const page = await browser.newPage();
        
        // Configurar viewport para A4
        await page.setViewport({ width: 1200, height: 1600 });
        
        console.log('📄 Generando HTML optimizado para 4 páginas exactas...');
        const htmlContent = generateCompleteHTML(qrCodes, studentData);
        
        console.log('🌐 Cargando contenido HTML...');
        await page.setContent(htmlContent, { 
            waitUntil: 'networkidle0',
            timeout: 30000
        });
        
        console.log('📑 Generando PDF con 4 páginas exactas...');
        const pdfBuffer = await page.pdf({
            width: '8in',
            height: '10in',
            printBackground: true,
            preferCSSPageSize: false,
            margin: {
                top: '8mm',
                bottom: '8mm',
                left: '8mm', 
                right: '8mm'
            }
        });
        
        return Buffer.from(pdfBuffer);
        
    } finally {
        await browser.close();
        console.log('🔒 Puppeteer cerrado');
    }
};

const generateCompleteHTML = (qrCodes, body) => {
    // Convertir imágenes a base64 para embeber en el PDF
    const logoIPN = convertImageToBase64('./recursos/logo-ipn-guinda.png');
    const logoCECyT = convertImageToBase64('./recursos/CECyT2.png');
    const graphic43 = convertImageToBase64('./recursos/43logo.png');
    const fondoCuadros = convertImageToBase64('./recursos/cuadrostop.png');
    const fondoPie = convertImageToBase64('./recursos/cuadros.png');
    const fondoGeneral = convertImageToBase64('./recursos/fondo.png');

    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invitación - Entrega de Diplomas CECyT No. 2</title>
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f0f0f0;
            position: relative;
        }

        /* Capa para la opacidad del fondo principal */
        body::before {
            content: '';
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-image: url('${fondoGeneral}');
            background-repeat: repeat;
            background-size: auto;
            opacity: 0.6;
            z-index: -1;
        }

        /* Fondo específico para páginas QR */
        .qr-page-background {
            position: relative;
        }

        .qr-page-background::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-image: url('${fondoGeneral}');
            background-repeat: repeat;
            background-size: auto;
            opacity: 0.6;
            z-index: 0;
        }

        .page {
            page-break-after: always;
            height: 10in;
            width: 8in;
            margin: 0 auto;
            overflow: hidden;
            display: flex;
            flex-direction: column;
        }

        .page:last-child {
            page-break-after: auto;
        }

        .main-wrapper {
            width: 100%;
            height: 100%;
            position: relative;
            background-color: #ffffff;
            display: flex;
            flex-direction: column;
        }

        .header-top-strip {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            padding: 8px 20px;
            background-color: transparent;
            position: relative;
            z-index: 10;
            height: 80px;
            flex-shrink: 0;
        }

        .header-top-strip img {
            padding-top: 5px;
            max-height: 70px;
            width: auto;
        }

        .graphic-43 {
            position: absolute;
            top: -5px;
            left: 50%;
            transform: translateX(-50%);
            max-width: 320px;
            height: auto;
            z-index: 11;
        }

        .header-background-container {
            width: 100%;
            margin-top: -80px;
            height: 90px;
            background-image: url('${fondoCuadros}');
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            position: relative;
            z-index: 5;
            background-color: transparent;
            flex-shrink: 0;
        }

        .main-content-area {
            background-color: #ffffff;
            padding: 20px 40px 15px;
            position: relative;
            text-align: center;
            z-index: 1;
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: space-around;
            margin-top: -40px;
            padding-top: 60px;
        }

        .invitation-text-block {
            text-align: center;
            line-height: 1.5;
            font-size: 1.1em;
            color: #333;
            max-width: 600px;
            margin: 0 auto 15px;
        }
        
        .invitation-text-block p {
            margin: 3px 0;
        }
        
        .invitation-text-block strong {
            color: #4CAF50;
            font-size: 1.2em;
        }

        .student-data {
            text-align: center;
            line-height: 1.6;
            font-size: 1em;
            color: #333;
            max-width: 600px;
            margin: 15px auto;
        }

        .student-data p {
            margin: 3px 0;
        }

        .event-details {
            margin-top: 15px;
            text-align: center;
            line-height: 1.5;
            font-size: 1.1em;
            color: #333;
            max-width: 600px;
            margin-left: auto;
            margin-right: auto;
        }
        
        .event-details p {
             margin: 3px 0;
        }

        .important-note {
            margin-top: 15px;
            padding: 12px;
            background-color: #fff3cd;
            border-left: 5px solid #ffc107;
            color: #664d03;
            font-weight: bold;
            text-align: center;
            max-width: 600px;
            margin-left: auto;
            margin-right: auto;
        }
        
        .important-note p {
            margin: 3px 0;
        }

        .footer {
            background-image: url('${fondoPie}');
            background-repeat: repeat;
            background-size: auto;
            padding: 25px 0 20px 0;
            text-align: center;
            position: relative;
            height: 80px;
            background-color: transparent;
            flex-shrink: 0;
        }

        .footer-career-container {
            background-color: #6a0dad;
            color: white;
            padding: 10px 25px;
            display: block;
            width: calc(100% - 50px);
            margin: 0 25px;
            box-sizing: border-box;
            border-radius: 5px;
            font-size: 1.6em;
            font-weight: bold;
            letter-spacing: 1px;
            position: absolute;
            bottom: 15px;
            left: 0;
            right: 0;
            white-space: normal;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }

        /* ESTILOS ESPECÍFICOS PARA PÁGINAS DE QR */
        .qr-content-area {
            background-color: #ffffff;
            padding: 25px 30px 15px;
            position: relative;
            text-align: center;
            z-index: 1;
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            margin-top: -50px;
            padding-top: 80px;
        }

        .qr-title {
            font-size: 1.4em;
            color: #4CAF50;
            font-weight: bold;
            margin-bottom: 20px;
            text-align: center;
        }

        .qr-main-section {
            display: flex;
            justify-content: center;
            align-items: flex-start;
            gap: 25px;
            margin-bottom: 20px;
            flex-wrap: wrap;
            background-color: #ffffff;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .qr-container {
            padding: 15px;
            background: white;
            border: 3px solid #4CAF50;
            border-radius: 12px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.15);
            flex-shrink: 0;
        }

        .qr-code {
            width: 180px;
            height: 180px;
            display: block;
        }

        .student-info-box {
            background-color: #f8f9fa;
            border: 2px solid #4CAF50;
            border-radius: 8px;
            padding: 15px;
            max-width: 300px;
            text-align: left;
            flex-shrink: 0;
        }

        .student-info-box h3 {
            color: #4CAF50;
            margin-bottom: 10px;
            font-size: 1.1em;
            text-align: center;
        }

        .student-info-box p {
            margin: 5px 0;
            font-size: 0.9em;
        }

        .qr-instructions {
            background-color: #e8f5e8;
            border: 2px solid #4CAF50;
            border-radius: 8px;
            padding: 12px;
            max-width: 450px;
            margin: 10px auto;
        }

        .qr-instructions h4 {
            color: #4CAF50;
            margin-bottom: 8px;
            font-size: 1em;
            text-align: center;
        }

        .qr-instructions ul {
            text-align: left;
            margin: 0;
            padding-left: 16px;
        }

        .qr-instructions li {
            margin: 4px 0;
            font-size: 0.85em;
        }

        .qr-event-info {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            color: #664d03;
            padding: 12px;
            margin: 10px auto;
            max-width: 450px;
            border-radius: 0 8px 8px 0;
        }

        .qr-event-info p {
            margin: 3px 0;
            font-size: 0.9em;
            text-align: center;
        }

        @page {
            size: 8in 10in;
            margin: 8mm;
        }

        @media print {
            body::before { display: none; }
            .page { 
                margin: 0;
                width: 100%;
                height: 100vh;
            }
        }
    </style>
</head>
<body>

    <!-- PÁGINA 1: PORTADA -->
    <div class="page">
        <div class="main-wrapper">
            <div class="header-top-strip">
                <img src="${logoIPN}" alt="Logo IPN" class="header-logo-left">
                <img src="${graphic43}" alt="43 Generación 2022-2025 Entrega de diplomas Julio 2025" class="graphic-43">
                <img src="${logoCECyT}" alt="Logo CECyT No. 2" class="header-logo-right">
            </div>

            <div class="header-background-container"></div>

            <div class="main-content-area">
                <div class="invitation-text-block">
                    <p>La Dirección del Centro de Estudios Científicos</p>
                    <p>y Tecnológicos No. 2 "Miguel Bernard"</p>
                    <p>tiene el gusto de invitarle a la ${body.ceremony_number}° entrega de Diplomas</p>
                    <p>de Titulación de la Generación 2022 - 2025</p>
                    <p>de la carrera técnica en:</p>
                </div>
                
                <div class="career-highlight">
                    <p style="color: #4CAF50; font-size: 1.3em; font-weight: bold; margin: 3px 0;">${body.degree}</p>
                    <p style="color: #4CAF50; font-size: 1.3em; font-weight: bold; margin: 3px 0;">Turno Matutino</p>
                </div>

                <div class="event-details">
                    <p>Que se llevará a cabo el día 25 de julio del presente año en el</p>
                    <p>Auditorio A "Ing. Alejo Peralta" del Centro Cultural "Jaime Torres</p>
                    <p>Bodet" de la Unidad Profesional "Adolfo López Mateos" en</p>
                    <p>Zacatenco a las ${body.hour}.</p>
                </div>

                <div class="important-note">
                    <p>Una vez iniciada la ceremonia,</p>
                    <p>no se permite el acceso al auditorio.</p>
                </div>
            </div>

            <div class="footer">
                <div class="footer-career-container">
                    ${body.degree}
                </div>
            </div>
        </div>
    </div>

    <!-- PÁGINA 2: QR GRADUADO -->
    <div class="page qr-page-background">
        <div class="qr-page-background::before"></div>
        <div class="main-wrapper">
            <div class="header-top-strip">
                <img src="${logoIPN}" alt="Logo IPN" class="header-logo-left">
                <img src="${graphic43}" alt="43 Generación 2022-2025 Entrega de diplomas Julio 2025" class="graphic-43">
                <img src="${logoCECyT}" alt="Logo CECyT No. 2" class="header-logo-right">
            </div>

            <div class="header-background-container"></div>

            <div class="qr-content-area">
                <div class="qr-title">INVITACIÓN DEL GRADUADO</div>
                
                <div class="qr-main-section">
                    <div class="qr-container">
                        <img src="${qrCodes[0]}" class="qr-code" alt="Código QR Graduado"/>
                    </div>

                    <div class="student-info-box">
                        <h3>INFORMACIÓN DEL GRADUADO</h3>
                        <p><strong>Nombre:</strong> ${body.name}</p>
                        <p><strong>Carrera:</strong> ${body.degree}</p>
                        <p><strong>Grupo:</strong> ${body.group}</p>
                        <p><strong>Opción de titulación:</strong> ${body.degree_method}</p>
                        <p><strong>Lugar:</strong> Auditorio A "Ing. Alejo Peralta"</p>
                        <p><strong>Tipo de invitación:</strong> Graduado</p>
                    </div>
                </div>

                <div class="qr-event-info">
                    <p><strong>Fecha:</strong> 25 de julio del presente año</p>
                    <p><strong>Hora:</strong> ${body.hour}</p>
                    <p>Centro Cultural "Jaime Torres Bodet"</p>
                    <p>Unidad Profesional "Adolfo López Mateos" - Zacatenco</p>
                </div>
                
                <div class="qr-instructions">
                    <h4>INSTRUCCIONES DE USO</h4>
                    <ul>
                        <li>Este código QR es único e intransferible</li>
                        <li>Preséntalo el día del evento para acceder</li>
                        <li>Llega con 30 minutos de anticipación</li>
                        <li>Una vez iniciada la ceremonia, no se permite el acceso</li>
                    </ul>
                </div>
            </div>

            <div class="footer">
                <div class="footer-career-container">
                    ${body.degree}
                </div>
            </div>
        </div>
    </div>

    <!-- PÁGINA 3: QR ACOMPAÑANTE 1 -->
    <div class="page qr-page-background">
        <div class="main-wrapper">
            <div class="header-top-strip">
                <img src="${logoIPN}" alt="Logo IPN" class="header-logo-left">
                <img src="${graphic43}" alt="43 Generación 2022-2025 Entrega de diplomas Julio 2025" class="graphic-43">
                <img src="${logoCECyT}" alt="Logo CECyT No. 2" class="header-logo-right">
            </div>

            <div class="header-background-container"></div>

            <div class="qr-content-area">
                <div class="qr-title">INVITACIÓN ACOMPAÑANTE 1</div>
                
                <div class="qr-main-section">
                    <div class="qr-container">
                        <img src="${qrCodes[1]}" class="qr-code" alt="Código QR Acompañante 1"/>
                    </div>

                    <div class="student-info-box">
                        <h3>INFORMACIÓN DEL GRADUADO</h3>
                        <p><strong>Nombre:</strong> ${body.name}</p>
                        <p><strong>Carrera:</strong> ${body.degree}</p>
                        <p><strong>Grupo:</strong> ${body.group}</p>
                        <p><strong>Opción de titulación:</strong> ${body.degree_method}</p>
                        <p><strong>Lugar:</strong> Auditorio A "Ing. Alejo Peralta"</p>
                        <p><strong>Tipo de invitación:</strong> Acompañante 1</p>
                    </div>
                </div>

                <div class="qr-event-info">
                    <p><strong>Fecha:</strong> 25 de julio del presente año</p>
                    <p><strong>Hora:</strong> ${body.hour}</p>
                    <p>Centro Cultural "Jaime Torres Bodet"</p>
                    <p>Unidad Profesional "Adolfo López Mateos" - Zacatenco</p>
                </div>
                
                <div class="qr-instructions">
                    <h4>INSTRUCCIONES DE USO</h4>
                    <ul>
                        <li>Este código QR es único e intransferible</li>
                        <li>Preséntalo el día del evento para acceder</li>
                        <li>Llega con 30 minutos de anticipación</li>
                        <li>Una vez iniciada la ceremonia, no se permite el acceso</li>
                    </ul>
                </div>
            </div>

            <div class="footer">
                <div class="footer-career-container">
                    ${body.degree}
                </div>
            </div>
        </div>
    </div>

    <!-- PÁGINA 4: QR ACOMPAÑANTE 2 -->
    <div class="page qr-page-background">
        <div class="main-wrapper">
            <div class="header-top-strip">
                <img src="${logoIPN}" alt="Logo IPN" class="header-logo-left">
                <img src="${graphic43}" alt="43 Generación 2022-2025 Entrega de diplomas Julio 2025" class="graphic-43">
                <img src="${logoCECyT}" alt="Logo CECyT No. 2" class="header-logo-right">
            </div>

            <div class="header-background-container"></div>

            <div class="qr-content-area">
                <div class="qr-title">INVITACIÓN ACOMPAÑANTE 2</div>
                
                <div class="qr-main-section">
                    <div class="qr-container">
                        <img src="${qrCodes[2]}" class="qr-code" alt="Código QR Acompañante 2"/>
                    </div>

                    <div class="student-info-box">
                        <h3>INFORMACIÓN DEL GRADUADO</h3>
                        <p><strong>Nombre:</strong> ${body.name}</p>
                        <p><strong>Carrera:</strong> ${body.degree}</p>
                        <p><strong>Grupo:</strong> ${body.group}</p>
                        <p><strong>Opción de titulación:</strong> ${body.degree_method}</p>
                        <p><strong>Lugar:</strong> Auditorio A "Ing. Alejo Peralta"</p>
                        <p><strong>Tipo de invitación:</strong> Acompañante 2</p>
                    </div>
                </div>

                <div class="qr-event-info">
                    <p><strong>Fecha:</strong> 25 de julio del presente año</p>
                    <p><strong>Hora:</strong> ${body.hour}</p>
                    <p>Centro Cultural "Jaime Torres Bodet"</p>
                    <p>Unidad Profesional "Adolfo López Mateos" - Zacatenco</p>
                </div>
                
                <div class="qr-instructions">
                    <h4>INSTRUCCIONES DE USO</h4>
                    <ul>
                        <li>Este código QR es único e intransferible</li>
                        <li>Preséntalo el día del evento para acceder</li>
                        <li>Llega con 30 minutos de anticipación</li>
                        <li>Una vez iniciada la ceremonia, no se permite el acceso</li>
                    </ul>
                </div>
            </div>

            <div class="footer">
                <div class="footer-career-container">
                    ${body.degree}
                </div>
            </div>
        </div>
    </div>

</body>
</html>
    `;
};

// Función para convertir imágenes a base64
const convertImageToBase64 = (imagePath) => {
    try {
        if (fs.existsSync(imagePath)) {
            const imageBuffer = fs.readFileSync(imagePath);
            const base64 = imageBuffer.toString('base64');
            const ext = path.extname(imagePath).substring(1);
            return `data:image/${ext};base64,${base64}`;
        } else {
            console.warn(`⚠️ Imagen no encontrada: ${imagePath}`);
            return generatePlaceholderImage(imagePath);
        }
    } catch (error) {
        console.warn(`⚠️ Error cargando imagen ${imagePath}:`, error.message);
        return generatePlaceholderImage(imagePath);
    }
};

// Generar imagen placeholder si no existe la imagen real
const generatePlaceholderImage = (imagePath) => {
    const filename = path.basename(imagePath);
    if (filename.includes('ipn')) {
        return `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%238b1538"/><text x="50" y="55" text-anchor="middle" fill="white" font-size="20" font-weight="bold">IPN</text></svg>`;
    } else if (filename.includes('CECyT')) {
        return `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><polygon points="50,10 90,30 90,70 50,90 10,70 10,30" fill="%234CAF50"/><text x="50" y="35" text-anchor="middle" fill="white" font-size="12" font-weight="bold">CECyT</text><text x="50" y="55" text-anchor="middle" fill="white" font-size="16" font-weight="bold">2</text></svg>`;
    } else if (filename.includes('43')) {
        return `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 100"><rect width="300" height="100" rx="20" fill="%234CAF50"/><text x="150" y="35" text-anchor="middle" fill="white" font-size="16" font-weight="bold">43° Generación 2022-2025</text><text x="150" y="65" text-anchor="middle" fill="white" font-size="12">Entrega de diplomas - Julio 2025</text></svg>`;
    }
    return `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23cccccc"/><text x="50" y="50" text-anchor="middle" fill="white" font-size="12">IMG</text></svg>`;
};