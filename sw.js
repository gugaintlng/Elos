/* =============================================================
   Elos — service worker
   Estratégia: cache-first com pré-carregamento completo.
   A aplicação é totalmente estática e não faz um único pedido a
   servidores externos, por isso vale a pena guardar tudo à
   primeira visita e nunca mais depender da rede. Numa sessão com
   um utente, uma falha de wi-fi não pode interromper nada.
   ============================================================= */

const VERSAO = 'elos-v1.9.2';

const ESSENCIAIS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './fontes/fontes.css',
  './fontes/bricolage-wght.woff2',
  './fontes/atkinson-400.woff2',
  './fontes/atkinson-700.woff2',
  './fontes/publicsans-400.woff2',
  './fontes/publicsans-500.woff2',
  './fontes/publicsans-600.woff2',
  './fontes/publicsans-700.woff2',
  './icones/icone-192.png',
  './icones/icone-512.png',
  './icones/icone-maskable-512.png',
  './icones/apple-touch-icon.png',
  './icones/favicon-32.png',
  './icones/icone.svg'
];

/* Instalar: guardar tudo antes de assumir o controlo. */
self.addEventListener('install', evento => {
  evento.waitUntil(
    caches.open(VERSAO)
      .then(cache => cache.addAll(ESSENCIAIS))
      .then(() => self.skipWaiting())
  );
});

/* Ativar: apagar versões antigas para não acumular lixo no tablet. */
self.addEventListener('activate', evento => {
  evento.waitUntil(
    caches.keys()
      .then(chaves => Promise.all(chaves.filter(c => c !== VERSAO).map(c => caches.delete(c))))
      .then(() => self.clients.claim())
  );
});

/* Responder: cache primeiro. Se não estiver em cache, ir à rede e
   guardar. Se a rede falhar numa navegação, devolver a aplicação. */
self.addEventListener('fetch', evento => {
  const pedido = evento.request;
  if(pedido.method !== 'GET') return;
  if(new URL(pedido.url).origin !== self.location.origin) return;

  evento.respondWith(
    caches.match(pedido, { ignoreSearch: true }).then(guardado => {
      if(guardado) return guardado;
      return fetch(pedido)
        .then(resposta => {
          if(resposta && resposta.status === 200 && resposta.type === 'basic'){
            const copia = resposta.clone();
            caches.open(VERSAO).then(c => c.put(pedido, copia));
          }
          return resposta;
        })
        .catch(() => {
          if(pedido.mode === 'navigate') return caches.match('./index.html');
          return new Response('', { status: 504, statusText: 'Sem rede' });
        });
    })
  );
});

/* Permitir que a aplicação force a atualização quando o utilizador
   aceita instalar a nova versão. */
self.addEventListener('message', evento => {
  if(evento.data === 'atualizar') self.skipWaiting();
});
