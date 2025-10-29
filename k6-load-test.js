import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// 📊 Métrica personalizada de errores
const errorRate = new Rate('errors');

// ⚙️ Configuración de la prueba
export const options = {
  stages: [
    { duration: '30s', target: 10 }, // Subida a 10 usuarios
    { duration: '1m', target: 10 },  // Mantener 10 usuarios
    { duration: '30s', target: 20 }, // Pico de 20 usuarios
    { duration: '30s', target: 0 },  // Descenso
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% de peticiones < 2s
    http_req_failed: ['rate<0.1'],     // Errores HTTP < 10%
    errors: ['rate<0.1'],              // Errores personalizados < 10%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://127.0.0.1:4173';

// 🔧 Setup: se ejecuta una vez antes de iniciar las pruebas
export function setup() {
  console.log(`Iniciando pruebas contra: ${BASE_URL}`);
  return { startTime: new Date().toISOString() };
}

// 🧩 Escenario 1: carga de la página principal
function testMainPage() {
  const res = http.get(BASE_URL);
  const success = check(res, {
    'Status 200': (r) => r.status === 200,
    'Tiempo de respuesta < 2s': (r) => r.timings.duration < 2000,
  });
  errorRate.add(!success);
  return success;
}

// 🛒 Escenario 2: navegación en la vista de productos
function testProductsView() {
  const mainPage = http.get(BASE_URL);
  const mainSuccess = check(mainPage, {
    'App Shell carga': (r) => r.status === 200,
    'Contenido presente': (r) => r.body?.length > 0,
  });
  errorRate.add(!mainSuccess);
  sleep(1); // Simular tiempo del usuario

  const interaction = http.get(BASE_URL);
  const interactionSuccess = check(interaction, {
    'Vista de productos responde': (r) => r.status === 200,
    'Contenido carga < 1.5s': (r) => r.timings.duration < 1500,
  });
  errorRate.add(!interactionSuccess);
  return mainSuccess && interactionSuccess;
}

// 🔄 Escenario 3: recarga de página (simula caché/PWA)
function testPageReload() {
  const res = http.get(BASE_URL);
  const success = check(res, {
    'Recarga exitosa': (r) => r.status === 200,
    'Recarga rápida < 1s': (r) => r.timings.duration < 1000,
  });
  errorRate.add(!success);
  return success;
}

// 🚀 Función principal: simula comportamiento de un usuario real
export default function () {
  testMainPage();
  sleep(2);

  testProductsView();
  sleep(3);

  testPageReload();
  sleep(1);
}

// 🧹 Teardown: se ejecuta al finalizar todas las pruebas
export function teardown(data) {
  console.log(`Pruebas finalizadas.`);
  console.log(`Inicio: ${data.startTime}`);
  console.log(`Fin: ${new Date().toISOString()}`);
}
