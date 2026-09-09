const DEFAULT_DATA = {
  sito: { nome: "Nome Cognome", ruolo: "Teologo sistematico", bio: "" },
  categorie: [
    { id: "pubblicazioni", label: "Pubblicazioni", items: [] },
    { id: "articoli", label: "Articoli", items: [] },
    { id: "corsi", label: "Corsi", items: [] },
    { id: "video", label: "Video", items: [] },
    { id: "link", label: "Link", items: [] }
  ]
};

let dati = null;

async function avvia() {
  try {
    const risposta = await fetch('data.json', { cache: 'no-store' });
    if (!risposta.ok) throw new Error();
    dati = await risposta.json();
    imposta('Contenuti attuali del sito caricati automaticamente.');
  } catch {
    dati = JSON.parse(JSON.stringify(DEFAULT_DATA));
    imposta('Nessun sito pubblicato trovato: parti da zero o carica un data.json.');
  }
}

function imposta(messaggioStato) {
  document.getElementById('in-nome').value = dati.sito.nome || '';
  document.getElementById('in-ruolo').value = dati.sito.ruolo || '';
  document.getElementById('in-bio').value = dati.sito.bio || '';

  const select = document.getElementById('in-cat');
  select.innerHTML = '';
  dati.categorie.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat.id;
    opt.textContent = cat.label;
    select.appendChild(opt);
  });

  renderListe();
  if (messaggioStato) segnalaStato(messaggioStato);
}

function raccogliDatiSito() {
  dati.sito.nome = document.getElementById('in-nome').value.trim() || 'Nome Cognome';
  dati.sito.ruolo = document.getElementById('in-ruolo').value.trim();
  dati.sito.bio = document.getElementById('in-bio').value.trim();
}

function renderListe() {
  const contenitore = document.getElementById('liste');
  contenitore.innerHTML = '';
  dati.categorie.forEach(cat => {
    const blocco = document.createElement('div');
    blocco.className = 'lista-admin';
    blocco.innerHTML = `<h2>${escapeHtml(cat.label)} (${cat.items.length})</h2>`;

    if (cat.items.length === 0) {
      const vuoto = document.createElement('p');
      vuoto.className = 'vuoto';
      vuoto.textContent = 'Nessuna voce.';
      blocco.appendChild(vuoto);
    }

    cat.items.forEach((voce, indice) => {
      const riga = document.createElement('div');
      riga.className = 'voce-admin';

      const testo = document.createElement('div');
      testo.className = 'voce-admin-testo';
      testo.innerHTML = `
        <div class="voce-titolo">${escapeHtml(voce.title)}</div>
        <div class="voce-meta">${[voce.year, voce.url].filter(Boolean).map(escapeHtml).join(' · ')}</div>
        ${voce.note ? `<div class="voce-nota">${escapeHtml(voce.note)}</div>` : ''}
      `;

      const azioni = document.createElement('div');
      azioni.className = 'voce-admin-azioni';

      const su = document.createElement('button');
      su.textContent = '↑';
      su.title = 'Sposta su';
      su.disabled = indice === 0;
      su.onclick = () => { spostaVoce(cat, indice, -1); };

      const giu = document.createElement('button');
      giu.textContent = '↓';
      giu.title = 'Sposta giù';
      giu.disabled = indice === cat.items.length - 1;
      giu.onclick = () => { spostaVoce(cat, indice, 1); };

      const elimina = document.createElement('button');
      elimina.textContent = '✕';
      elimina.title = 'Elimina';
      elimina.onclick = () => {
        if (confirm(`Eliminare «${voce.title}»?`)) {
          cat.items.splice(indice, 1);
          renderListe();
          segnalaStato('Voce eliminata. Ricordati di scaricare il file per salvare.');
        }
      };

      azioni.append(su, giu, elimina);
      riga.append(testo, azioni);
      blocco.appendChild(riga);
    });

    contenitore.appendChild(blocco);
  });
}

function spostaVoce(cat, indice, delta) {
  const nuovoIndice = indice + delta;
  if (nuovoIndice < 0 || nuovoIndice >= cat.items.length) return;
  [cat.items[indice], cat.items[nuovoIndice]] = [cat.items[nuovoIndice], cat.items[indice]];
  renderListe();
}

function escapeHtml(testo) {
  const d = document.createElement('div');
  d.textContent = testo == null ? '' : String(testo);
  return d.innerHTML;
}

function segnalaStato(messaggio) {
  const stato = document.getElementById('stato');
  stato.textContent = messaggio;
}

document.getElementById('btn-aggiungi').addEventListener('click', () => {
  const catId = document.getElementById('in-cat').value;
  const titolo = document.getElementById('in-titolo').value.trim();
  const url = document.getElementById('in-url').value.trim();
  const anno = document.getElementById('in-anno').value.trim();
  const nota = document.getElementById('in-nota').value.trim();

  if (!titolo) {
    segnalaStato('Inserisci almeno un titolo prima di aggiungere la voce.');
    document.getElementById('in-titolo').focus();
    return;
  }

  const cat = dati.categorie.find(c => c.id === catId);
  cat.items.push({ title: titolo, url: url || undefined, year: anno || undefined, note: nota || undefined });

  document.getElementById('in-titolo').value = '';
  document.getElementById('in-url').value = '';
  document.getElementById('in-anno').value = '';
  document.getElementById('in-nota').value = '';
  document.getElementById('in-titolo').focus();

  renderListe();
  segnalaStato(`«${titolo}» aggiunta a ${cat.label}. Ricordati di scaricare il file per salvare.`);
});

document.getElementById('btn-scarica').addEventListener('click', () => {
  raccogliDatiSito();
  const blob = new Blob([JSON.stringify(dati, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'data.json';
  a.click();
  URL.revokeObjectURL(url);
  segnalaStato('File scaricato. Ora sostituisci data.json sul tuo sito pubblicato.');
});

document.getElementById('btn-reset').addEventListener('click', () => {
  if (confirm('Ricominciare da zero? Le voci non salvate andranno perse.')) {
    dati = JSON.parse(JSON.stringify(DEFAULT_DATA));
    imposta('Ricominciato da zero.');
  }
});

document.getElementById('file-input').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const lettore = new FileReader();
  lettore.onload = (ev) => {
    try {
      dati = JSON.parse(ev.target.result);
      imposta(`File «${file.name}» caricato.`);
    } catch {
      segnalaStato('Il file scelto non è un JSON valido.');
    }
  };
  lettore.readAsText(file);
});

// Salva automaticamente i cambi ai dati generali del sito nello stato in memoria
['in-nome', 'in-ruolo', 'in-bio'].forEach(id => {
  document.getElementById(id).addEventListener('input', raccogliDatiSito);
});

avvia();
